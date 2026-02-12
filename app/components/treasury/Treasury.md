# Module Trésorerie — Documentation Fonctionnelle (Caposa)

Le module **Trésorerie** regroupe trois sous-modules essentiels au fonctionnement d’une caisse populaire rurale :  
1. Vue d’ensemble  
2. Encaisse / Coffre  
3. Réconciliation  

Chaque sous-module correspond à un rôle métier distinct, avec une séparation stricte des responsabilités pour assurer la transparence, la traçabilité et la prévention des fraudes.

---

## 1. Vue d’ensemble  
### 🎯 Objectif  
Fournir une vision globale et consolidée de la trésorerie de la caisse.

### 👤 Qui utilise ?  
- Directeur de la caisse  
- Responsable financier  
- Auditeur interne (lecture seule)

### 🧭 Ce que fait cette section  
- Affiche les soldes consolidés :  
  - Coffre  
  - Encaisse  
  - Comptes bancaires  
  - Mouvements du jour  
- Met en évidence :  
  - Les seuils critiques (min/max)  
  - Les anomalies détectées  
  - Les écarts récurrents  
- Permet l’exportation des rapports pour le comité de gestion.

### ❗ Pourquoi cette section existe  
- Donner une vue stratégique sans permettre d’intervention opérationnelle.  
- Assurer que la direction supervise sans manipuler les chiffres.  
- Séparer **analyse** et **exécution**.

### 🔒 Restrictions  
- Lecture seule.  
- Aucune modification ou saisie d’opération.  
- Ne peut pas valider ou réconcilier.

---

## 2. Encaisse / Coffre  
### 🎯 Objectif  
Gérer les opérations physiques de trésorerie : entrées, sorties, déclarations de fin de journée.

### 👤 Qui utilise ?  
- Caissier  
- Trésorier  
- Responsable de coffre

### 🧭 Ce que fait cette section  
- Saisie des entrées et sorties de caisse.  
- Dépôts, retraits, transferts internes.  
- Déclaration du montant physique du coffre.  
- Impression des bordereaux (si activé).  
- Signature numérique des opérations (traçabilité).

### ❗ Pourquoi cette section existe  
- Centraliser toutes les manipulations d’argent liquide.  
- Garantir que chaque mouvement est signé, daté et attribué à un employé.  
- Empêcher la direction ou le comité de manipuler les montants.

### 🔒 Restrictions  
- Ne peut pas valider ses propres opérations.  
- Ne peut pas modifier une opération après clôture.  
- Ne voit pas les analyses globales.

---

## 3. Réconciliation  
### 🎯 Objectif  
Comparer les montants déclarés vs les montants attendus et identifier les écarts.

### 👤 Qui utilise ?  
- Contrôleur interne  
- Membre du comité de gestion  
- Auditeur externe (lecture seule)

### 🧭 Ce que fait cette section  
- Vérifie les montants saisis par les caissiers.  
- Compare :  
  - Solde théorique vs solde physique  
  - Journal système vs transactions du jour  
  - Dépôts bancaires vs reçus internes  
- Documente les écarts :  
  - Raison  
  - Commentaire  
  - Pièce justificative  
- Approuve ou rejette les opérations douteuses.  
- Génère un rapport d’audit quotidien/hebdomadaire.

### ❗ Pourquoi cette section existe  
- Assurer un contrôle interne indépendant.  
- Empêcher qu’une même personne saisisse ET valide.  
- Créer une piste d’audit complète et consultable.

### 🔒 Restrictions  
- Ne peut pas saisir d’opérations.  
- Ne peut pas modifier les montants déclarés.  
- Peut seulement valider, commenter ou escalader.

---

## 📊 Résumé des rôles et permissions

| Sous-module        | Rôle métier                     | Actions autorisées                          | Actions interdites                         |
|--------------------|----------------------------------|----------------------------------------------|---------------------------------------------|
| Vue d’ensemble     | Directeur / Responsable financier | Consulter, analyser, exporter                | Modifier, saisir, valider                   |
| Encaisse / Coffre  | Caissier / Trésorier             | Saisir, déclarer, imprimer                   | Valider, réconcilier, modifier après clôture |
| Réconciliation     | Contrôleur interne / Comité       | Vérifier, commenter, approuver/rejeter       | Saisir, modifier montants                   |

---

## 🧩 Philosophie générale du module Trésorerie

- **Séparation stricte des tâches** :  
  Personne ne peut saisir ET valider une opération.

- **Traçabilité totale** :  
  Chaque action est signée, datée, attribuée.

- **Auditabilité manuelle** :  
  Le comité peut vérifier chaque étape sans dépendre d’automatisation opaque.

- **Réalité des caisses rurales** :  
  Les workflows reflètent les pratiques réelles (bordereaux, signatures, écarts, comités).

- **Clarté UX** :  
  Chaque rôle voit uniquement ce qui correspond à ses responsabilités.

---

## 📁 Fin du fichier

Voici comment je structurerais les règles métier pour chaque module, avec des mises à jour des schémas Zod pour refléter la documentation :

## 📋 Règles Métier par Module

### 1️⃣ **Vue d'ensemble** (Dashboard)
*Module de supervision stratégique*

#### Règles métier :
- **R1.1** - Accès en lecture seule, réservé aux rôles : `directeur`, `responsable_financier`, `auditeur`
- **R1.2** - Affichage des soldes consolidés calculés à partir de :
  - Somme des `CashMovement` (encaisse)
  - Dernière `VaultDeclaration` (coffre)
  - Somme des comptes bancaires (si module banque activé)
- **R1.3** - Alertes automatiques si :
  - `physical_total < seuil_minimum` OU `> seuil_maximum`
  - `difference` dans `Reconciliation` > tolérance définie
  - Écarts récurrents (3+ jours consécutifs)
- **R1.4** - Export des rapports au format PDF/Excel avec signature électronique
- **R1.5** - Aucune action de modification/validation possible depuis ce module

---

### 2️⃣ **Encaisse / Coffre** (Opérations)
*Module opérationnel de gestion physique*

#### Règles métier :

**Pour CashMovement :**
- **R2.1** - Obligatoire : `employee_id`, `signed_by`, `created_at` (auto-générés)
- **R2.2** - `amount` doit être strictement positif
- **R2.3** - Un mouvement ne peut être modifié après clôture quotidienne
- **R2.4** - Types de mouvements :
  - `cash_in` : argent entrant (dépôt membre, versement banque)
  - `cash_out` : argent sortant (retrait membre, transfert vers banque)
  - `transfer_in/out` : mouvements internes entre caisses
- **R2.5** - Impression automatique de bordereau si montant > seuil configurable

**Pour VaultDeclaration :**
- **R2.6** - Une seule déclaration par jour et par `branch_id`
- **R2.7** - `physical_amount` = argent physiquement compté
- **R2.8** - `reserve_amount` = argent réservé (ne peut être utilisé)
- **R2.9** - `sealed_envelopes_amount` = enveloppes scellées non ouvertes
- **R2.10** - Total coffre = `physical_amount + reserve_amount + sealed_envelopes_amount`

**Pour DailyClosing :**
- **R2.11** - Déclenchée manuellement en fin de journée
- **R2.12** - Bloque toute nouvelle opération jusqu'au lendemain
- **R2.13** - Calculs automatiques :
  ```
  physical_total = cash_total + vault_total
  theoretical_total = solde_veille + sum(cash_in) - sum(cash_out)
  difference = physical_total - theoretical_total
  ```
- **R2.14** - Si `|difference| > 0`, obligation de commentaire avant validation

---

### 3️⃣ **Réconciliation** (Contrôle)
*Module de vérification indépendante*

#### Règles métier :

- **R3.1** - Accès réservé aux rôles : `controleur`, `comite_gestion`, `auditeur`
- **R3.2** - Ne peut réconcilier que les jours **après** clôture quotidienne
- **R3.3** - États possibles :
  - `pending` : en attente de vérification
  - `validated` : écart justifié et accepté
  - `rejected` : nécessite investigation/correction
- **R3.4** - Si `status = rejected`, obligation de renseigner `explanation`
- **R3.5** - `theoretical_cash` = calculé depuis `DailyClosing.theoretical_total`
- **R3.6** - `declared_cash` = `DailyClosing.physical_total`
- **R3.7** - Traçabilité obligatoire : `validated_by` + `validated_at`
- **R3.8** - Génération d'un `AuditLog` à chaque action de validation/rejet
- **R3.9** - Rapport hebdomadaire automatique envoyé au comité

---

### 4️⃣ **Audit** (Traçabilité)
*Module de journalisation immuable*

#### Règles métier :

- **R4.1** - Création automatique d'un log à chaque action critique
- **R4.2** - Les logs ne peuvent **jamais** être modifiés ou supprimés
- **R4.3** - `timestamp` généré automatiquement (UTC)
- **R4.4** - `performed_by` obligatoire (id de l'utilisateur connecté)
- **R4.5** - Stockage minimum : 7 ans (conformité réglementaire)
- **R4.6** - Recherche possible par : `entity`, `action`, `performed_by`, `date_range`


## 🎯 Points clés des améliorations

1. **Validations croisées** : Les `.refine()` implémentent les règles métier R2.14, R3.4, R3.7
2. **Calculs automatiques** : Les `.transform()` calculent `total_vault` et `physical_total`
3. **Traçabilité renforcée** : Ajout de `is_locked`, `declaration_date`, `before_state/after_state`
4. **Relations explicites** : `daily_closing_id` dans `Reconciliation`
5. **Constantes métier** : Centralisées pour faciliter la configuration

Cette structure respecte scrupuleusement la séparation des rôles décrite dans votre documentation ! 