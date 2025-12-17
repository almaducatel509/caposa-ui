checklist pratique pour ton redémarrage afin de rester efficace :



## 📝 Plan de travail après redémarrage

### 1. **Relancer ton environnement**
- Ouvrir ton projet `caposa-ui` dans VS Code.  
- Lancer ton serveur Next.js (`npm run dev` ou `yarn dev`).  
- Vérifier que ton fichier `mockAccountTypes.ts` est bien importé.

---

### 2. **Formulaire de création de compte**
- Créer un composant `CreateAccountForm`.  
- Ajouter un **Select** pour choisir le type de compte (`épargne`, `chèques`, `terme`).  
- Quand un type est choisi → récupérer les valeurs du mock (`taux_interet`, `frais_service_mensuel`, `limite_trait`).  
- Afficher ces valeurs dans des champs **read-only**.

---

### 3. **Afficher les valeurs en console**
- À la soumission du formulaire (bouton "Créer"), logguer l’objet complet :
  ```tsx
  console.log("Nouveau compte:", formData);
  ```
- Vérifier que les champs dynamiques s’affichent correctement selon le type choisi.

---

### 4. **Tester les cas**
- Sélectionner **épargne** → voir le taux d’intérêt.  
- Sélectionner **chèques** → voir frais mensuels + limite de retrait.  
- Sélectionner **terme** → voir taux d’intérêt.  
- Confirmer que les champs inutiles restent masqués.

---

### 5. **Mettre dans une Grid**
- Utiliser un composant `Grid` ou `Table` pour afficher les comptes créés.  
- Chaque ligne = un compte avec ses paramètres (type, taux, frais, limite).  
- Attacher le bouton "Créer" → ajoute une ligne dans la Grid avec les données du formulaire.

---

### 6. **Préparer la transition backend**
- Centraliser ton mock dans `app/lib/mockAccountTypes.ts`.  
- Créer une fonction `fetchAccountTypes()` qui retourne le mock pour l’instant.  
- Quand le backend sera prêt, remplacer par un appel API `/api/account/types`.

---

## ✅ Résultat attendu
- Tu peux créer un **nouveau compte** via ton formulaire.  
- Les valeurs (taux, frais, limite) s’affichent automatiquement selon le type choisi.  
- Tu vois l’objet en console pour debug.  
- Tu ajoutes le compte dans une Grid pour visualiser la liste.  
- Tu es prêt à brancher l’API dès qu’elle sera disponible.

