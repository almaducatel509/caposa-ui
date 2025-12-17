Voici le résumé rapide :

* **Schemas et types membres** :

  * Créé/ajusté `MemberData`, `memberUiSchema`, `MemberApiPayload` et `toMemberApiPayload`.
  * Ajouté les champs nécessaires (`initial_balance`, `total_amount`, etc.) pour supporter le tri/filtrage sans modifier le backend.

* **Utils front** :

  * Ajouté `tierOf`, `tierLabel`, `tierColor`, `monthsSince`, `calculateAge`, etc. dans `utils.ts`.
  * Centralisé le formatage (`formatBalance`, `accountTypeLabel`) pour garder la cohérence avec employés.

* **Composants** :

  * Aligné **MemberCard**, **MemberGrid** et **MemberDetailModal** sur le style des employés (EmployeeCard/Modal) → affichage uniforme.
  * Mis en place le message “Créer un compte” si un membre n’a aucun compte.
  * Corrigé les erreurs de propriétés manquantes (`membership_type`, `account_type`) en remplaçant par `tierOf(member)` et en retirant les champs obsolètes.

* **Backend** :

  * Aucun changement majeur requis côté API aujourd’hui, juste constaté qu’un vrai modèle de **Compte** devra être créé plus tard pour gérer plusieurs comptes par membre.
