# 📋 CAPOSA — Note de travail
> Dernière mise à jour : 26 mars 2026
---
3 — Fermeture de la caisse
La caissière compte physiquement l’argent.

👉 Elle trouve :

80 000 HTG en bon état

1 billet de 500 HTG déchiré

Elle saisit dans CAPOSA :

Cash réel : 80 000 HTG

Anomalies :

Billet déchiré (500 HTG)

CAPOSA calcule l’écart :

Si théorique = 80 500 HTG

Réel = 80 000 HTG
➡️ Écart = -500 HTG
---
Étape 4 — Remise à la trésorerie
La caissière remet :

80 000 HTG cash

1 billet de 500 HTG déchiré (classé comme non valide)

Elle valide la remise.
CAPOSA génère :

Un bordereau de remise

Un statut “En attente de validation trésorerie”
---
## ✅ Ce qui est fait

### Design System
- Couleurs : vert `#2E7D32` / `#1B5E20`, surface `#DDEAD5`, bg `#F9F9F6`, bleu `#355C7D`, or `#D4AF37`
- Zéro HeroUI — tous les composants sont natifs Tailwind v4
- Headers des modals : blancs (icône `bg-[#DDEAD5]`), plus de headers verts

---

### Entité Branches (`app/components/branches/`)
| Fichier | Statut |
|---|---|
| `BrancheTable.tsx` | ✅ Table avec onglets Actifs/Inactifs, statut ternaire, tri, checkboxes |
| `BranchFilterBar.tsx` | ✅ Recherche + filtres taille/statut + Exporter/Nouvelle branche |
| `branchesGrid.tsx` | ✅ Layout principal — appels API directs, plus de BranchCard |
| `EditBranchModal.tsx` | ✅ Header blanc, create + edit, BranchFormFields |
| `BranchDetailsModal.tsx` | ✅ Header blanc, horaires, jours fériés |
| `DeleteBranchModal.tsx` | ✅ Soft delete (status: inactive) |
| `BranchFormFields.tsx` | ✅ HaitiLocationSelector, OpeningHourAutocomplete |
| `validations.ts` | ✅ opening_hour optionnel, DepartmentCode depuis haitiLocations |
| `EditBranch.tsx` | ⚠️ Page standalone — peut être supprimée si route /edit/[id] n'existe pas |

**Statut ternaire branches :**
- `active` = status active + opening_hour présent
- `needs_activation` = opening_hour présent + status inactive
- `missing_schedule` = pas d'opening_hour
- Backend persiste uniquement `"active" | "inactive"`

---

### Entité Postes (`app/components/postes/`)
| Fichier | Statut |
|---|---|
| `PostTable.tsx` | ✅ Table avec tri, checkboxes, badges permissions |
| `PostFilterBar.tsx` | ✅ Recherche + compteur, zéro HeroUI |
| `PostGrid.tsx` | ✅ Layout principal — appels API directs, plus de PostCard |
| `EditPostModal.tsx` | ✅ Header blanc, create + edit |
| `DeletePostModal.tsx` | ✅ **Soft delete** — ID employé requis (directeur ou maintenance) |
| `PostFormFields.tsx` | ✅ Tiles cliquables pour permissions |
| `validations.ts` | ✅ transfert (avec t), Post exporté |

**Soft delete postes :**
- Modal demande l'ID employé
- Backend vérifie que `employee.role in ["directeur", "maintenance"]`
- Si autorisé → `status: "inactive"` + `archived_by: employeeId`
- Si refusé → 403 → message d'erreur dans le modal

**À faire côté backend Django :**
```python
# Dans la vue PUT /posts/:id/
if request.data.get('status') == 'inactive':
    employee = get_object_or_404(Employee, id=request.data.get('archived_by'))
    if employee.role not in ['directeur', 'maintenance']:
        return Response({'detail': 'Non autorisé'}, status=403)
```

**Fichiers à supprimer :**
- `PostCard.tsx` — remplacé par PostTable
- `CreatePostModal.tsx` — remplacé par EditPostModal mode="create"
- `register-form.tsx` — utilisé uniquement par CreatePostModal

---

### Dashboard Caissier (`app/dashboard/(overview)/cashier/`)
| Fichier | Statut |
|---|---|
| `page.tsx` | ✅ 5 lignes, importe DashboardCaissier |
| `types.ts` | ✅ Types alignés Django (snake_case, `deposit/withdrawal/transfer/loan`) |
| `api.ts` | ✅ Mocks prêts, commentaires TODO pour chaque endpoint Django |
| `components/DashboardCaissier.tsx` | ✅ État local + appels API directs |
| `components/OpenSessionModal.tsx` | ✅ 5 champs : caissier, caisse, superviseur, montant, ID responsable |
| `components/CloseSessionModal.tsx` | ✅ Montant fermeture + calcul écart temps réel |

**Endpoints Django à créer :**
```
GET  /api/caisse/dashboard/          → DashboardData
POST /api/caisse/sessions/           → Ouvrir session
PATCH /api/caisse/sessions/:id/close/ → Fermer session
GET  /api/caisse/transactions/       → Transactions du jour
GET  /api/caisse/alerts/             → Alertes actives
```

**Pour brancher l'API**, dans `api.ts` chaque fonction a :
```ts
// Décommente ça :
// const { data } = await AxiosInstance.get('/caisse/dashboard/');
// return data;

// Supprime le mock en dessous
```

---

### Auth (`app/lib/auth.ts`)
| Fichier | Statut |
|---|---|
| `app/lib/auth.ts` | ✅ Rôle hardcodé temporaire, prêt pour Django |
| `app/dashboard/page.tsx` | ✅ Redirige selon le rôle |
| `AuthGuard.tsx` | ✅ Loader CAPOSA, logique null/false/true |

**Changer de rôle pour tester** — une ligne dans `app/lib/auth.ts` :
```ts
const MOCK_ROLE: UserRole = 'caissier'; // ← change ici
// Options : 'caissier' | 'directeur' | 'superviseur' | 'tresorier'
```

**Quand Django sera prêt :**
```ts
// Dans auth.ts
export function getRole(): UserRole {
  return localStorage.getItem('role') as UserRole;
}

// Dans ta fonction login
localStorage.setItem('token', data.access);
localStorage.setItem('role', data.user.role);
router.push('/dashboard');
```

---

## 🔲 À faire

### Frontend
- [ ] Dashboards directeur, superviseur, trésorier (dossiers vides)
- [ ] Modal réconciliation caissier
- [ ] Connecter `app/dashboard/page.tsx` à la vraie auth quand Django prêt
- [ ] Vérifier si route `/dashboard/branches/edit/[id]` existe — sinon supprimer `EditBranch.tsx`
- [ ] Filtrer postes inactifs dans `PostGrid` (`p.status !== "inactive"`)
- [ ] Ajouter `status?: "active" | "inactive"` dans `PostData`

### Backend Django
- [ ] Endpoints caisse (voir liste ci-dessus)
- [ ] Vérification rôle pour archivage postes
- [ ] `GET /api/caisse/dashboard/` retourne sessions + transactions + alertes + montant
- [ ] Login retourne `{ access, refresh, user: { id, nom, role } }`

---

## 📁 Structure des fichiers importants

```
app/
├── lib/
│   ├── auth.ts                    ← rôle utilisateur (MOCK_ROLE temporaire)
│   └── axiosInstance.ts           ← instance Axios avec token
├── dashboard/
│   ├── page.tsx                   ← redirection selon rôle
│   └── (overview)/
│       ├── cashier/
│       │   ├── page.tsx
│       │   ├── types.ts
│       │   ├── api.ts
│       │   └── components/
│       │       ├── DashboardCaissier.tsx
│       │       ├── OpenSessionModal.tsx
│       │       └── CloseSessionModal.tsx
│       ├── director/              ← à créer
│       ├── supervisor/            ← à créer
│       └── tresorier/             ← à créer
├── components/
│   ├── branches/                  ← ✅ complet
│   ├── postes/                    ← ✅ complet
│   └── accounts/                  ← ✅ (AccountGrid, AccountTable)
└── data/
    └── haitiLocations.ts          ← source unique départements/villes
```