Alma, je te fais une **note claire, professionnelle et prête à envoyer au backend dev**, pour qu’il comprenne EXACTEMENT la logique métier que CAPOSA doit respecter.

Je te la rédige comme une vraie *spec technique*, concise, structurée, et impossible à mal interpréter.

---

# 📄 **NOTE TECHNIQUE — Gestion Session & Caisse (CAPOSA)**  
**À destination : équipe backend**  
**Objet : Architecture métier — Session & Caisse**

---

## 🎯 **Résumé métier**
Dans CAPOSA, l’ouverture et la fermeture de la caisse **déclenchent automatiquement** l’ouverture et la fermeture de la session du caissier.

👉 **Ouvrir la caisse = ouvrir la session**  
👉 **Fermer la caisse = fermer la session**

Cependant, pour garder une architecture propre, scalable et auditable, **les deux entités doivent être séparées en backend**.

---

# 🧱 **1. Modèle : Session (Shift du caissier)**  
La session représente **la période de travail du caissier**, indépendamment du cash.

### Champs recommandés :
- `id`
- `cashier` (FK User)
- `opened_at`
- `closed_at`
- `status` (`open` / `closed`)
- `total_deposits`
- `total_withdrawals`
- `total_transfers`
- `discrepancy` (écart final)
- `audit_notes` (optionnel)

### Rôle :
- Conteneur de la journée de travail  
- Traçabilité  
- Auditabilité  
- Historique des opérations  

---

# 🧱 **2. Modèle : Cashbox (Caisse physique)**  
La caisse représente **l’état financier réel** du cash manipulé.

### Champs recommandés :
- `id`
- `session` (FK Session)
- `cashier` (FK User)
- `cashbox_number`
- `opening_balance`
- `closing_balance`
- `responsible_cash_id`
- `supervisor`
- `discrepancy`
- `status` (`open` / `closed`)

### Rôle :
- Gestion du cash physique  
- Calcul des écarts  
- Validation par superviseur  
- Sécurité financière  

---

# 🔗 **3. Relation entre Session & Caisse**
- Une **caisse** est toujours liée à **une seule session**.  
- Une **session** ne peut pas exister sans caisse dans CAPOSA (logique métier choisie).  
- Une session peut rester ouverte même si l’utilisateur est déconnecté (inactivité).  
- La session ne se ferme **que** lors de la fermeture de la caisse.

---

# 🟩 **4. Logique métier à implémenter**

## ✔️ **Ouvrir la caisse**
Route : `POST /cashbox/open/`

Actions backend :
1. Créer une nouvelle **Session** (status = open)
2. Créer une nouvelle **Cashbox** liée à cette session
3. Enregistrer :
   - montant d’ouverture  
   - superviseur  
   - responsable cash  
   - numéro de caisse  
4. Retourner la session + caisse

---

## ✔️ **Fermer la caisse**
Route : `POST /cashbox/{id}/close/`

Actions backend :
1. Calculer le solde attendu  
2. Calculer l’écart  
3. Mettre à jour la Cashbox (status = closed)  
4. Fermer la Session liée (status = closed, closed_at = now)  
5. Retourner les totaux + écart

---

## ✔️ **Transactions**
Chaque transaction doit obligatoirement être liée à :
- une **session ouverte**
- une **caisse ouverte**

Si aucune caisse n’est ouverte → **refuser la transaction**.

---

# 🟥 **5. Ce qu’il ne faut PAS faire**
- ❌ Ne pas ouvrir la session automatiquement à la connexion  
- ❌ Ne pas fermer la session automatiquement en cas d’inactivité  
- ❌ Ne pas créer de transactions sans caisse ouverte  
- ❌ Ne pas fusionner les modèles Session et Cashbox  

---

# 🟦 **6. Pourquoi cette architecture ?**
- Auditabilité bancaire  
- Traçabilité claire  
- Séparation des responsabilités  
- Évolutivité (multi-caisses, multi-shifts, audits externes)  
- Sécurité financière  

---

# 🟣 **7. Résultat attendu**
CAPOSA devient un système :

- propre  
- robuste  
- conforme aux pratiques bancaires  
- facile à maintenir  
- facile à auditer  
