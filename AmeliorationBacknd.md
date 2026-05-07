## Recommandations pour Amélioration du Backend 

1. Relations manquantes à ajouter 

- Ajouter les ForeignKey manquantes dans Transaction : employee, modele_trans, lien avec Account. 

- Dans Loan: employee, disbursement_date. 

- Dans Treasury: member, account, loan, employee, branch. 

2. Endpoints métier indispensables 

- Créer endpoint /transactions/deposit/ pour gérer les dépôts. 

- Créer endpoint /transactions/withdraw/ pour gérer les retraits. 

- Créer endpoint /transactions/transfer/ pour les transferts internes/externes. 

3. Validation métier 

- Empêcher le solde négatif. 

- Empêcher le transfert vers le même compte. 

- Empêcher la suppression d'un compte avec solde non nul. 

- Vérification des limites de retrait et autorisations. 

4. Normalisation du backend 

- Renommer Treasure -> Treasury. 

- Corriger acount_number -> account_number. 

- Harmoniser Analysis vs Analyse. 

- Ajouter - account_type: 'savings' | 'checking' ' ' 

Exposer une route RESTful : GET /members/ :id/accounts/ qui renvoie la liste des comptes pour le membre (évite le filtrage côté client). 

Permettre POST /members/ :id/accounts/ pour créer un compte directement lié au membre (plus propre). 

Si POST /accounts/ reste nécessaire, accepter au moins member_id et retourner le compte créé avec member_details. 

 

5. Ajout d'enums pour les types de transaction 

- Créer TransactionType (DEPOSIT, WITHDRAWAL, TRANSFER, LOAN_REPAYMENT). 

6. Logging & Audit 

- Créer automatiquement un enregistrement dans Analysis pour chaque transaction. 

- Inclure employee_id, branch_id, member_id, transaction_id, account_id, timestamp, action. 

7. Sécurisation des données 

- Rendre read-only les champs sensibles (created_by, account_number). 

- Utiliser PROTECT sur les données critiques (Loan, Treasury, Transaction). 

8. Améliorations de structure 

- Ajouter related_name partout pour cohérence. 

- Ajouter auto-génération du branch_code dans Branch. 

9. Enregistrement automatique des actions
    Chaque action importante doit générer une entrée d’audit, incluant notamment :

- action effectuée

- entité concernée (type + ID)

- avant/après (JSON)

- utilisateur (ID + rôle)

- contexte (IP, device)

- horodatage

L’objectif : pouvoir reconstruire l’historique complet de n’importe quel élément.

10. Structure de données attendue
    Une table dédiée doit centraliser toutes les entrées d’audit :

- action

- entity_type

- entity_id

- before_data

- after_data

- user_id

- ip_address

- device

- created_at

Le format doit rester simple, lisible, et facile à filtrer.

11. Accès filtré par entité
    Le backend doit permettre de récupérer l’historique :

- globalement (toutes les actions)

- par entité (entity_type + entity_id)

- Cela permet d’afficher l’audit dans chaque page de détail côté frontend.

12. Immutabilité
    Les entrées d’audit doivent être :

- non modifiables

- non supprimables

- Pour garantir une traçabilité conforme aux standards bancaires.