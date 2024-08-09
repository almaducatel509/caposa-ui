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
    member_id: string; 
    first_name: string; 
    last_name: string; 
    date_of_birthday: string; 
    address: string; 
    phone_number: string; 
    preferences: string[]; 
    status: 'active' | 'desactive';
}

export interface Transaction extends Base {
    amount: number;
    date: Date;
    description: string;
    member_id: string;
    modele_trans: string;
    employee_id: string; 
    account_number: string; 
}

export interface Loan extends Base {
    loan_id: string; 
    employee_id: string; 
    member_id: string;
    account_number: string; 
    loan_type: string; 
    loan_amount: number; 
    interest_rate: number; 
    loan_duration: string; 
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
    account_type: string; 
    current_balance: number; 
    email: number;
    member_id: string;
    employee_id: string;
    security_question: string;
    security_answer: string;
    additional_accounts: string;
    monthly_income: number;
    monthly_expenses: number;  
}

export interface Employee extends Base {
    employee_id: string; 
    first_name: string; 
    last_name: string; 
    date_of_birth: Date; 
    phone_number: string; 
    address: string; 
    transaction_type: string; 
    payment_ref: string; 
}

export interface Payment extends Base { 
    payment_id: string; 
    payment_ref: string; 
    account_number: string; 
    transaction_id: string; 
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
}

export interface Analysis extends Base { 
    analysis_id: string; 
    transaction_id: string; 
    employee_id: string; 
    analysis_date: Date; 
    analysis_time: string; 
    analysis_amount: number; 
    description: string; 
    current_balance: number; 
    category: string; 
    status: string; 
    authorization_code: string; 
    comments: string; 
} 

export interface Treasury extends Base { 
    account_number: string; 
    member_id: string; 
    branch_id: string; 
    loan_id: string; 
    employee_id: string; 
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
    transaction_type: string; 
    description: string; 
    current_balance: number; 
    status: string; 
    comments: string; 
}
