import { z } from 'zod';

// ============================================================================
// RELATED ENTITIES - FULL INTERFACES (imported from other modules)
// ============================================================================

// ──────────────────────────── MEMBER (Parent Relation) ────────────────────────────
export interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  phone_number: string;
  email?: string | null;
  address: string;
  city: string;
  department_code: string;
  gender: 'M' | 'F' | 'other';
  date_of_birthday: string;
  initial_balance?: number | null;
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
  full_name?: string;
  department_name?: string;
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  id_number: string;
  phone_number: string;
  department_code: string;
  city: string;
  address: string;
  gender: string;
  date_of_birthday: string;
  email?: string;
  initial_balance?: number;
}

// ──────────────────────────── EMPLOYEE (Manager Relation) ────────────────────────────
export interface EmployeeData {
  id: string;
  username?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  payment_ref: string;
  date_of_birth?: string;
  address?: string;
  gender?: string;
  posts?: string[];
  photo_profil?: string | null;
  photo_url?: string | null;
  branch: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  role?: string;
  branch_details?: {
    id: string;
    branch_name: string;
    address?: string;
  };
  posts_details?: Array<{
    id: string;
    name: string;
    post_name?: string;
  }>;
  name?: string;
}

export interface EmployeeFormData {
  user: {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  };
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
  gender: string;
  payment_ref: string;
  branch: string;
  posts: string[];
  photo_profil?: File | null;
}

// ──────────────────────────── TRANSACTION (Child Relation) ────────────────────────────
export interface TransactionData {
  id: string;
  account_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'interest';
  amount: number;
  balance_before: number;
  balance_after: number;
  date: string;
  description?: string;
  reference_number?: string;
  processed_by?: string; // Employee ID
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  
  // Relations enrichies
  account_details?: {
    noCompte: string;
    typeCompte: string;
    member_name?: string;
  };
  employee_details?: {
    name: string;
    username: string;
  };
}

export interface TransactionFormData {
  account_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'interest' | '';
  amount: number;
  description?: string;
  reference_number?: string;
  date: string;
  processed_by?: string;
}

// ──────────────────────────── LOAN (Child Relation) ────────────────────────────────
export interface LoanData {
  id: string;
  account_id: string;
  member_id: string;
  loan_amount: number;
  interest_rate: number;
  loan_term_months: number;
  monthly_payment: number;
  remaining_balance: number;
  status: 'pending' | 'active' | 'paid' | 'defaulted' | 'cancelled';
  start_date: string;
  due_date: string;
  approved_by?: string; // Employee ID
  created_at?: string;
  updated_at?: string;
  
  // Relations enrichies
  account_details?: {
    noCompte: string;
    typeCompte: string;
  };
  member_details?: {
    full_name: string;
    phone_number: string;
  };
  employee_details?: {
    name: string;
  };
  
  // Statistiques
  total_paid?: number;
  payments_made?: number;
  payments_remaining?: number;
}

export interface LoanFormData {
  account_id: string;
  member_id: string;
  loan_amount: number;
  interest_rate: number;
  loan_term_months: number;
  start_date: string;
  approved_by?: string;
}

// ──────────────────────────── TREASURY (Child Relation) ────────────────────────────
export interface TreasuryData {
  id: string;
  account_id: string;
  operation_type: 'cash_in' | 'cash_out' | 'transfer' | 'adjustment';
  amount: number;
  date: string;
  description?: string;
  reference_number?: string;
  performed_by: string; // Employee ID
  status: 'completed' | 'pending' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  
  // Relations enrichies
  account_details?: {
    noCompte: string;
    typeCompte: string;
    member_name?: string;
  };
  employee_details?: {
    name: string;
    username: string;
  };
}

export interface TreasuryFormData {
  account_id: string;
  operation_type: 'cash_in' | 'cash_out' | 'transfer' | 'adjustment' | '';
  amount: number;
  date: string;
  description?: string;
  reference_number?: string;
  performed_by: string;
}

// ============================================================================
// ACCOUNT ZOD SCHEMAS
// ============================================================================

// Schéma de validation pour Compte
export const accountSchema = z.object({
  idCompte: z.string().min(1, "ID Compte est requis"),
  noCompte: z.string()
    .min(8, "Numéro de compte doit avoir au moins 8 caractères")
    .regex(/^\d{3}-\d{6}$/, "Format: 001-123456"),
  member_id: z.string().min(1, 'Le membre est requis'),
  idEmployee: z.string().optional().nullable(), // Employee qui gère le compte
  typeCompte: z.enum(['epargne', 'cheques', 'terme'], {
    errorMap: () => ({ message: "Type doit être: épargne, chèques ou terme" })
  }),
  soldeActuel: z.number()
    .min(0, "Solde ne peut pas être négatif")
    .multipleOf(0.01, "Solde doit avoir maximum 2 décimales"),
  statutCompte: z.enum(['actif', 'ferme', 'suspendu'], {
    errorMap: () => ({ message: "Statut doit être: actif, fermé ou suspendu" })
  }),
  dateOuverture: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date requis: YYYY-MM-DD"),
  dateFermeture: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date requis: YYYY-MM-DD")
    .nullable()
    .optional(),
  tauxInteret: z.number()
    .min(0, "Taux d'intérêt ne peut pas être négatif")
    .max(100, "Taux d'intérêt ne peut pas dépasser 100%")
    .nullable()
    .optional(),
  limiteTrait: z.number()
    .min(0, "Limite de trait ne peut pas être négative")
    .nullable()
    .optional(),
  fraisServiceMensuel: z.number()
    .min(0, "Frais de service ne peuvent pas être négatifs")
    .multipleOf(0.01, "Frais doivent avoir maximum 2 décimales")
    .nullable()
    .optional(),
});

// Schéma pour création de compte (sans ID généré automatiquement)
export const createAccountSchema = accountSchema.omit({ 
  idCompte: true,
  soldeActuel: true, // Solde initial = 0
  dateFermeture: true // Pas de date de fermeture à la création
}).extend({
  depotInitial: z.number()
    .min(0, "Dépôt initial ne peut pas être négatif")
    .multipleOf(0.01, "Montant doit avoir maximum 2 décimales")
    .optional()
    .default(0),
});

// Schéma pour mise à jour de compte
export const updateAccountSchema = accountSchema.partial().extend({
  idCompte: z.string().min(1, "ID Compte est requis"),
});

// ============================================================================
// ACCOUNT DATA INTERFACES (what comes from API with ALL relations)
// ============================================================================

// Account data interface (what comes from API)
export interface AccountData {
  limiteCredit: any;
  id: string;
  idCompte?: string;
  noCompte: string;
  idMembre: string;
  idEmployee?: string | null;
  typeCompte: 'epargne' | 'cheques' | 'terme';
  soldeActuel: number;
  statutCompte: 'actif' | 'ferme' | 'suspendu';
  dateOuverture: string;
  dateFermeture?: string | null;
  tauxInteret?: number | null;
  limiteTrait?: number | null;
  fraisServiceMensuel?: number | null;
  created_at?: string;
  updated_at?: string;
  
  // ────────── Relations enrichies (Entités complètes) ──────────
  // Parent: Member (1:1)
  member_details?: MemberData;
  
  // Manager: Employee (N:1)
  employee_details?: EmployeeData;
  
  // Children: Transactions (1:N)
  transactions?: TransactionData[];
  
  // Children: Loans (1:N)
  loans?: LoanData[];
  
  // Children: Treasury Operations (1:N)
  treasury_operations?: TreasuryData[];
  
  // ────────── Noms enrichis (pour affichage rapide) ──────────
  member_name?: string;        // Ex: "Jean Baptiste"
  employee_name?: string;       // Ex: "Marie Claire (Manager)"
  
  // ────────── Statistiques calculées (côté API) ──────────
  total_transactions?: number;          // Nombre total de transactions
  total_deposits?: number;              // Montant total des dépôts
  total_withdrawals?: number;           // Montant total des retraits
  total_loans?: number;                 // Nombre total de prêts
  active_loan_balance?: number;         // Solde des prêts actifs
  last_transaction_date?: string;       // Date de la dernière transaction
  account_age_days?: number;            // Âge du compte en jours
  average_monthly_balance?: number;     // Solde moyen mensuel
}

// ============================================================================
// FORM DATA INTERFACES (for UI forms)
// ============================================================================

// Account form data interface (for forms)
export interface AccountFormData {
  // Basic account info
  noCompte: string;
  idMembre: string;
  idEmployee?: string;
  typeCompte: 'epargne' | 'cheques' | 'terme' | '';
  statutCompte: 'actif' | 'ferme' | 'suspendu';
  dateOuverture: string;
  dateFermeture?: string | null;
  
  // Financial details
  soldeActuel: number;
  depotInitial?: number;
  tauxInteret?: number | null;
  limiteTrait?: number | null;
  fraisServiceMensuel?: number | null;
}

// Error messages type for form validation
export interface ErrorMessages {
  [key: string]: string;
}

// Generic field errors type
export type FieldErrors<T> = {
  [K in keyof T]?: string;
};

// ============================================================================
// TYPESCRIPT TYPES FROM ZOD
// ============================================================================

export type Account = z.infer<typeof accountSchema>;
export type CreateAccount = z.infer<typeof createAccountSchema>;
export type UpdateAccount = z.infer<typeof updateAccountSchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

// Fonction helper pour valider les types de compte selon les règles métier
export const validateAccountTypeRules = (data: CreateAccount | AccountFormData): string[] => {
  const errors: string[] = [];
  const depotInitial = 'depotInitial' in data ? data.depotInitial : undefined;

  // Règles spécifiques par type de compte
  switch (data.typeCompte) {
    case 'epargne':
      if (depotInitial !== undefined && depotInitial < 25) {
        errors.push("Dépôt minimum de 25$ requis pour compte épargne");
      }
      break;
      
    case 'cheques':
      if (depotInitial !== undefined && depotInitial < 100) {
        errors.push("Dépôt minimum de 100$ requis pour compte chèques");
      }
      if (!data.limiteTrait) {
        errors.push("Limite de trait requise pour compte chèques");
      }
      break;
      
    case 'terme':
      if (depotInitial !== undefined && depotInitial < 500) {
        errors.push("Dépôt minimum de 500$ requis pour compte à terme");
      }
      if (!data.tauxInteret || data.tauxInteret <= 0) {
        errors.push("Taux d'intérêt requis pour compte à terme");
      }
      break;
  }

  return errors;
};

// Fonction pour valider le format du numéro de compte
export const validateAccountNumber = (noCompte: string): boolean => {
  return /^\d{3}-\d{6}$/.test(noCompte);
};

// Fonction pour générer un numéro de compte
export const generateAccountNumber = (typeCompte: 'epargne' | 'cheques' | 'terme'): string => {
  const prefixes = {
    epargne: '001',
    cheques: '002',
    terme: '003',
  };
  
  const prefix = prefixes[typeCompte];
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${random}`;
};

// Fonction pour convertir AccountData API → AccountFormData UI
export const toAccountFormData = (account: AccountData): AccountFormData => {
  return {
    noCompte: account.noCompte,
    idMembre: account.idMembre,
    idEmployee: account.idEmployee || undefined,
    typeCompte: account.typeCompte,
    statutCompte: account.statutCompte,
    dateOuverture: account.dateOuverture,
    dateFermeture: account.dateFermeture,
    soldeActuel: account.soldeActuel,
    tauxInteret: account.tauxInteret,
    limiteTrait: account.limiteTrait,
    fraisServiceMensuel: account.fraisServiceMensuel,
  };
};

// Fonction pour convertir AccountFormData UI → CreateAccount API payload
export const toAccountApiPayload = (formData: AccountFormData): CreateAccount => {
  const payload: any = {
    noCompte: formData.noCompte,
    idMembre: formData.idMembre,
    typeCompte: formData.typeCompte as 'epargne' | 'cheques' | 'terme',
    statutCompte: formData.statutCompte,
    dateOuverture: formData.dateOuverture,
    dateFermeture: formData.dateFermeture || undefined,
    tauxInteret: formData.tauxInteret ?? undefined,
    limiteTrait: formData.limiteTrait ?? undefined,
    fraisServiceMensuel: formData.fraisServiceMensuel ?? undefined,
  };

  // Add optional employee
  if (formData.idEmployee) {
    payload.idEmployee = formData.idEmployee;
  }

  // Add initial deposit for creation
  if (formData.depotInitial !== undefined) {
    payload.depotInitial = formData.depotInitial;
  }

  return payload;
};

// ============================================================================
// BUSINESS LOGIC HELPERS
// ============================================================================

// Fonction pour vérifier si un compte peut être fermé
export const canCloseAccount = (account: AccountData): { canClose: boolean; reason?: string } => {
  if (account.statutCompte === 'ferme') {
    return { canClose: false, reason: 'Le compte est déjà fermé' };
  }
  
  if (account.soldeActuel > 0) {
    return { canClose: false, reason: 'Le solde doit être à 0 pour fermer le compte' };
  }
  
  if (account.loans && account.loans.some(loan => loan.status === 'active')) {
    return { canClose: false, reason: 'Des prêts actifs sont associés à ce compte' };
  }
  
  if (account.active_loan_balance && account.active_loan_balance > 0) {
    return { canClose: false, reason: `Solde de prêt actif: ${account.active_loan_balance}$` };
  }
  
  return { canClose: true };
};

// Fonction pour vérifier si un retrait est possible
export const canWithdraw = (
  account: AccountData, 
  amount: number
): { canWithdraw: boolean; reason?: string } => {
  if (account.statutCompte !== 'actif') {
    return { canWithdraw: false, reason: 'Le compte n\'est pas actif' };
  }
  
  if (amount > account.soldeActuel) {
    return { canWithdraw: false, reason: 'Solde insuffisant' };
  }
  
  if (account.typeCompte === 'cheques' && account.limiteTrait && amount > account.limiteTrait) {
    return { canWithdraw: false, reason: `Limite de retrait dépassée (max: ${account.limiteTrait}$)` };
  }
  
  return { canWithdraw: true };
};

// Fonction pour obtenir le nom du type de compte (affichage)
export const getAccountTypeName = (typeCompte: string): string => {
  const names: Record<string, string> = {
    epargne: 'Compte Épargne',
    cheques: 'Compte Chèques',
    terme: 'Compte à Terme',
  };
  return names[typeCompte] || typeCompte;
};

// Fonction pour obtenir le statut du compte (affichage avec emoji)
export const getAccountStatusDisplay = (statutCompte: string): string => {
  const statuses: Record<string, string> = {
    actif: '✅ Actif',
    suspendu: '⏸️ Suspendu',
    ferme: '🔒 Fermé',
  };
  return statuses[statutCompte] || statutCompte;
};

// Fonction pour calculer les intérêts (compte épargne/terme)
export const calculateInterest = (
  solde: number,
  tauxInteret: number,
  jours: number = 30
): number => {
  // Intérêt simple: (Capital × Taux × Temps) / 365
  return (solde * (tauxInteret / 100) * jours) / 365;
};

// Fonction pour obtenir le résumé des transactions
export const getTransactionSummary = (account: AccountData): {
  deposits: number;
  withdrawals: number;
  netFlow: number;
} => {
  if (!account.transactions) {
    return { deposits: 0, withdrawals: 0, netFlow: 0 };
  }
  
  const deposits = account.transactions
    .filter(t => t.transaction_type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const withdrawals = account.transactions
    .filter(t => t.transaction_type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    deposits,
    withdrawals,
    netFlow: deposits - withdrawals,
  };
};

// Fonction pour formater le numéro de compte avec masquage partiel
export const formatAccountNumberMasked = (noCompte: string): string => {
  // Format: XXX-XXXXXX → XXX-***XXX
  if (noCompte.length === 10 && noCompte.includes('-')) {
    const [prefix, suffix] = noCompte.split('-');
    return `${prefix}-***${suffix.slice(-3)}`;
  }
  return noCompte;
};

// Type générique
export type FormErrors<T> = Partial<Record<keyof T, string>>;
