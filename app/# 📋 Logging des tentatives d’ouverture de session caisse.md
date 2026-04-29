## 📝 Logging des tentatives d’ouverture de session caisse

### 🎯 Contexte

Dans le cadre de l’ouverture d’une **session caisse**, plusieurs règles métier s’appliquent :

* respect des **horaires d’ouverture**
* gestion des **jours fériés**
* statut de la **branche (active / archivée)**
* possibilité d’**override manuel** (exception validée)

Chaque tentative (réussie ou non) doit être **traçable** pour répondre aux exigences :

* audit bancaire
* conformité
* investigation en cas d’incident ou fraude

---

### 🧾 Principe de fonctionnement

* Chaque tentative crée une **entrée immuable**
* Le système fonctionne en **event logging (append-only)**
* Aucune modification ou suppression n’est autorisée
* L’historique doit refléter **exactement ce qui s’est passé, dans l’ordre**

---

### 🔁 Cycle d’une tentative

1. L’utilisateur tente d’ouvrir une session caisse

2. Le backend évalue l’éligibilité :

   * configuration de la branche
   * statut (actif / archivé)
   * jour férié
   * plage horaire

3. Trois cas possibles :

   * ✅ **Autorisé** → session créée → log `success`
   * ⛔ **Bloqué** → refus immédiat → log `blocked`
   * ⚠️ **Exception possible** → log `override_requested`

4. Si un responsable intervient :

   * ✔️ override validé → session créée → log `override_approved`
   * ❌ override refusé → log `override_rejected`

---

### 📊 Données enregistrées

Chaque log capture :

#### Métier

* utilisateur (username)
* branche concernée
* date/heure exacte
* statut de la tentative
* raison métier (ex: hors horaires, jour férié…)

#### Contexte technique

* adresse IP
* device / user agent
  👉 utile pour corrélation et détection de fraude

#### Override (si applicable)

* motif de l’exception
* utilisateur ayant approuvé
* timestamp d’approbation

#### Résultat

* lien vers la session créée (si succès)

---

### ⚠️ Règles critiques

* **Toujours logger avant de répondre**
  → même un échec doit être tracé

* **Immutabilité stricte**
  → aucune altération possible (audit)

* **Aucune donnée sensible**
  → ne jamais exposer mot de passe / PIN / secrets

* **Cohérence historique**
  → une branche ne doit jamais être supprimée physiquement (soft delete uniquement)

* **Traçabilité complète**
  → chaque étape (même une demande d’override) doit apparaître dans les logs

---

### 🎯 Valeur pour le système

Ce mécanisme permet :

* une **vision complète des accès caisse**
* une **reconstruction fidèle des événements**
* une **base solide pour audit et conformité**
* une **détection proactive des comportements anormaux**

---

### 📌 En résumé

`SessionAttempt` n’est pas juste un log technique :
c’est une **brique critique de gouvernance et de sécurité** du système caisse.
