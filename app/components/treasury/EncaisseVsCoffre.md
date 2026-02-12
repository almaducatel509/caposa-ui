# Encaisse vs Coffre — Documentation Métier (Caposa)

Ce document clarifie la différence entre **Encaisse** et **Coffre**, deux notions essentielles dans la gestion de trésorerie d’une caisse populaire rurale.  
Bien qu’elles soient regroupées dans un même sous-module dans Caposa, elles représentent **deux réalités différentes** et **deux responsabilités distinctes**.

---

## 1. Encaisse
### 🎯 Définition
L’**encaisse** représente l’argent **en circulation pendant la journée**.  
C’est l’argent que le caissier manipule activement lors des opérations quotidiennes.

### 🧭 Ce que contient l’encaisse
- Dépôts des membres  
- Retraits  
- Remboursements  
- Petites sorties de caisse  
- Transferts internes  
- Solde de début de journée  
- Solde de fin de journée  

### 👤 Qui utilise ?
- **Caissier**  
- **Trésorier opérationnel**

### 🎯 Rôle métier
- Saisir les transactions du jour  
- Gérer les mouvements d’argent “vivants”  
- Déclarer l’encaisse en fin de journée  
- Signer numériquement les opérations  

### ❗ Pourquoi c’est important
- Permet de suivre l’activité quotidienne réelle  
- Assure la traçabilité des mouvements  
- Empêche les manipulations non autorisées  
- Sert de base à la réconciliation  

---

## 2. Coffre
### 🎯 Définition
Le **coffre** représente l’argent **stocké et sécurisé**, non utilisé dans les opérations courantes.  
C’est l’argent “au repos”.

### 🧭 Ce que contient le coffre
- Fonds de caisse  
- Réserve de liquidité  
- Enveloppes scellées  
- Dépôts en attente de transport bancaire  
- Argent non encore mis en circulation  

### 👤 Qui utilise ?
- **Responsable de coffre**  
- **Caissier** (dans les petites caisses où les rôles sont cumulés)

-**Encaisse** =>	Caissier =>	Saisir les transactions du jour
**Coffre** =>	Trésorier / Caissier =>	Déclarer le montant physique du coffre
**Encaisse + Coffre (ensemble)**	=> Caissier / Trésorier	=> Faire la clôture quotidienne

### 🎯 Rôle métier
- Déclarer le montant physique du coffre  
- Gérer les entrées/sorties du coffre  
- Maintenir la sécurité et l’intégrité des fonds  
- Signer les déclarations de coffre  

### ❗ Pourquoi c’est important
- Garantit la sécurité des liquidités  
- Permet de contrôler les réserves disponibles  
- Empêche les accès non autorisés  
- Sert de référence pour la réconciliation  

---

## 3. Pourquoi Encaisse et Coffre sont regroupés dans Caposa
Même si ce sont deux concepts différents, ils sont regroupés dans un seul sous-module **Encaisse / Coffre** pour refléter la réalité des caisses rurales :

- La même personne gère souvent les deux  
- Les mouvements entre encaisse et coffre sont fréquents  
- La clôture quotidienne exige de déclarer **les deux montants ensemble**  
- La réconciliation compare :  
  **Encaisse déclarée + Coffre déclaré = Total physique**  
  vs  
  **Solde théorique du système**

---

## 4. Différences essentielles (résumé)

| Élément | Encaisse | Coffre |
|--------|----------|--------|
| Nature | Argent en circulation | Argent stocké |
| Rythme | Bouge toute la journée | Reste stable |
| Utilisateur principal | Caissier | Responsable de coffre |
| Rôle | Opérations quotidiennes | Sécurité et réserve |
| Déclaration | Fin de journée | Fin de journée |
| Importance | Suivi des transactions | Sécurité des fonds |

---

## 5. Philosophie de contrôle interne
- **Encaisse = activité**  
- **Coffre = sécurité**  
- Les deux doivent être **déclarés séparément**, mais **réconciliés ensemble**  
- Personne ne doit pouvoir saisir ET valider  
- Chaque action doit être **signée, datée, attribuée**  

---

## 📁 Fin du document
