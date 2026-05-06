# Note backend — Modèle Holiday + assignation aux branches

## Décisions de design (côté front)

Le front est figé sur ces choix. Le backend les suit.

1. **Relation Many-to-Many** entre `Holiday` et `Branch`, pas de FK directe.
2. **`branch_ids` au format UUID** dans les payloads (pas `branch_code`).
3. **Le backend déduit du `scope`** quand c'est possible — il n'a pas besoin de faire confiance au front pour les scopes `national` et `regional`.

## Modèle Django attendu

```python
class Holiday(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField()
    description = models.CharField(max_length=100)
    type = models.CharField(
        max_length=20,
        choices=[
            ('ferie', 'Férié'),
            ('local', 'Local'),
            ('interne', 'Interne'),
            ('election', 'Élection'),
            ('maintenance', 'Maintenance'),
            ('autre', 'Autre'),
        ],
        default='ferie',
    )
    scope = models.CharField(
        max_length=20,
        choices=[
            ('national', 'National'),
            ('regional', 'Régional'),
            ('branch', 'Succursale'),
            ('autre', 'Autre'),
        ],
        default='national',
    )
    department_code = models.CharField(max_length=20, null=True, blank=True)
    comment = models.TextField(max_length=500, blank=True)
    modified_by = models.CharField(max_length=100, blank=True)
    pending_assignment = models.BooleanField(default=True)

    # Relation M2M : qui est concerné par ce férié
    branches = models.ManyToManyField('Branch', related_name='holidays', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**À noter :** plus de champ `branch_code` sur `Holiday`. Si l'ancien existe en base, le supprimer après migration.

## Endpoints attendus

### `GET /holidays/`

Renvoie la liste complète des fériés. Chaque entrée doit inclure la liste des UUIDs de branches concernées :

```json
[
  {
    "id": "uuid",
    "date": "2026-01-01",
    "description": "Jour de l'An",
    "type": "ferie",
    "scope": "national",
    "department_code": null,
    "comment": "",
    "modified_by": "admin@caposa.ht",
    "pending_assignment": false,
    "branch_ids": ["uuid-1", "uuid-2", ...],
    "created_at": "...",
    "updated_at": "..."
  }
]
```

Note : `branch_ids` (et pas `branches`) au format `UUID[]` est ce que le front consomme. Le serializer Django doit le sérialiser ainsi (`PrimaryKeyRelatedField(many=True)` sur le ManyToMany).

### `PATCH /holidays/{id}/` — Assignation

Le front envoie ce payload pour assigner un férié à des branches :

```json
{
  "scope": "national" | "regional" | "branch" | "autre",
  "department_code": "OUEST" | null,
  "branch_ids": ["uuid-1", "uuid-2", ...],
  "pending_assignment": false,
  "comment": "raison saisie par l'admin"
}
```

**Logique attendue côté backend selon `scope` :**

- `scope='national'` → ignorer `branch_ids` du payload, lier `holiday.branches.set(Branch.objects.all())`. Mettre `department_code = null`.
- `scope='regional'` → ignorer `branch_ids` du payload, lier `holiday.branches.set(Branch.objects.filter(department_code=payload.department_code))`. Le `department_code` du payload est obligatoire.
- `scope='branch'` ou `'autre'` → utiliser `branch_ids` tel quel. Mettre `department_code = null`.

Dans tous les cas :
- Mettre `pending_assignment = False`.
- Enregistrer le `comment` et le `modified_by` dans le journal d'audit.

Le front envoie quand même `branch_ids` même pour `national`/`regional` (par sécurité, pour ne pas casser si la logique change). Le backend les ignore proprement.

### `POST /holidays/`

Création d'un férié. Le front envoie soit un brouillon (`pending_assignment: true`, pas de branches), soit un férié déjà assigné. Même logique que le PATCH côté `scope`.

### `DELETE /holidays/{id}/`

Suppression d'un férié. Le backend supprime l'entrée et la relation M2M est nettoyée automatiquement par Django.

## Validation côté backend (hard check)

Le front fait un soft check, mais le backend doit re-valider :

- `scope='regional'` exige `department_code` non vide → sinon HTTP 400.
- `scope='branch'` ou `'autre'` exige `branch_ids` non vide (sauf si `pending_assignment=true`) → sinon HTTP 400.
- `pending_assignment=true` court-circuite ces validations (un brouillon peut être incomplet).

## Migration depuis l'ancien modèle

Si l'ancien modèle avait `branch_code: string` polymorphe :

```python
# Pour chaque Holiday existant :
if h.scope == 'regional':
    h.department_code = h.branch_code   # déplacer
elif h.scope in ('branch', 'autre'):
    branch = Branch.objects.filter(branch_code=h.branch_code).first()
    if branch:
        h.branches.add(branch)           # ajouter à la M2M
elif h.scope == 'national':
    h.branches.set(Branch.objects.all()) # tout lier

h.branch_code = None  # nettoyer
h.save()
```

Puis dropper la colonne `branch_code` de la table `Holiday`.

## Ce que le front fait DÉJÀ

- Envoie le payload exact décrit ci-dessus (`AssignBranchesModal.handleSubmit`).
- Affiche l'erreur claire si le backend renvoie un 400.
- Gère le `pending_assignment` (brouillons).
- Garde un soft check côté formulaire (mais n'en dépend pas).

## Endpoint de relecture (à valider)

Pour la page `/dashboard/holidays`, le front affiche pour chaque férié la liste des branches concernées. Si `branch_ids: UUID[]` est inclus dans la réponse `GET /holidays/`, c'est suffisant — le front a déjà la liste des branches en parallèle (`fetchBranches`) et peut faire le mapping.

Si le backend préfère envoyer les objets complets sous `branches: Branch[]`, c'est OK aussi mais plus lourd. À la discrétion du backend selon les performances.