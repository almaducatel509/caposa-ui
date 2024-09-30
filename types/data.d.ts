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
  
  
  export interface Member extends Base {
    memberId: string; 
    firstName: string; 
    lastName: string; 
    dateOfBirth: Date; 
    address: string; 
    phoneNumber: string; 
    accountType: string; 
    accountNumber: string; 
    currentBalance: number; 
    securityInfo: string; 
    preferences: string[]; 
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
  balance: number;
  member_id: string;
}
export interface Employee extends Base{
  employeeId: string; 
  firstName: string; 
  lastName: string; 
  dateOfBirth: Date; 
  phoneNumber: string; 
  address: string; 
  transactionType: string; 
  paymentRef: string; 
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
  accountNumber: string; 
  memberId: string; 
  branchId: string; 
  loanId: string; 
  employeeId: string; 
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
