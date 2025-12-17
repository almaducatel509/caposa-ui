# Descriptions des Entités et Relations

## Member
- **Description**: Représente un membre au sein du système, incluant des informations personnelles et des détails de contact.
- **Relations**: 
  - `member_id` sert de clé étrangère dans les tables `Transaction`, `Account`, `Loan`, et `Payment`.
- **Cas d'utilisation**: Utilisé pour suivre les informations personnelles des membres et leurs transactions financières.

## Transaction
- **Description**: Enregistre les transactions financières effectuées par les membres.
- **Relations**:
  - `member_id` est lié à la table `Member`.
  - `account_number` peut être lié à la table `Account`.
  - `transaction_id` est lié à `Payment` et potentiellement à d'autres entités.
  - 'employee_id` est lié à `Employee`.
  - 'modele_trans' : Le type ou le modèle de la transaction est spécifié.
- **Cas d'utilisation**: Utilisé pour enregistrer et suivre les transactions des membres.

## Loan
- **Description**: Représente les prêts contractés par les membres, y compris les détails tels que le type de prêt, le montant, et les conditions.
- **Relations**:
  - `member_id` est lié à la table `Member`.
  - `loan_id` est utilisé dans la table `Treasury`
  - 'guarantor_account_id'  Le prêt peut être garanti par un autre compte.
  - 'employee_id' L’employé(s) qui est associe a ce prêt est identifié.
  - 'disbursement_date' représente la date à laquelle les fonds du prêt sont effectivement versés au bénéficiaire; Permet de suivre précisément quand les       fonds ont été débloqués pour le prêt; Aide à gérer les flux de trésorerie et à s’assurer que les fonds sont disponibles à la date prévue; Crucial pour la vérification de la conformité aux politiques internes et aux réglementations. Aide les gestionnaires financiers à planifier les besoins en liquidités et à prévoir les sorties de fonds.
- **Cas d'utilisation**: Utilisé pour suivre les détails des prêts, y compris les remboursements et les statuts.

## Account
- **Description**: Détaille le compte financier d'un membre au sein du système.
- **Relations**:
  - `member_id` est lié à la table `Member`.
  - `employee_id` peut être lié à la table `Employee`.
  - `account_number` pourrait être référencé dans `Transaction`, `Loan`, et `Treasury`.
- **Cas d'utilisation**: Utilisé pour gérer les soldes de comptes, les types de comptes, et les informations de sécurité financière.
id | type_compte | taux_interet | frais_service_mensuel | limite_trait
---------------------------------------------------------------
 1 | epargne     | 2.5          | 0.00                  | null
 2 | cheques     | null         | 5.00                  | 1000
 3 | terme       | 3.0          | 0.00                  | null

## Employee
- **Description**: Représente un employé, incluant des informations personnelles et professionnelles.
- **Relations**:
  - `employee_id` est lié aux tables `Account`, `Branch`, `Treasury`, et `Analysis`, 'transaction'.
- **Cas d'utilisation**: Utilisé pour la gestion des employés et leurs rôles dans diverses transactions.

## Loan
- **Description** : Représente les prêts contractés par les membres, y compris les détails tels que le type de prêt, le montant et les conditions.

Relations :

member_id est lié à la table Member.

loan_id est utilisé dans la table Treasury.

guarantor_account_id : le prêt peut être garanti par un autre compte.

employee_id : l’employé associé au prêt est identifié.

disbursement_date : représente la date à laquelle les fonds du prêt sont effectivement versés au bénéficiaire.

Permet de suivre précisément quand les fonds ont été débloqués.

Aide à gérer les flux de trésorerie et à s’assurer que les fonds sont disponibles à la date prévue.

Crucial pour la conformité aux politiques internes et réglementations.

Utile pour planifier les besoins en liquidités et prévoir les sorties de fonds.

- **Cas d'utilisation** : Utilisé pour suivre les détails des prêts, y compris les remboursements et les statuts.

- ## Dépôt
Description : Mouvement entrant où un membre verse de l’argent dans son compte au sein de l’institution.

Relations :

transaction_id est lié à Transaction.

member_id identifie le membre qui effectue le dépôt.

account_number identifie le compte crédité.

employee_id identifie l’employé qui enregistre ou valide le dépôt.

Champs spécifiques :

deposit_type : espèce, chèque, virement, mobile.

reference_code : numéro de reçu ou justificatif.

Cas d’utilisation :

Créditer un compte membre.

Enregistrer les dépôts en espèces ou par chèque.

Générer un reçu ou rapport de dépôt.

Permettre l’impression, la modification ou l’annulation du dépôt.

- ## Retrait
Description : Mouvement sortant où un membre retire de l’argent de son compte.

Relations :

transaction_id est lié à Transaction.

member_id identifie le membre qui effectue le retrait.

account_number identifie le compte débité.

employee_id identifie l’employé responsable du retrait.

Champs spécifiques :

withdrawal_method : espèces, virement, mobile.

authorization_code : code de sécurité ou validation.

- **Cas d’utilisation** :

Débiter un compte membre.

Suivre les retraits en espèces ou par virement.

Gérer les limites de retrait et les validations.

Fournir un rapport ou reçu de retrait.

- ## Transfert
Description : Mouvement interne ou externe entre deux comptes, appartenant au même membre ou à des membres différents.

Relations :

transaction_id est lié à Transaction.

member_id identifie le membre initiateur.

source_account_number : compte débité.

destination_account_number : compte crédité.

employee_id identifie l’employé qui valide le transfert.

Champs spécifiques :

transfer_type : interne (entre comptes de la même institution) ou externe (vers une autre institution).

transfer_reason : épargne, remboursement, don, etc.

- **Cas d’utilisation** :

Transférer des fonds entre comptes.

Gérer les transferts garantissant un prêt.

Suivre les transferts inter-membres ou inter-agences.

Générer un rapport ou justificatif de transfert.

## Branch
- **Description**: Représente une agence physique de l'organisation, incluant des informations sur la localisation et le personnel.
- **Relations**:
  - `branch_id` pourrait être lié à `Employee`, `Analysis`, `Treasury`, et `Report`.
- **Cas d'utilisation**: Utilisé pour gérer les informations au niveau des agences, y compris le personnel et les opérations.

## Analysis
- **Description**: Implique l'analyse des transactions, des comptes, et des activités des membres au sein d'une branche.
- **Relations**:
  - `transaction_id`, `member_id`, `account_id`, `branch_id`, et `employee_id` sont liés à leurs tables respectives.
- **Cas d'utilisation**: Conformité et Audit; Utilisé pour analyser les activités financières et générer des insights sur les transactions des membres.

## Treasury
- **Description**: Représente les activités de trésorerie liées aux comptes, aux prêts, et aux branches. 
- **Relations**:
  - `account_number`, `member_id`, `branch_id`, `loan_id`, et `employee_id` sont liés à leurs tables respectives.
- **Cas d'utilisation**: Associer les prêts aux comptes des membres pour une gestion efficace; Identifier les succursales responsables de chaque compte; Identifier les succursales responsables de chaque compte; Suivre quel employé est responsable de chaque compte ou prêt.


## Report
- **Description**: Représenter les rapports de transactions dans une caisse populaire.
- **Relations**: Membre (member_id), Compte (account_id), Succursale (branch_id), Employé (employee_id), Transaction (transaction_id) : Le rapport est   
   directement lié à une transaction spécifique.
- **Cas d'utilisation**: Suivi des Transactions, Audit et Vérification
- **explication des champ importants et sa responsabilité** :
    branch_id : Identifiant de la succursale où la transaction a eu lieu.
    transaction_type : Type de transaction (par exemple, dépôt, retrait).
    description : Description de la transaction ou du rapport.
    current_balance : Solde actuel du compte après la transaction.
    status : Statut du rapport (par exemple, en cours, complété).
    comments : Commentaires supplémentaires concernant le rapport ou la transaction.
- **Permet de**:
    Suivre les transactions : Enregistrer et suivre chaque transaction effectuée par les membres.
    Gérer les comptes : Assurer que les informations sur les comptes et les soldes sont à jour.
    Assurer la transparence : Fournir des rapports détaillés pour la vérification et l’audit.
    Faciliter la gestion des branches : Suivre les activités spécifiques à chaque succursale.
    Améliorer la sécurité : Utiliser des codes d’autorisation pour valider les transactions.
  
## interface Branch 
 - **OpeningHours Interface**: Cette interface définit les horaires d'ouverture pour chaque jour de la semaine. Les jours optionnels (comme samedi et dimanche) sont marqués avec ? pour indiquer qu'ils peuvent être omis si la branche est fermée ces jours-là.

**Holiday Interface**: Cette interface permet de spécifier des jours fériés spécifiques. Chaque jour férié est défini par une date et une description (comme "Jour de l'Indépendance").
