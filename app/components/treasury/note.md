“Trésorerie” = Module opérationnel (gestion du cash)
Ce module sert à :

Vue d’ensemble
encaisse disponible

flux entrants/sortants

positions journalières

Encaisse
argent liquide en circulation

mouvements de caisse

soldes journaliers

Coffre
argent stocké

inventaire du coffre

mouvements sécurisés

Réconciliation
rapprochement caisse vs système

anomalies

écarts

journalisation

👉 C’est un module opérationnel quotidien, pas un rapport réglementaire.

Il sert aux caissiers, superviseurs, gestionnaires de trésorerie.
Elle répond à :

“Combien d’argent avons-nous en caisse aujourd’hui ?”
“Le coffre est-il équilibré ?”
“Y a-t-il des écarts ?”
# Module Trésorerie — Vue d'ensemble

## 🎯 Nature et objectif

**Type de module** : Opérationnel quotidien (pas un rapport réglementaire)

**Utilisateurs cibles** :
- Caissiers
- Superviseurs
- Gestionnaires de trésorerie

**Questions métier auxquelles il répond** :
- "Combien d'argent avons-nous en caisse **aujourd'hui** ?"
- "Le coffre est-il équilibré ?"
- "Y a-t-il des écarts ?"

---

## 📊 Contenu affiché

### 1. Encaisse disponible
- Argent liquide en circulation
- Soldes journaliers
- Mouvements de caisse

### 2. Flux entrants/sortants
- Dépôts (cash_in)
- Retraits (cash_out)
- Transferts internes

### 3. Positions journalières
- Situation actuelle
- Inventaire du coffre
- Mouvements sécurisés

### 4. Réconciliation
- Rapprochement caisse vs système
- Détection d'anomalies
- Suivi des écarts
- Journalisation complète

---

## 🔄 Workflow : Ouverture de caisse

### Cycle de vie d'une session

```
Caisse fermée
     ↓
Ouverture de caisse
     ↓
Opérations (dépôts, retraits…)
     ↓
Fermeture de caisse
     ↓
Vérification finale
```

### Étapes dans l'application

#### 1️⃣ Déclenchement
```
Bouton : [ Ouvrir la caisse ]
```
Ouvre un modal de saisie

#### 2️⃣ Saisie du montant initial
**Formulaire** :
- Montant de départ
- Commentaire (optionnel)

**Exemple** :
```
Montant initial : 2000 $
Notes : Fonds standard du matin
```

#### 3️⃣ Confirmation de responsabilité
```
☑ Je confirme avoir vérifié le montant et accepter 
  la responsabilité de la caisse.
```
⚠️ Important juridiquement et fonctionnellement

#### 4️⃣ Création d'une session de caisse
**Backend enregistre** :
```ts
CashSession {
  id
  employee_id
  branch_id
  opening_amount
  opened_at
  status: "open"
}
```

---

## 🏗️ Structure de données recommandée

### Interface TypeScript

```ts
export interface CashSession {
  id: string;
  employee_id: string;
  branch_id: string;
  opening_amount: number;
  closing_amount?: number;
  difference?: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at?: string;
}
```

### Lien avec les opérations

Chaque opération doit contenir :
```ts
session_id
```

**Permet de savoir** :
- Quelle caisse a fait l'opération
- Combien d'argent devrait rester

---

## 🖥️ Interface utilisateur

### État : Caisse ouverte
```
État de la caisse

● Caisse ouverte
Ouverte à 09:02
Montant initial : 2000$
Solde actuel : 2350$
```

### État : Caisse fermée
```
⚠ Aucune caisse ouverte
[ Ouvrir une caisse ]
```

---

## 📅 Processus d'une journée type

### Matin
- **Ouvrir caisse** → session créée

### Journée
- Opérations liées à la session

### Soir
**Fermer caisse** :
1. Compter argent réel
2. Saisir montant final
3. Calcul automatique de la différence

### Calcul automatique

```
Solde théorique = 
  montant initial
  + dépôts
  - retraits
```

Puis comparaison avec le montant réel compté.

---

## 🗂️ Architecture recommandée

```
treasury/
   ├── CashSessionModal.tsx
   ├── CashSessionStatus.tsx
   ├── useCashSession.ts
   └── types.ts
```

---

## ⚠️ Pourquoi c'est essentiel

### Sans session de caisse :
- ❌ Impossible d'auditer
- ❌ Impossible de détecter écarts
- ❌ Difficile de tracer responsabilités

### Avec session de caisse :
- ✅ Traçabilité complète
- ✅ Détection automatique d'écarts
- ✅ Responsabilité claire
- ✅ Conformité bancaire

> 💡 **Toutes les banques utilisent ce modèle**

---

## 🚀 Fonctionnalités avancées (niveau pro)

### 1. Sécurité
- Empêcher toute opération si aucune caisse n'est ouverte

### 2. Visibilité
- Afficher un badge "Caisse ouverte" permanent

### 3. Contrôle
- Forcer la fermeture en fin de journée

> 📌 **Exactement comme dans les systèmes bancaires réels**

---

## 🔴 Point d'attention : Tension avec la documentation

### Documentation initiale
- **Vue d'ensemble** = Lecture seule
- Réservée à Direction/Audit
- Pas d'action opérationnelle possible

### Notes de terrain
- **Vue d'ensemble** = Outil opérationnel quotidien
- Accessible aux caissiers/superviseurs
- Questions immédiates en temps réel

### ❓ À clarifier
La "Vue d'ensemble" devrait-elle être :
- **A)** Tableau de bord stratégique (direction uniquement)
- **B)** Dashboard opérationnel (équipes terrain)

Cette décision impacte :
- Permissions d'accès
- Niveau de détail affiché
- Actions disponibles