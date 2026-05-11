# ## Contexte métier

Un **compte** appartient à un **membre** (relation `ForeignKey`). Un membre peut avoir plusieurs comptes (épargne, chèques, terme). L'UI affiche une liste de comptes avec le membre titulaire, permet de voir le détail, et de gérer le cycle de vie du compte (ouverture, gel, fermeture, archivage).

## Modèle `Account` — champs attendus

```
id              : UUID (PK)
account_number  : string (unique, format: bloc_membre-bloc_produit-séquence)
member          : UUID (FK vers Member)
account_type    : string ("Savings Account" | "Checking Account" | "Term Deposit Account")
balance         : decimal (string en JSON)
account_status  : enum string → "open" | "frozen" | "closed" | "pending" | "archived"
created_by      : UUID (utilisateur)
created_at      : datetime ISO
updated_at      : datetime ISO

# Optionnels selon le type de compte
date_fermeture            : date (requis si status = "closed")
taux_interet              : decimal (comptes à terme uniquement)
limite_retrait            : decimal (comptes chèques uniquement)
limite_credit             : decimal (comptes chèques uniquement)
frais_service_mensuel     : decimal
date_echeance             : date (comptes à terme uniquement)
maturite_atteinte         : boolean (calculé : aujourd'hui >= date_echeance)
```

## ⚠️ Important : `account_status` doit être un enum string, pas un boolean

Un compte bancaire a 5 états réels, pas 2. Un boolean est insuffisant :

- `open` → actif, transactions autorisées
- `frozen` → gelé temporairement (fraude, décès, litige, ordre légal)
- `closed` → fermé définitivement, solde = 0
- `pending` → créé mais pas encore activé (KYC, approbation)
- `archived` → fermé depuis longtemps, archivé pour conformité

## Endpoints requis

```
GET    /api/accounts/              → liste paginée (avec member_details hydraté)
GET    /api/accounts/{id}/         → détail d'un compte
POST   /api/accounts/              → création (status par défaut = "pending")
PATCH  /api/accounts/{id}/         → modification (statut, frais, taux, limites)
GET    /api/accounts/?member={id}  → comptes d'un membre donné
GET    /api/accounts/?status=open  → filtrage par statut
```

## Hydratation du membre

Sur `GET /api/accounts/`, l'UI a besoin du membre titulaire pour afficher son nom et email **sans faire un second appel**. Idéalement :

```json
{
  "id": "...",
  "account_number": "ACC1001",
  "member": "uuid-du-membre",
  "member_details": {
    "id": "...",
    "first_name": "Jean",
    "last_name": "Paul",
    "email": "jean@...",
    "phone_number": "...",
    "id_number": "..."
  },
  "account_type": "Savings Account",
  "balance": "45000.00",
  "account_status": "open",
  "created_at": "2024-01-12T10:30:00Z"
}
```

## Règles métier à valider côté backend

1. **Fermeture (`closed`)** → solde doit être à 0, `date_fermeture` requise
2. **Transitions de statut autorisées** :
   - `pending` → `open` ou `closed`
   - `open` → `frozen` ou `closed`
   - `frozen` → `open` ou `closed`
   - `closed` → `archived`
   - `archived` → état terminal (aucune transition)
3. **Compte à terme** → fermeture avant `date_echeance` = pénalité (à définir)
4. **`taux_interet`** modifiable uniquement pour `account_type = terme`
5. **`limite_retrait` / `limite_credit`** modifiables uniquement pour `account_type = cheques`

## Ce que je peux fournir si utile

- Le fichier TypeScript des types et de la validation Zod côté front (peut servir de référence pour le serializer DRF)
- Les libellés UI français (juste pour l'affichage, pas dans la BDD)
