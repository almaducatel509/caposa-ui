# 🔧 Alignement contrat API — Branches & OpeningHour

## Contexte
Le frontend utilise une définition Zod/TypeScript stricte pour les branches 
(voir `app/components/branches/validations.ts`). 
Plusieurs champs attendus ne sont pas renvoyés par l'API actuelle.

## Modifications demandées

### 1. `GET /branches/` — ajouter les champs manquants

Actuellement renvoyé :
- id, branch_code, branch_name, branch_address, branch_phone_number, branch_email
- number_of_posts, number_of_tellers, number_of_clerks, number_of_credit_officers  
- opening_date, opening_hour, holidays
- created_at, updated_at

### Champs INEXISTANTS dans le modèle actuel

Ces champs ne sont ni renvoyés en GET, ni acceptés en POST/PATCH 
(testé via Bruno : payload contenant `department_code` → silencieusement ignoré).
Ils doivent être ajoutés au modèle Django, à la migration, ET au serializer.
- `statusBranche` → enum `"active" | "inactive" | "archive"` 
  (calculé ou stocké — règle : active si opening_hour + holidays configurés ET status ≠ archive)
- `department_code` → enum des départements d'Haïti (OUEST, SUDEST, NORD, etc.)
- `city` → string

### 2. `GET /opening-hours/` — structure confirmée

Format actuel (OK) :
{
  "id": "uuid",
  "monday": "08:00-17:00",
  "tuesday": "08:00-17:00",
  ...,
  "created_at": "...",
  "updated_at": "..."
}

**Demande** : documenter officiellement que les jours absents = non travaillés, 
et que le format est bien `"HH:MM-HH:MM"`.

### 3. `GET /holidays/` — structure confirmée

Format actuel (OK) :
{
  "id": "uuid",
  "date": "YYYY-MM-DD",
  "description": "string",
  "created_at": "...",
  "updated_at": "..."
}

## Règle métier pour `statusBranche`

Une branche est :
- **`archive`** → action manuelle explicite via endpoint d'archivage
- **`active`** → a un `opening_hour` ET au moins 1 `holiday` configuré
**Préférence frontend** : `statusBranche` calculé côté backend (SerializerMethodField).
Raison : une seule source de vérité. Le frontend recalcule actuellement le même statut, 
ce qui crée un risque d'incohérence si la règle métier évolue.
- **`inactive`** → configuration incomplète (manque horaires ET/OU jours fériés)

Suggestion d'implémentation côté Django :

```python
class BranchSerializer(serializers.ModelSerializer):
    statusBranche = serializers.SerializerMethodField()
    
    def get_statusBranche(self, obj):
        if getattr(obj, 'status', None) == 'archive':
            return 'archive'
        if obj.opening_hour_id and obj.holidays.exists():
            return 'active'
        return 'inactive'
    
    class Meta:
        model = Branch
        fields = [
            'id', 'branch_code', 'branch_name', 'branch_address',
            'branch_phone_number', 'branch_email',
            'statusBranche',           # ← NOUVEAU
            'department_code',         # ← NOUVEAU (note en bas)
            'city',                    # ← NOUVEAU
            'number_of_posts', 'number_of_tellers', 
            'number_of_clerks', 'number_of_credit_officers',
            'opening_date', 'opening_hour', 'holidays',
            'created_at', 'updated_at',
        ]
```
## Pour department_code :
    Tu stockes le code du département directement dans la table Branch :
    TABLE branches
    ┌────┬─────────────┬──────────────────┐
    │ id │ branch_name │ department_code  │
    ├────┼─────────────┼──────────────────┤
    │ 1  │ Branch 3    │ "OUEST"          │
    │ 2  │ Tozin       │ "NORD"           │
    │ 3  │ Limonad     │ "OUEST"          │
    └────┴─────────────┴──────────────────┘
    Le département est juste un texte qui doit appartenir à une liste fixe : OUEST, NORD, SUD, etc.
Stocker comme CharField avec choices (les 10 départements d'Haïti sont une liste fixe). Pas besoin d'une table séparée.
``` python
    pythonDEPARTMENT_CHOICES = [
        ('OUEST',     'Ouest'),
        ('NORD',      'Nord'),
        ('NORD_EST',  'Nord-Est'),
        ('NORD_OUEST','Nord-Ouest'),
        ('SUD',       'Sud'),
        ('SUD_EST',   'Sud-Est'),
        ('CENTRE',    'Centre'),
        ('ARTIBONITE','Artibonite'),
        ('GRAND_ANSE','Grand-Anse'),
        ('NIPPES',    'Nippes'),
    ]
    department_code = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
```
## Payload cible pour POST /branches/

```json
{
  "branch_name": "Main Branch 2",
  "branch_address": "13 Main St",
  "branch_phone_number": "+123456786",
  "branch_email": "contact@mainbranch2.com",
  "department_code": "OUEST",
  "city": "Port-au-Prince",
  "number_of_posts": 10,
  "number_of_tellers": 5,
  "number_of_clerks": 3,
  "number_of_credit_officers": 2,
  "opening_date": "2024-09-19",
  "opening_hour": "bb597dbd-...",
  "holidays": ["6b113239-..."]
}
```

Note : `statusBranche` n'apparaît PAS dans le payload (calculé côté backend).

## Impact frontend si non fait
Le frontend doit actuellement calculer `statusBranche` et inférer le département, 
ce qui duplique la logique métier et risque des incohérences d'audit.