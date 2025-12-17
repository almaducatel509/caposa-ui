# 📋 Normes Bancaires - Caisse Populaire

## 🎯 Objectifs
Garantir que l'application respecte les pratiques bancaires réelles des caisses populaires québécoises et canadiennes.

---

## ✅ Normes Implémentées

### 1. **Séparation Frontend/Backend des Règles Métier**
- ❌ **Interdit:** Hardcoder des montants, taux, ou limites dans le frontend
- ✅ **Requis:** Tous les paramètres métier doivent venir d'une API
- ✅ **Implémenté via:** Hook `useBankSettings()` qui charge depuis `/api/settings/bank`

### 2. **Terminologie Bancaire Cohérente**
- **Compte Épargne** (pas "savings")
- **Compte Chèques** (pas "checking") 
- **Compte à Terme / CPG** (Certificat de Placement Garanti)
- **Retrait** (pas "withdrawal" dans l'UI)
- **Dépôt** (pas "deposit" dans l'UI)

### 3. **Champs Protégés (Read-Only)**
Les champs suivants ne peuvent JAMAIS être modifiés après création:
- ✅ Numéro de compte (`noCompte`)
- ✅ Titulaire du compte (`id_membre`)
- ✅ Type de compte (`typeCompte`)
- ✅ Date d'ouverture (`dateOuverture`)
- ✅ Solde actuel (modifié uniquement via transactions)

### 4. **Relation Membre-Compte**
- ✅ Un membre DOIT avoir au moins 1 compte (créé automatiquement)
- ✅ Un membre PEUT avoir plusieurs comptes (épargne + chèques + terme)
- ✅ Un compte appartient à UN SEUL membre (pas de comptes joints dans v1)

---

## 💰 Paramètres par Type de Compte

### 🐷 Compte Épargne
```json
{
  "minDeposit": 25,
  "minimumBalanceRequired": 100,        // ✅ NOUVEAU
  "interestRate": 0.5,
  "interestCalculation": "compound-monthly", // ✅ NOUVEAU
  "monthlyFees": 0,
  "lowBalanceFee": 3,                   // ✅ NOUVEAU
  "freeWithdrawalsPerMonth": 6,
  "feePerExtraWithdrawal": 1.5
}
```

**Caractéristiques:**
- Intérêts composés mensuellement (obligation légale d'affichage)
- Maximum 6 retraits gratuits par mois
- 1.50$ de frais par retrait additionnel
- Frais de 3$ si solde < 100$ (encourage maintien solde minimum)
- Idéal pour épargner à moyen terme

**⚠️ Attention:** Les "retraits illimités gratuits" n'existent pas dans la vraie vie!

---

### 💳 Compte Chèques
```json
{
  "minDeposit": 100,
  "minimumBalanceRequired": 500,        // ✅ NOUVEAU
  "interestRate": 0,
  "interestCalculation": "none",        // ✅ NOUVEAU
  "monthlyFees": 5,
  "lowBalanceFee": 10,                  // ✅ NOUVEAU
  "withdrawalLimit": 1000,
  "freeWithdrawalsPerMonth": 999
}
```

**Caractéristiques:**
- Transactions illimitées (frais mensuels requis)
- Carte de débit incluse
- Carnet de chèques gratuit
- Limite de 1000$ par jour aux guichets
- Frais réduits si solde ≥ 500$

**Note:** Les frais mensuels donnent accès aux services complets.

---

### 📈 Compte à Terme (CPG)
```json
{
  "minDeposit": 1000,
  "maxDeposit": 100000,                 // ✅ NOUVEAU (CDIC)
  "interestRate": 3.5,
  "interestCalculation": "simple",      // ✅ NOUVEAU
  "monthlyFees": 0,
  "termOptions": [1, 2, 3, 5],
  "earlyWithdrawalPenalty": "3 mois d'intérêts" // ✅ NOUVEAU
}
```

**Caractéristiques:**
- Taux fixe garanti selon durée
- Termes de 1 à 5 ans disponibles
- Intérêts simples (standard CPG Canada)
- Pénalité claire: 3 mois d'intérêts si retrait anticipé
- Assuré CDIC jusqu'à 100,000$ par personne

**Règle:** Plus la durée est longue, plus le taux est élevé:
- 1 an: ~2.5%
- 2 ans: ~3.0%
- 3 ans: ~3.5%
- 5 ans: ~4.0%

---

## 🔐 Règles de Sécurité et Validation

### Création de Compte
1. ✅ Membre doit exister et être actif
2. ✅ Dépôt initial ≥ minimum selon type
3. ✅ Numéro de compte doit être unique
4. ✅ Format: `XXX-YYYYYY` où XXX = code type, YYYYYY = séquentiel

### Modification de Compte
1. ✅ Solde peut UNIQUEMENT changer via transactions
2. ✅ Statut actif → suspendu → fermé (pas de retour arrière)
3. ✅ Fermeture requiert solde = 0.00$
4. ✅ Compte fermé = read-only permanent

### Transactions
1. ✅ Dépôt: minimum 0.01$
2. ✅ Retrait épargne: vérifier limite mensuelle (6 gratuits)
3. ✅ Retrait chèques: vérifier limite quotidienne (1000$)
4. ✅ CPG: aucun retrait avant échéance (sauf pénalité)

---

## 📊 Calcul des Intérêts

### Compte Épargne
```
Intérêts mensuels = (solde × taux annuel) / 12
Crédit: dernier jour du mois
```

### Compte à Terme
```
Intérêts = capital × taux × (durée / 12)
Versement: à l'échéance du terme
```

---

## 🚫 Ce qui N'existe PAS dans la Vraie Vie

### ❌ Mythes Bancaires
1. **"Retraits illimités gratuits"** → Toujours limité (4-6/mois en réalité)
2. **"Pas de frais mensuels sur chèques"** → Rare, généralement 3-10$ /mois
3. **"Taux d'épargne élevés"** → Actuellement 0.5-1.5% maximum
4. **"CPG sans pénalité"** → Toujours des pénalités pour retrait anticipé

### ✅ Pratiques Réelles
1. Frais de 1-2$ par retrait additionnel (épargne)
2. Limite quotidienne 500-1500$ aux guichets (chèques)
3. Frais mensuels 0-10$ selon type de compte
4. Part sociale obligatoire 5-25$ (adhésion à la caisse)

---

## 🔄 Workflow de Gestion

### Ouverture de Compte
```
1. Vérifier membre existe
2. Charger paramètres bancaires depuis API
3. Valider dépôt initial ≥ minimum
4. Générer numéro de compte unique
5. Appliquer paramètres par défaut (taux, frais, limites)
6. Créer compte avec statut "actif"
```

### Modification de Compte
```
1. Vérifier permissions utilisateur
2. Bloquer modification des champs protégés
3. Valider changements (ex: fermeture = solde 0)
4. Logger l'action pour audit
5. Sauvegarder modifications
```

### Transactions
```
1. Vérifier compte actif (pas suspendu/fermé)
2. Valider montant et limites
3. Calculer frais si applicable
4. Mettre à jour solde
5. Logger transaction
6. Générer reçu
```

---

## 📖 Références

### API Endpoints Requis
```
GET  /api/settings/bank           → Paramètres actuels
PUT  /api/settings/bank           → Modifier paramètres (admin)
GET  /api/accounts/:id            → Détails compte
POST /api/accounts                → Créer compte
PUT  /api/accounts/:id/status     → Changer statut
GET  /api/accounts/:id/transactions → Historique
```

### Permissions
- **Admin**: Tous droits + modification paramètres bancaires
- **Caissier**: Créer comptes, transactions, consultation
- **Membre**: Consultation uniquement (ses propres comptes)

---

## 🎓 Formation des Utilisateurs

### Message pour Caissiers
> "Les retraits sur comptes épargne sont limités à 6 par mois pour encourager l'épargne. 
> Au-delà, des frais de 1.50$ s'appliquent automatiquement."

### Message pour Membres
> "Votre compte chèques vous donne accès à des transactions illimitées moyennant 
> des frais mensuels de 5$. Limite de retrait quotidien: 1000$."

---

## ✅ Checklist de Conformité

- [x] Paramètres chargés depuis API (pas hardcodés)
- [x] Terminologie en français bancaire
- [x] Champs protégés en read-only
- [x] Limites de retraits réalistes (épargne: 6/mois)
- [x] Frais pour retraits additionnels
- [x] Validation dépôt minimum
- [x] Statut compte géré correctement
- [x] Comptes multiples par membre supportés
- [x] Durées CPG configurables (1-5 ans)
- [x] Pénalités retrait anticipé documentées

---

**Version:** 1.0  
**Dernière mise à jour:** Décembre 2025  
**Responsable:** Équipe Développement