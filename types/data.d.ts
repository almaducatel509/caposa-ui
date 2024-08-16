import React from "react";
export interface PropsLayout {
  children: React.ReactNode;
}

export interface Option {
    label: string;
    value: string;
  }

  interface Base {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface User {
    id: number;
    name: string;
    role: string;
    team: string;
    status: string;
    age: string;
    avatar: string;
    email: string;
  }
//   J'ai ajouté une section `authorized_persons` dans l'interface Account pour permettre à d'autres personnes d'effectuer des retraits sur le compte en l'absence du titulaire. Chaque personne autorisée est définie par un nom, une relation et un niveau d'autorisation (`full` ou `limited`). 
  export interface AuthorizedPerson {
    name: string;
    relationship: string;
    authorization_level: 'full' | 'limited';
}
  export interface Member extends Base {
    member_id: string; 
    first_name: string; 
    last_name: string; 
    //la date etait string je l'ai modifier en date
    date_of_birthday: Date; 
    address: string; 
    phone_number: string; 
    sexe: 'F' | 'M'
  //énumérations spécifiques pour les personne autorise. 
    authorized_persons: 
    'Spouse'|'Sibling' |'Friend'|'Guardian' |'Child'| 'Partner' |'Colleague' | 'Other'
    status: 'active' | 'desactive';    
    status: 'active' | 'desactive';
}

export interface Transaction extends Base {
    amount: number;
    date: Date;
    description: string;
    transaction_type: 'deposit' | 'withdrawal' | 'transfer';
    employee_id: string; 
    account_number: string; 
}

export interface Loan extends Base {
    loan_id: string; 
    employee_id: string; 
    member_id: string;
    account_number: string; 
    // modifier  types de pret
    loan_type: 'Personal_loan' | 'Mortgage_loan' | 'Business_loan';     
    loan_amount: number; 
    interest_rate: number; 
    loan_duration: number; 
    payment_frequency: string; 
    due_date: Date; 
    guarantor_account_id: string; 
    request_date: Date; 
    approval_date: Date; 
    disbursement_date: Date; 
    status: 'pending' | 'paid';
}

export interface Account extends Base {
    account_number: string; 
    balance: number;
    // J'ai modifié l'interface Account pour inclure les types de comptes    
    account_type: 'checking' | 'savings';
    // current_balance peut être calculé à partir des transactions si elles sont toutes stockées du coup je ne vois pas la necessite de l'inclure.
    email: string;
    member_id: string;
    // J'ai remplace securite question and answer par securityInfo 
    security_info: string;
    additional_accounts: string;
    monthly_income: number;
    monthly_expenses: number; 
// J'ai modifié le statut dans l'interface Account en `status: 'lock' | 'unlock'` 
//pour permettre aux membres de verrouiller les retraits sur un compte pour une période déterminée.
    status: 'lock' | 'unlock';
}

export interface Employee extends Base {
    employee_id: string; 
    first_name: string; 
    last_name: string; 
    date_of_birth: Date; 
    phone_number: string; 
    address: string; 
    sexe: 'F' | 'M';
    email: string;
    // J'ai modifié l'interface les types de transactions qui indique par des booléens quels types de transactions l'employé est autorisé à effectuer.
    allowed_transactions: {
        deposit: boolean;
        withdrawal: boolean;
        transfer: boolean;
    };
    payment_ref: string; 
}

export interface Payment extends Base { 
    payment_id: string; 
    payment_ref: string; 
    account_number: string; 
    transaction_id: string; 
} 


// Interface pour les horaires d'ouverture
export interface OpeningHours {
    monday: string;  // Exemple: "08:00-17:00"
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday?: string; // Optionnel si la branche est fermée le samedi
    sunday?: string; // Optionnel si la branche est fermée le dimanche
}

// Interface pour les jours fériés spécifiques
export interface Holiday {
    date: Date;
    description: string; // Exemple: "Jour de l'Indépendance"
}

export interface Branch {
    branch_id: string; 
    branch_name: string; 
    branch_address: string; 
    branch_phone_number: string; 
    branch_email: string; 
    branch_manager_id: string; 
    branch_code: string; 
    number_of_posts: number; 
    number_of_tellers: number; 
    number_of_clerks: number; 
    number_of_credit_officers: number; 
    opening_date: Date; 
    opening_hours: OpeningHours; // Ajout des horaires d'ouverture
    holidays: Holiday[]; // Ajout des jours fériés spécifiques
}

export interface Analysis extends Base { 
    analysis_id: string; 
    transaction_id: string; 
    analysis_timestamp: Date; 
    analysis_amount: number; 
    notes: string; 
    current_balance: number; 
    authorization_code: string; 
    // j'ai enleve les redondances
}

// On doit s'assurer que les champs critiques, comme les identifiants et les dates, sont toujours fournis.
 
export interface Treasury extends Base { 
    account_number: string; 
    member_id: string; 
    branch_id: string; 
    loan_id: string; 
    employee_id: string; 
    //J'ai ajoute un champ amount pour suivre le montant géré par la trésorerie.

    amount: number;
}

export interface Report extends Base { 
    report_id: string; 
    transaction_id: string; 
    member_id: string; 
    account_id: string; 
    branch_id: string; 
    employee_id: string; 
    report_start_date: Date; 
    report_end_date: Date; 
    status: 'open' | 'closed'; 
    comments: string; 
}
