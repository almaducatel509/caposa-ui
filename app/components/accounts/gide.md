# 📊 Guide de Calcul des Intérêts Bancaires

## 🎯 Vue d'ensemble

Ce guide explique les différentes méthodes de calcul d'intérêts utilisées dans le système bancaire, leur impact sur les membres, et les obligations légales d'affichage.

---

## 📐 Méthodes de Calcul

### 1. **Aucun Intérêt (`none`)**
**Applicable à:** Comptes chèques

```typescript
interest = 0
```

**Caractéristiques:**
- Pas de calcul d'intérêt
- Utilisé pour les comptes transactionnels
- Focus sur les services plutôt que le rendement

---

### 2. **Intérêts Simples (`simple`)**
**Applicable à:** Comptes à terme (CPG)

**Formule:**
```typescript
Intérêts = Capital × Taux × (Durée / 12)
```

**Exemple:**
```
Capital: 10,000$
Taux annuel: 3.5%
Durée: 2 ans

Intérêts = 10,000 × 0.035 × 2
         = 700$

Montant final = 10,700$
```

**Caractéristiques:**
- Les intérêts sont calculés uniquement sur le capital initial
- Versement à l'échéance du terme
- Calcul simple et transparent
- Standard pour les CPG au Canada

**Code d'implémentation:**
```typescript
function calculateSimpleInterest(
  principal: number,
  annualRate: number,
  years: number
): number {
  return principal * (annualRate / 100) * years;
}
```

---

### 3. **Intérêts Composés Mensuellement (`compound-monthly`)**
**Applicable à:** Comptes épargne

**Formule:**
```typescript
Montant final = Capital × (1 + Taux/12)^(12 × Années)
Intérêts = Montant final - Capital
```

**Exemple:**
```
Capital: 1,000$
Taux annuel: 0.5%
Durée: 1 an (12 mois)

Montant final = 1,000 × (1 + 0.005/12)^12
              = 1,000 × (1.0004167)^12
              = 1,000 × 1.00501
              = 1,005.01$

Intérêts gagnés = 5.01$
```

**Caractéristiques:**
- Les intérêts gagnent eux-mêmes des intérêts
- Calcul et capitalisation chaque mois
- Meilleur rendement à long terme vs intérêts simples
- Standard pour comptes épargne des caisses populaires

**Code d'implémentation:**
```typescript
function calculateCompoundInterestMonthly(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  const finalAmount = principal * Math.pow(1 + monthlyRate, months);
  return finalAmount - principal;
}
```

**Calcul mensuel progressif:**
```typescript
function calculateMonthlyCompounding(
  balance: number,
  annualRate: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const interest = balance * monthlyRate;
  const newBalance = balance + interest;
  
  return {
    interest,
    newBalance
  };
}

// Exemple sur 12 mois:
Mois 1: 1000.00 → 1000.42 (+0.42$)
Mois 2: 1000.42 → 1000.83 (+0.42$)
Mois 3: 1000.83 → 1001.25 (+0.42$)
...
Mois 12: 1004.59 → 1005.01 (+0.42$)
```

---

### 4. **Intérêts Composés Quotidiennement (`compound-daily`)**
**Applicable à:** Comptes épargne haut rendement

**Formule:**
```typescript
Montant final = Capital × (1 + Taux/365)^(365 × Années)
```

**Exemple:**
```
Capital: 1,000$
Taux annuel: 0.5%
Durée: 1 an (365 jours)

Montant final = 1,000 × (1 + 0.005/365)^365
              = 1,000 × (1.0000137)^365
              = 1,000 × 1.00501
              = 1,005.01$
```

**Caractéristiques:**
- Capitalisation quotidienne
- Rendement légèrement supérieur vs composition mensuelle
- Plus complexe à calculer
- Rare au Canada, plus commun aux États-Unis

**Code d'implémentation:**
```typescript
function calculateCompoundInterestDaily(
  principal: number,
  annualRate: number,
  years: number
): number {
  const dailyRate = annualRate / 100 / 365;
  const days = years * 365;
  const finalAmount = principal * Math.pow(1 + dailyRate, days);
  return finalAmount - principal;
}
```

---

## 📊 Comparaison des Méthodes

### Rendement sur 1,000$ à 5% pendant 5 ans

| Méthode | Calcul | Intérêts | Total | Gain vs Simple |
|---------|--------|----------|-------|----------------|
| **Simple** | 1000 × 0.05 × 5 | 250.00$ | 1,250.00$ | - |
| **Composé Mensuel** | (1 + 0.05/12)^60 | 283.36$ | 1,283.36$ | +33.36$ |
| **Composé Quotidien** | (1 + 0.05/365)^1825 | 284.03$ | 1,284.03$ | +34.03$ |

**Conclusion:** Plus la composition est fréquente, meilleur est le rendement!

---

## 🏦 Application aux Types de Compte

### Compte Épargne 🐷
```json
{
  "interestRate": 0.5,
  "interestCalculation": "compound-monthly"
}
```

**Raison:** 
- Encourage l'épargne à long terme
- Les intérêts composés récompensent la patience
- Standard des caisses populaires québécoises

**Calcul mensuel automatique:**
```
Chaque dernier jour du mois:
1. Calculer: intérêts = solde × (0.5% / 12)
2. Créditer: nouveau_solde = solde + intérêts
3. Logger la transaction
```

---

### Compte Chèques 💳
```json
{
  "interestRate": 0,
  "interestCalculation": "none"
}
```

**Raison:**
- Compte transactionnel, pas d'épargne
- Focus sur les services (carte, chèques, transactions)
- Frais mensuels au lieu d'intérêts

---

### Compte à Terme (CPG) 📈
```json
{
  "interestRate": 3.5,
  "interestCalculation": "simple"
}
```

**Raison:**
- Taux fixe garanti
- Calcul transparent et prévisible
- Intérêts versés à l'échéance seulement
- Standard pour CPG au Canada

**Calcul à l'échéance:**
```
Capital: 5,000$
Taux: 3.5%
Terme: 3 ans

Intérêts = 5,000 × 0.035 × 3 = 525$
Versement à l'échéance: 5,525$
```

---

## ⚖️ Obligations Légales

### 1. **Divulgation du Taux**
✅ **Requis:** Afficher le taux d'intérêt annuel en pourcentage (%)

❌ **Interdit:** Masquer ou minimiser l'affichage du taux

### 2. **Méthode de Calcul**
✅ **Requis:** Indiquer clairement:
- Intérêts simples ou composés
- Fréquence de capitalisation (mensuelle, quotidienne)
- Date de versement des intérêts

**Exemple conforme:**
```
Compte Épargne
Taux: 0.5% par année
Calcul: Intérêts composés mensuellement
Versement: Dernier jour de chaque mois
```

### 3. **Transparence des Frais**
✅ **Requis:** Mentionner si des frais peuvent réduire les intérêts
- Frais de solde bas
- Frais de retrait excessif

❌ **Interdit:** Afficher un taux "net" sans mentionner les frais

### 4. **Exemples Concrets**
✅ **Recommandé:** Fournir des exemples de calcul
```
Exemple: Sur un dépôt de 1,000$ à 0.5% composé mensuellement,
vous gagnerez environ 5.01$ après 1 an.
```

---

## 🧮 Implémentation Backend

### Structure de Données
```python
# models.py
class AccountType(models.Model):
    INTEREST_CHOICES = [
        ('none', 'Aucun intérêt'),
        ('simple', 'Intérêts simples'),
        ('compound-monthly', 'Composés mensuellement'),
        ('compound-daily', 'Composés quotidiennement'),
    ]
    
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    interest_calculation = models.CharField(
        max_length=20,
        choices=INTEREST_CHOICES,
        default='none'
    )
```

### Service de Calcul
```python
# services/interest_service.py
from decimal import Decimal
import math

class InterestCalculator:
    
    @staticmethod
    def calculate_simple(principal, annual_rate, years):
        """Calcul intérêts simples pour CPG"""
        return principal * (annual_rate / 100) * years
    
    @staticmethod
    def calculate_compound_monthly(balance, annual_rate):
        """Calcul mensuel pour compte épargne"""
        monthly_rate = annual_rate / 100 / 12
        interest = balance * monthly_rate
        return round(interest, 2)
    
    @staticmethod
    def calculate_compound_daily(balance, annual_rate):
        """Calcul quotidien (rare)"""
        daily_rate = annual_rate / 100 / 365
        interest = balance * daily_rate
        return round(interest, 2)
```

### Tâche Automatique (Cron Job)
```python
# tasks/monthly_interest.py
from celery import shared_task
from datetime import date

@shared_task
def apply_monthly_interest():
    """
    Exécuté automatiquement le dernier jour de chaque mois
    """
    last_day = date.today().replace(day=1) - timedelta(days=1)
    
    if date.today() != last_day:
        return  # Pas le dernier jour
    
    accounts = Account.objects.filter(
        type__interest_calculation='compound-monthly',
        status='actif'
    )
    
    for account in accounts:
        interest = InterestCalculator.calculate_compound_monthly(
            account.balance,
            account.type.interest_rate
        )
        
        if interest > 0:
            # Créer transaction d'intérêt
            Transaction.objects.create(
                account=account,
                type='interest_credit',
                amount=interest,
                description=f'Intérêts {date.today().strftime("%B %Y")}'
            )
            
            # Mettre à jour solde
            account.balance += interest
            account.save()
```

---

## 📱 Affichage dans l'Interface

### Card d'Information
```tsx
{interestCalculation === 'compound-monthly' && (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
    <p className="text-sm">
      <strong>Intérêts composés mensuellement</strong>
    </p>
    <p className="text-xs text-gray-600">
      Vos intérêts génèrent à leur tour des intérêts,
      maximisant votre épargne à long terme!
    </p>
    <p className="text-xs text-blue-600 mt-2">
      Exemple: 1,000$ → 1,005.01$ après 1 an
    </p>
  </div>
)}
```

### Calculateur d'Intérêts
```tsx
<InterestCalculator
  amount={1000}
  rate={0.5}
  years={1}
  method="compound-monthly"
/>

// Affiche:
// Capital: 1,000.00$
// Intérêts: 5.01$
// Total: 1,005.01$
```

---

## ✅ Checklist de Conformité

- [x] Taux affiché en pourcentage annuel
- [x] Méthode de calcul clairement indiquée
- [x] Fréquence de capitalisation mentionnée
- [x] Date de versement des intérêts précisée
- [x] Exemples concrets fournis
- [x] Frais pouvant réduire intérêts divulgués
- [x] Calculs automatiques testés et validés
- [x] Logging de toutes transactions d'intérêts

---

**Version:** 1.0  
**Dernière mise à jour:** Décembre 2025  
**Conforme à:** Règlements ACFC (Agence de la consommation en matière financière du Canada)