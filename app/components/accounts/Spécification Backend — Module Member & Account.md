# 📌 Spécification Backend — Module Member & Account

## 🏦 Système Caisse Populaire

---

# 🎯 Objectif

Ce document définit :

* l’entité **Member**
* l’entité **Account**
* leurs **CRUD respectifs**
* leurs relations
* et surtout les **règles métier strictes NON négociables**

⚠️ Ce système suit un modèle bancaire réel.

---

# 👤 1. ENTITÉ MEMBER

## 📦 Structure

```json id="m1"
{
  "id": "uuid",
  "first_name": "string",
  "last_name": "string",
  "id_number": "string",
  "email": "string | null",
  "phone_number": "string | null",
  "address": "string | null",
  "city": "string | null",
  "department": "string | null",
  "date_of_birthday": "YYYY-MM-DD",
  "gender": "string | null",
  "photo_profil": "string | null",
  "status": true,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 🔁 MEMBER CRUD

### ➕ Create Member

* id_number unique obligatoire
* validation des champs requis
* status = true par défaut

---

### 📖 Read Member

* accès par id
* inclut les comptes associés (optionnel)

---

### ✏️ Update Member

❌ INTERDIT :

* modifier `id_number` si déjà utilisé dans transactions/comptes
* changer identité fondamentale (logique bancaire)

✔ autorisé :

* contact info
* adresse
* photo
* status

---

### 🗑 Delete Member

❌ interdit si :

* comptes actifs existants

✔ autorisé uniquement si :

* aucun compte actif
* audit log obligatoire

---

## 🔗 RELATION MEMBER

* 1 Member → N Accounts
* un Member doit avoir au moins 1 Account actif
* suppression Member bloque si accounts existants

---

# 🏦 2. ENTITÉ ACCOUNT

## 📦 Structure

```json id="a1"
{
  "id": "uuid",
  "account_number": "string (unique)",
  "member": "uuid (FK)",
  "account_type": "string",
  "balance": "string (decimal)",
  "account_status": true,

  "created_by": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 🧠 TYPES DE COMPTE

* epargne
* cheques
* terme (CPG)

---

# 🔁 ACCOUNT CRUD

## ➕ Create Account

### Règles obligatoires :

* member doit exister
* account_number unique
* typeCompte obligatoire
* dépôt initial respecté (selon type)
* account_status = actif

❌ interdit :

* créer account sans member
* créer account sans type

---

## 📖 Read Account

* accès par id
* ou par member_id
* inclut balance et statut

---

## ✏️ Update Account

### 🔒 Champs IMMUTABLES

❌ jamais modifiables :

* account_number
* member
* account_type
* created_at

👉 modification = fermeture + recréation

---

### ✔ autorisé :

* account_status
* limites (selon type)
* frais
* dateFermeture

---

## 🗑 Delete Account

❌ interdit en production bancaire

✔ remplacé par :

* fermeture logique uniquement

---

# 🔗 3. RELATION MEMBER ↔ ACCOUNT

## Règles

* Account appartient à 1 Member
* Member peut avoir plusieurs Accounts
* Aucun Account orphelin autorisé
* suppression Member bloquée si Accounts existants

---

# 🚨 4. RÈGLES MÉTIER (CRITIQUES)

---

## 💰 4.1 SOLDE

❌ interdit :

```text id="x1"
account.balance = X
```

✔ autorisé uniquement via :

* deposit
* withdrawal
* interest (backend)
* fees (backend)

---

## 🧾 4.2 INTÉGRITÉ FINANCIÈRE

* backend = seule source de vérité
* frontend = affichage uniquement

---

## 🔒 4.3 CHAMPS IMMUTABLES

* account_number
* member
* account_type
* created_at

👉 modification = recréation obligatoire

---

## 🏁 4.4 FERMETURE ACCOUNT

Conditions :

* balance = 0
* statut = fermé
* dateFermeture obligatoire

❌ interdit :

* fermer avec solde > 0
* réouvrir un compte fermé

---

## 🔄 4.5 STATUTS ACCOUNT

```ts id="s1"
ouvert      → actif
fermé       → read-only
gelé        → bloqué temporairement
en_attente  → validation
```

---

## 💳 4.6 RÈGLES PAR TYPE

### 🐷 Épargne

* 6 retraits gratuits / mois
* frais après dépassement
* intérêt mensuel composé

---

### 💳 Chèques

* frais mensuels
* limite retrait quotidienne
* solde minimum recommandé

---

### 📈 CPG

* aucun retrait avant échéance
* intérêts simples
* pénalité retrait anticipé

---

## 📊 4.7 INTÉRÊTS (BACKEND ONLY)

### Épargne

```text id="i1"
interest = balance × rate / 12
```

---

### CPG

```text id="i2"
interest = principal × rate × years
```

---

⚠️ règles :

* jamais frontend
* calcul backend uniquement
* doit générer une transaction système (log)

---

## 🧠 4.8 VALIDATIONS

### Create Account

* member existe
* typeCompte obligatoire
* account_number unique
* dépôt initial valide

---

### Update Account

* respect champs immutables
* validation statut
* validation solde avant fermeture

---

# 📡 5. API CONTRACT

## 👤 Member

```
POST   /api/members
GET    /api/members/:id
PUT    /api/members/:id
DELETE /api/members/:id
```

---

## 🏦 Account

```
POST   /api/accounts
GET    /api/accounts/:id
GET    /api/accounts?member_id=
PUT    /api/accounts/:id
PUT    /api/accounts/:id/status
DELETE /api/accounts/:id (soft delete → fermeture)
```

---

# ⚠️ 6. PRINCIPES ARCHITECTURAUX

## ❌ INTERDIT

* modifier balance directement
* bypass validation métier
* changer account_type
* supprimer account actif sans clôture
* créer account sans member

---

## ✅ OBLIGATOIRE

* validation backend stricte
* audit log de chaque action
* séparation logique :

```
Member Service
Account Service
Validation Service
Interest Service
```

---

# 🧠 7. RESPONSABILITÉS BACKEND

## 1. Intégrité des données

aucune corruption possible

## 2. cohérence bancaire

règles identiques à une caisse réelle

## 3. traçabilité

toutes actions loggées

## 4. sécurité

contrôle d’accès par rôle

---

# 📌 8. RÉSUMÉ

* Member = identité humaine
* Account = produit bancaire
* balance = jamais modifié directement
* backend = autorité unique
* rules = strictement bancaires

---

# 🚨 MESSAGE FINAL

> Toute déviation de ces règles rend le système non conforme à un modèle bancaire réel (type caisse populaire).
> Ces règles doivent être appliquées strictement sans exception.

---

Si tu veux, prochaine étape je peux te faire :

🔥 ERD diagram ultra propre
🔥 Swagger OpenAPI complet
🔥 ou backend Django DRF structuré (models + services + permissions + business rules)

Dis-moi.
