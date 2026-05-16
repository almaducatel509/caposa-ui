# 📄 CAPOSA LOAN SYSTEM — BACKEND CONTRACT (CRUD + RULES + FRONT EXPECTATIONS)

## 🎯 OBJECTIF GLOBAL

Le backend est **la seule source de vérité** pour :

* règles métier
* calculs financiers
* KPI / analytics
* statuts de prêts
* validation des données
* logique de risque

Le frontend **n’affiche jamais de logique métier**, il consomme uniquement des données prêtes.

class Loan(models.Model):
   ```python
    # Set automatically on creation
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Set when the loan is disbursed (caissier action)
    start_date = models.DateField(null=True, blank=True)
    disbursed_at = models.DateTimeField(null=True, blank=True)
    
    # Computed when closed
    end_date = models.DateField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
   ```
---

# 🧱 1. MODULE LOAN — STRUCTURE BACKEND

## 📁 `loan.controller.ts`

### 👉 API endpoints

* `GET /loans`
* `GET /loans/:id`
* `POST /loans`
* `PUT /loans/:id`
* `DELETE /loans/:id`
* `GET /loans/kpis`
* `GET /loans/analytics`
* `GET /loans/risk-summary`

---

## 📁 `loan.service.ts`

### 👉 logique principale métier

### 🔴 Backend only :

* création prêt
* validation règles business
* liaison membre / caisse / session
* statut initial du prêt

### 📌 règles métier :

* montant > 0
* durée 3–60 mois
* 1 prêt actif max par membre (option CAPOSA)
* type de prêt valide obligatoire

---

## 📁 `loan.calculation.service.ts`

### 👉 calculs financiers

### 🔴 Backend only :

* `monthly_payment`
* `remaining_balance`
* `total_repayment`
* amortissement complet
* recalcul automatique

### 📌 règles :

* recalcul si taux ou durée change
* arrondi uniquement backend
* aucune logique React

---

## 📁 `loan.kpi.service.ts`

### 👉 dashboard KPIs

### 🔴 Backend only :

* total loans
* total disbursed
* total outstanding
* total repaid
* approval rate
* on-time rate
* monthly expected payments

### 📌 règles :

* calcul live ou cache Redis
* utilisé dans dashboard global

---

## 📁 `loan.risk.service.ts`

### 👉 analyse de risque

### 🔴 Backend only :

* `is_late`
* `late_days`
* classification :

  * à jour
  * retard 1–29 jours
  * retard 30+ jours (critique)

### 📌 règles :

* basé sur dates réelles
* utilisé pour alertes + scoring

---

## 📁 `loan.analytics.service.ts`

### 👉 données graphiques

### 🔴 Backend only :

* volume des prêts (jour / semaine)
* distribution par type
* distribution par statut
* progression des remboursements
* top soldes restants

---

## 📁 `loan.repository.ts`

### 👉 accès base de données

* requêtes SQL / ORM
* groupBy / aggregation backend
* optimisation performance

---

# 📊 2. DONNÉES ATTENDUES PAR LE FRONTEND (DASHBOARD)

## 🟢 Endpoint: `GET /loans/kpis`

```json
{
  "totalLoans": 120,
  "activeLoans": 80,
  "totalDisbursed": 4500000,
  "totalOutstanding": 1800000,
  "totalRepaid": 2700000,
  "approvalRate": 87.5,
  "onTimeRate": 92.1,
  "monthlyExpected": 120000
}
```

---

## 🟢 Endpoint: `GET /loans/analytics`

```json
{
  "volumeData": [
    { "label": "Mon", "count": 12, "amount": 300000 },
    { "label": "Tue", "count": 8, "amount": 210000 }
  ],
  "typeDistrib": [
    { "type": "Commerce", "value": 40 },
    { "type": "Logement", "value": 25 }
  ],
  "statusDistrib": [
    { "status": "decaisse", "count": 60 },
    { "status": "en_attente", "count": 20 }
  ],
  "progressDistrib": [
    { "range": "0-25%", "count": 10 },
    { "range": "26-50%", "count": 30 }
  ]
}
```

---

## 🟢 Endpoint: `GET /loans`

Frontend attend :

```ts
LoanData {
  id
  member_name
  amount
  status
  loan_type
  remaining_balance
  monthly_payment
  interest_rate
  is_late
  late_days
  next_payment_date
  created_at
}
```

👉 IMPORTANT : toutes ces valeurs sont **backend computed**

---

# 🧾 3. CRÉATION PRÊT — VALIDATION BACKEND

## 📁 `loan.validation.ts`

### 🔴 Backend only rules :

#### Champs obligatoires :

* member_id
* amount
* loan_type
* duration_months
* purpose

---

## 📌 règles métier création :

* montant > 0
* durée 3–60 mois
* type de prêt valide
* membre doit exister
* membre ne peut pas avoir 2 prêts actifs
* caisse obligatoire
* session obligatoire

---

## 📌 auto-generated backend fields :

* monthly_payment
* interest_rate (si non fourni → default rule)
* remaining_balance = amount + interest
* status = "en_attente"
* created_at = now()
* account_number généré
* session_id généré

---

# 🚫 4. INTERDIT FRONTEND (TRÈS IMPORTANT)

## ❌ Le frontend NE DOIT PAS calculer :

* monthly_payment
* remaining_balance
* late_days
* is_late
* KPIs
* analytics
* groupements
* filtrage métier complexe

---

# 🧠 5. RÈGLE ARCHITECTURALE CAPOSA

> 🔥 Backend = logique métier + vérité financière
> 🔥 Frontend = affichage + interaction UI uniquement

---

# 🧩 6. STRUCTURE BACKEND RECOMMANDÉE

```
/loan
  ├── 
  ├── service/
  │     loan.service.ts
  │     loan.calculation.service.ts
  │     loan.kpi.service.ts
  │     loan.risk.service.ts
  │     loan.analytics.service.ts
  ├── repository/
  │     loan.repository.ts
  ├── validation/
  │     loan.validation.ts
  ├── dto/
  │     loan.dto.ts
```
