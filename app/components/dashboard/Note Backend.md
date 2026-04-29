T’as raison — si tu mets tout ça d’un coup, personne ne va lire 😄
Il faut une version **compacte, utilisable en équipe**, pas un roman.

Voici une **version condensée (dashboard + permissions)** que tu peux envoyer telle quelle 👇

---

# 📝 Dashboard & Permissions — Attentes Backend

## 🎯 Contexte

Le système supporte plusieurs rôles :

* Caissier (opérations)
* Superviseur (contrôle)
* Directeur (vision globale)
* Trésorerie (encaisse, coffre, réconciliation)

👉 Le dashboard doit refléter **l’état réel de la caisse**, avec une vue adaptée selon le rôle.

---

## 🧭 Principe

* **Une seule source de vérité (backend)**
* **Plusieurs vues selon le rôle**
* **Aucune logique métier côté frontend**

---

## 📊 Données communes (base dashboard)

Le backend doit pouvoir fournir :

* sessions (actives + historiques du jour)
* transactions du jour
* montant actuel en caisse (calculé backend)
* alertes (anomalies, actions requises)

---

## 👤 Permissions par rôle

### Caissier

**Peut :**

* voir sa session
* voir ses transactions
* ouvrir / fermer session
* faire des opérations

**Ne peut pas :**

* valider
* voir global
* accéder à la réconciliation complète

---

### Superviseur

**Peut :**

* voir toutes les sessions
* voir toutes les transactions
* gérer les overrides
* surveiller anomalies

**Ne peut pas :**

* faire des opérations caisse
* modifier montants

---

### Directeur

**Peut :**

* voir données consolidées
* voir indicateurs et anomalies
* valider (niveau final)
* exporter

**Ne peut pas :**

* faire des opérations
* modifier transactions

---

### Trésorerie

#### Encaisse / Coffre

* gérer mouvements physiques
* déclarations

#### Réconciliation

* comparer réel vs théorique
* valider / rejeter
* documenter écarts

👉 Ne peut jamais saisir ET valider

---

## ⚙️ Attentes backend

### 1. Role-based access (obligatoire)

* filtrage automatique selon rôle
* aucune fuite de données

---

### 2. Cohérence métier

* une seule session active
* pas de transaction sans session
* montants calculés backend

---

### 3. Actions contrôlées

* chaque action vérifie le rôle
* refus explicite si interdit

---

### 4. Traçabilité

* toutes actions critiques loggées :

  * ouverture / fermeture session
  * override
  * validation
  * réconciliation

---

## ⚠️ Points critiques

* backend = **source de vérité**
* séparation stricte des rôles
* aucune action hors permission
* système doit rester **audit-ready**

