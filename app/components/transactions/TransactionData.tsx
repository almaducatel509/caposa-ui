// Types pour les transactions
export interface TransactionData {
  id: string | number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan';
  status: 'pending' | 'completed' | 'failed' | 'processing';
  amount: number;
  currency?: string;
  description: string;
  notes?: string;
  reference?: string;
  member_id?: string | number;
  member_name?: string;
  account_number?: string;
  created_at: string;
  updated_at?: string;
  processed_at?: string;
  processed_by?: string;
  
  // Informations spécifiques aux prêts
  loan_info?: {
    duration?: string;
    interest_rate?: number;
    status?: 'requested' | 'approved' | 'rejected' | 'active' | 'completed';
    approved_amount?: number;
    monthly_payment?: number;
    remaining_balance?: number;
    next_payment_date?: string;
  };

  // Informations pour les virements
  transfer_info?: {
    from_account?: string;
    to_account?: string;
    transfer_type?: 'interac' | 'internal' | 'wire';
  };

  // Métadonnées
  metadata?: {
    source?: string;
    batch_id?: string;
    ip_address?: string;
    user_agent?: string;
  };
}

// Types pour les filtres
export interface TransactionFilters {
  search: string;
  type: string;
  status: string;
  dateRange: string;
  amount_min?: number;
  amount_max?: number;
}

// Types pour les statistiques
export interface TransactionStats {
  total: number;
  deposits: number;
  withdrawals: number;
  transfers: number;
  loans: number;
  totalAmount: number;
  pendingAmount: number;
  completedToday: number;
  avgTransactionAmount: number;
  totalByType: {
    deposit: number;
    withdrawal: number;
    transfer: number;
    loan: number;
  };
  totalByStatus: {
    pending: number;
    completed: number;
    failed: number;
    processing: number;
  };
}

// Types pour les opérations API
export interface CreateTransactionData {
  type: TransactionData['type'];
  amount: number;
  currency?: string;
  description: string;
  notes?: string;
  member_id?: string | number;
  account_number?: string;
  loan_info?: TransactionData['loan_info'];
  transfer_info?: TransactionData['transfer_info'];
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  status?: TransactionData['status'];
  processed_by?: string;
}

// Types pour les réponses API
export interface TransactionResponse {
  data: TransactionData[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SingleTransactionResponse {
  data: TransactionData;
  message?: string;
}

// Types pour les erreurs
export interface TransactionError {
  message: string;
  field?: string;
  code?: string;
}