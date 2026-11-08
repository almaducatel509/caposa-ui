# Guide de Trésorerie et Réconciliation - CAPOSA
**Module de gestion de caisse pour coopératives d'épargne et de crédit**

---

## 📋 Vue d'ensemble

Ce document simplifie le processus de gestion de trésorerie en termes clairs et accessibles, avec les écrans UI correspondants.

---

## 🔄 Le Cycle Quotidien de la Caisse

### 1. Ouverture de la Caisse (Matin)
**Qui:** Caissier  
**Quand:** Début de journée

**Actions:**
- Le caissier compte physiquement l'argent présent dans la caisse
- Il enregistre le **montant d'ouverture** (fond de caisse)
- Exemple: "J'ai 2 000 $ en caisse ce matin"

**Terminologie:**
- **Fond de caisse** = Argent de départ nécessaire pour les opérations de la journée

---

### 2. Transactions de la Journée
**Qui:** Caissier + Agents de crédit  
**Quand:** Tout au long de la journée

**Types d'opérations:**
- **Dépôts** → Argent qui ENTRE dans la caisse
- **Retraits** → Argent qui SORT de la caisse
- **Remboursements** → Membres qui remboursent leurs prêts
- **Frais administratifs** → Paiement de frais divers
- **Encaissements des agents** → Les agents de terrain rapportent l'argent collecté

**Terminologie:**
- **Flux entrants** = Tout l'argent qui entre (dépôts + remboursements)
- **Flux sortants** = Tout l'argent qui sort (retraits + décaissements)

---

### 3. Fermeture de la Caisse (Fin de journée)
**Qui:** Caissier  
**Quand:** Fin de journée

**Actions:**
1. Le caissier génère le **rapport journalier**
2. Il compte physiquement l'argent restant en caisse
3. Il compare avec ce qu'il *devrait* avoir selon les transactions

**Terminologie:**
- **Montant théorique** = Ce qu'on devrait avoir en caisse selon le système
  - Formule: `Fond de caisse + Flux entrants - Flux sortants`
  - Exemple: `2 000 $ + 8 340 $ - 3 210 $ = 7 130 $`
  
- **Montant réel** = Ce qu'on a vraiment compté physiquement
  - Exemple: `7 100 $`

- **Écart** = Différence entre théorique et réel
  - Formule: `Montant réel - Montant théorique`
  - Exemple: `7 100 $ - 7 130 $ = -30 $` (il manque 30 $)

---

### 4. Réconciliation (Vérification)
**Qui:** Superviseur  
**Quand:** Après la fermeture

Le superviseur vérifie **3 zones critiques:**

#### A. Cash en Caisse
**Question:** Le cash physique correspond-il au cash théorique?

**Statuts possibles:**
- ✅ **Match** = Parfait, les montants correspondent
- ⚠️ **Écart** = Il y a une différence (surplus ou manque)
- 🕐 **En attente** = Pas encore vérifié

**Actions du superviseur:**
- Si **match** → Marquer comme validé
- Si **écart** → Ajouter une note d'explication
  - Exemples: "Erreur de frappe sur reçu #234", "Billet déchiré remplacé", etc.

#### B. Dépôts Bancaires
**Question:** Les bordereaux de dépôt correspondent-ils aux montants déposés?

**Éléments à vérifier:**
- Bordereaux de dépôt (reçus de la banque)
- Journal de caisse (registre interne)
- Relevé bancaire (quand disponible, parfois le lendemain)

**Exemple:**
- Journal indique: 5 000 $ déposés
- Bordereau bancaire confirme: 5 000 $
- Statut: ✅ Match

#### C. Encaissements des Agents
**Question:** Les agents ont-ils remis tout l'argent collecté?

**Éléments à vérifier:**
- Liste des membres visités par chaque agent
- Reçus émis aux membres
- Cash physiquement remis par l'agent à la caisse

**Exemple:**
- Agent déclare avoir collecté: 1 500 $
- Reçus totaux: 1 500 $
- Cash remis: 1 450 $
- Écart: -50 $ → Le superviseur demande une explication

---

### 5. Validation Finale
**Qui:** Directeur  
**Quand:** Après la réconciliation du superviseur

**Actions:**
1. Le directeur revoit tous les écarts identifiés
2. Il lit les notes d'explication du superviseur
3. Il prend une décision:
   - ✅ **Approuver** → Tout est OK ou les écarts sont justifiés
   - ❌ **Demander correction** → Il faut revoir quelque chose

---

### 6. Verrouillage de la Journée
**Qui:** Système (automatique après approbation)  
**Quand:** Après validation du directeur

**Résultat:**
- ❌ Aucune modification possible
- ✅ Enregistrement permanent dans l'historique
- ✅ Trace complète de qui a fait quoi (audit trail)

**Terminologie:**
- **Audit trail** = Historique complet et immuable de toutes les actions
  - Qui a ouvert la caisse?
  - Qui a fait les transactions?
  - Qui a révisé?
  - Qui a approuvé?
  - Quand chaque action a été faite?

---

## 🖥️ Structure des Écrans

### Écran 1: Liste des Journées
**Ce qu'on y voit:**
- Tableau de toutes les journées (aujourd'hui, hier, etc.)
- Pour chaque jour:
  - Date
  - Statut (Ouvert / Soumis / Révisé / Approuvé / Verrouillé)
  - Écarts totaux
  - Actions disponibles

**Actions possibles:**
- 🔓 **Ouvrir** → Commencer une nouvelle journée
- ✏️ **Continuer réconciliation** → Reprendre une réconciliation en cours
- 📖 **Voir historique** → Consulter les détails d'une journée passée

---

### Écran 2: Détails de la Journée
**Sections principales:**

#### A. Résumé (En haut)
Aperçu rapide des chiffres clés:
- 💰 Cash d'ouverture: `2 000 $`
- 📊 Cash théorique: `7 130 $`
- 💵 Cash réel: `7 100 $`
- ⚠️ Écart total: `-30 $`
- 🏷️ Statut: `En révision`

#### B. Transactions (Onglet 1)
Liste de toutes les transactions du jour avec:
- Heure
- Type (Dépôt, Retrait, etc.)
- Montant
- Membre concerné
- Boutons d'action:
  - ✅ Marquer comme **Match**
  - ⚠️ Marquer comme **Écart**
  - 🕐 Marquer comme **En attente**

#### C. Dépôts Bancaires (Onglet 2)
Tableau des dépôts avec:
- Numéro de bordereau
- Montant attendu
- Montant confirmé (selon bordereau)
- Statut
- Notes

#### D. Encaissements Agents (Onglet 3)
Pour chaque agent:
- Nom de l'agent
- Montant déclaré (ce qu'il dit avoir collecté)
- Montant remis (ce qu'il a physiquement donné)
- Écart
- Liste des reçus

#### E. Notes du Superviseur (Bas de page)
- Zone de texte pour ajouter des commentaires
- Historique de tous les commentaires précédents
- Horodatage de chaque note

#### F. Actions (Boutons en bas)
Selon le rôle:
- **Caissier:** Soumettre pour révision
- **Superviseur:** Soumettre pour validation
- **Directeur:** Approuver et verrouiller

---

### Écran 3: Détail d'un Écart
**Quand on clique sur un écart**, on voit:

**Informations affichées:**
- Transaction liée (si applicable)
- 📊 Montant attendu: `100 $`
- 💵 Montant réel: `95 $`
- ⚠️ Écart calculé automatiquement: `-5 $`
- 📝 Zone de notes (obligatoire pour expliquer)

**Exemple de note:**
> "Membre a donné un billet de 100 $ déchiré. Remplacé par un billet neuf. Billet abîmé envoyé à la banque pour échange. Voir reçu #478."

---

### Écran 4: Historique
**Ce qu'on y trouve:**
- Liste de toutes les journées passées
- Filtres:
  - Par date
  - Par statut
  - Avec/sans écarts
- Pour chaque journée:
  - Date
  - Montants clés
  - Écarts (résolus / non résolus)
  - Qui a validé
- Option d'export CSV

---

## 🎯 Résumé Simple

### Le flux en une phrase
1. **Ouverture:** Caissier compte l'argent de départ
2. **Journée:** Transactions enregistrées
3. **Fermeture:** Caissier compte l'argent final
4. **Réconciliation:** Superviseur vérifie que tout correspond
5. **Validation:** Directeur approuve
6. **Verrouillage:** Plus aucune modification possible

### Les 3 questions essentielles
1. ❓ **Le cash physique = cash théorique?**
2. ❓ **Les dépôts bancaires sont confirmés?**
3. ❓ **Les agents ont remis tout l'argent?**

Si la réponse est **OUI** aux 3 → ✅ Journée validée  
Si **NON** → ⚠️ Écart à expliquer et justifier

---

## 📖 Glossaire des Termes

| Terme | Définition Simple |
|-------|------------------|
| **Fond de caisse** | Argent de départ dans la caisse |
| **Montant théorique** | Ce qu'on devrait avoir selon le système |
| **Montant réel** | Ce qu'on a vraiment compté |
| **Écart** | Différence entre théorique et réel |
| **Match** | Les montants correspondent parfaitement |
| **Bordereau** | Reçu de dépôt bancaire |
| **Réconciliation** | Vérification que tout correspond |
| **Audit trail** | Historique complet de qui a fait quoi |
| **Verrouillage** | Fermeture définitive, plus de modifications |
| **Flux entrants** | Argent qui entre (dépôts) |
| **Flux sortants** | Argent qui sort (retraits) |

---

## ✅ Checklist Quotidienne

### Matin (Caissier)
- [ ] Compter le cash physique
- [ ] Enregistrer le montant d'ouverture
- [ ] Vérifier que le système est opérationnel

### Journée (Caissier)
- [ ] Enregistrer toutes les transactions
- [ ] Émettre des reçus
- [ ] Recevoir les encaissements des agents

### Soir (Caissier)
- [ ] Générer le rapport journalier
- [ ] Compter le cash final
- [ ] Comparer avec le montant théorique
- [ ] Soumettre pour révision

### Révision (Superviseur)
- [ ] Vérifier le cash en caisse
- [ ] Vérifier les dépôts bancaires
- [ ] Vérifier les encaissements agents
- [ ] Ajouter des notes pour tout écart
- [ ] Soumettre pour validation

### Validation (Directeur)
- [ ] Revoir tous les écarts
- [ ] Lire les explications du superviseur
- [ ] Approuver ou demander correction
- [ ] Verrouiller la journée

---

**Document créé le:** 13 février 2026  
**Version:** 1.0  
**Pour:** Module Trésorerie CAPOSA
