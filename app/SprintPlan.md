

# 🚀 **PLAN DE SPRINT CAPOSA — VERSION ACCÉLÉRÉE (3 SEMAINES)**  
Objectif : **livrer un MVP solide**, présentable, démontrable, propre.  
Pas complet. Pas parfait. **Suffisant pour soutenir.**

---

# 🗓️ **SEMAINE 1 — Simplification + Transactions (le cœur du système)**  
**But : réduire la complexité + livrer la fonctionnalité la plus critique.**

### 🔧 Backend
- Supprimer l’entité Archive  
- Ajouter `status` dans chaque entité  
- Définir les 5 entités avec audit log (transactions, comptes, caisse, prêts, employés)  
- Nettoyer les endpoints inutiles  
- Fixer les enums et conventions

### 💸 Transactions (priorité absolue)
- Dépôt  
- Retrait  
- Transfert  
- Audit log  
- Validation stricte  
- UI simple (table + modal)

**Livrable semaine 1 :**  
👉 Backend propre + transactions 100% fonctionnelles + audit log.

---

# 🗓️ **SEMAINE 2 — Comptes + Membres + Caisse**  
**But : rendre le système utilisable et démontrable.**

### 👤 Comptes
- CRUD  
- Statuts (active, inactive, archived)  
- Audit log  
- UI : table + onglets

### 🧍 Membres
- CRUD  
- Statuts  
- UI simple

### 💰 Caisse / Session
- Ouverture  
- Fermeture  
- Ajustements  
- Audit log  
- UI minimaliste

**Livrable semaine 2 :**  
👉 Comptes + membres + caisse fonctionnels, prêts pour démo.

---

# 🗓️ **SEMAINE 3 — Prêts + Tests + Préparation Soutenance**  
**But : finaliser, stabiliser, préparer la présentation.**

### 📄 Prêts (version MVP)
- Création  
- Approbation  
- Changement de statut  
- Audit log  
- UI simple

### 🧪 Tests & Stabilisation
- Tests manuels  
- Correction des bugs majeurs  
- Vérification des flux critiques (transactions, caisse, comptes)

### 🎤 Préparation soutenance
- Vidéo démo 3 minutes  
- Slides simples :  
  - problème  
  - solution  
  - architecture  
  - démo  
  - conclusion  
- README + schéma DB  
- Portfolio CAPOSA

**Livrable semaine 3 :**  
👉 CAPOSA prêt à être soutenu + démo + slides.

---

# 🧠 **Règles d’or pour réussir en 3 semaines**
- **Tu ne fais que le nécessaire.**  
- **Tu ne rajoutes aucune feature bonus.**  
- **Tu ne touches pas à ce qui fonctionne.**  
- **Tu fais 1 fonctionnalité par jour.**  
- **Tu dors.**  
- **Tu protèges ton bac.**

---

# ⭐ **Version ultra condensée (à coller sur ton mur)**

> **S1 : Nettoyage + Transactions**  
> **S2 : Comptes + Membres + Caisse**  
> **S3 : Prêts + Tests + Soutenance**
