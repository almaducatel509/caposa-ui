import { TransactionData } from './types';

// Données de test pour le développement
export const mockTransactions: TransactionData[] = [
  {
    id: 1,
    type: 'deposit',
    status: 'completed',
    amount: 1250.00,
    currency: 'CAD',
    description: 'Dépôt espèces - Vente marché fermier',
    notes: 'Recettes du marché du weekend',
    reference: 'DEP-2025-001',
    member_id: 1,
    member_name: 'Marie Dubois',
    account_number: 'ACC-001-789',
    created_at: '2025-07-17T08:30:00Z',
    updated_at: '2025-07-17T08:35:00Z',
    processed_at: '2025-07-17T08:35:00Z',
    processed_by: 'admin'
  },
  {
    id: 2,
    type: 'loan',
    status: 'pending',
    amount: 5000.00,
    currency: 'CAD',
    description: 'Demande de prêt agricole - Équipement serre',
    notes: 'Achat système d\'irrigation automatique',
    reference: 'LOAN-2025-001',
    member_id: 2,
    member_name: 'Jean Tremblay',
    account_number: 'ACC-002-456',
    created_at: '2025-07-16T14:20:00Z',
    loan_info: {
      duration: '24 mois',
      interest_rate: 3.5,
      status: 'requested',
      monthly_payment: 218.42
    }
  },
  {
    id: 3,
    type: 'withdrawal',
    status: 'completed',
    amount: 300.00,
    currency: 'CAD',
    description: 'Retrait guichet - Dépenses personnelles',
    notes: 'Retrait ATM coopérative',
    reference: 'WIT-2025-001',
    member_id: 3,
    member_name: 'Sophie Lavoie',
    account_number: 'ACC-003-123',
    created_at: '2025-07-16T16:45:00Z',
    updated_at: '2025-07-16T16:46:00Z',
    processed_at: '2025-07-16T16:46:00Z'
  },
  {
    id: 4,
    type: 'transfer',
    status: 'processing',
    amount: 750.00,
    currency: 'CAD',
    description: 'Virement Interac - Paiement fournisseur',
    notes: 'Paiement semences bio',
    reference: 'TRF-2025-001',
    member_id: 1,
    member_name: 'Marie Dubois',
    account_number: 'ACC-001-789',
    created_at: '2025-07-17T10:15:00Z',
    transfer_info: {
      from_account: 'ACC-001-789',
      to_account: 'EXT-FOURNISSEUR-001',
      transfer_type: 'interac'
    }
  },
  {
    id: 5,
    type: 'deposit',
    status: 'completed',
    amount: 2100.00,
    currency: 'CAD',
    description: 'Encaissement chèque - Subvention gouvernementale',
    notes: 'Programme aide agriculture durable',
    reference: 'DEP-2025-002',
    member_id: 4,
    member_name: 'Pierre Gagnon',
    account_number: 'ACC-004-999',
    created_at: '2025-07-15T11:30:00Z',
    updated_at: '2025-07-15T11:35:00Z',
    processed_at: '2025-07-15T11:35:00Z'
  },
  {
    id: 6,
    type: 'loan',
    status: 'completed',
    amount: 3000.00,
    currency: 'CAD',
    description: 'Versement prêt - Remboursement mensuel',
    notes: 'Paiement 12/24 du prêt tracteur',
    reference: 'LOAN-2024-005-PAY',
    member_id: 5,
    member_name: 'Luc Bergeron',
    account_number: 'ACC-005-555',
    created_at: '2025-07-14T09:00:00Z',
    updated_at: '2025-07-14T09:01:00Z',
    processed_at: '2025-07-14T09:01:00Z',
    loan_info: {
      duration: '24 mois',
      interest_rate: 2.8,
      status: 'active',
      monthly_payment: 125.67,
      remaining_balance: 1500.00,
      next_payment_date: '2025-08-14'
    }
  },
  {
    id: 7,
    type: 'withdrawal',
    status: 'failed',
    amount: 1500.00,
    currency: 'CAD',
    description: 'Retrait échoué - Solde insuffisant',
    notes: 'Tentative de retrait supérieur au solde',
    reference: 'WIT-2025-002',
    member_id: 6,
    member_name: 'Anne Bouchard',
    account_number: 'ACC-006-777',
    created_at: '2025-07-13T14:20:00Z',
    updated_at: '2025-07-13T14:21:00Z'
  },
  {
    id: 8,
    type: 'transfer',
    status: 'completed',
    amount: 450.00,
    currency: 'CAD',
    description: 'Virement interne - Transfert entre comptes',
    notes: 'Épargne vers compte courant',
    reference: 'TRF-2025-002',
    member_id: 2,
    member_name: 'Jean Tremblay',
    account_number: 'ACC-002-456',
    created_at: '2025-07-12T15:30:00Z',
    updated_at: '2025-07-12T15:31:00Z',
    processed_at: '2025-07-12T15:31:00Z',
    transfer_info: {
      from_account: 'ACC-002-456-SAV',
      to_account: 'ACC-002-456',
      transfer_type: 'internal'
    }
  }
];

// Fonction pour simuler l'API avec les données de test
export const getMockTransactions = async (): Promise<TransactionData[]> => {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockTransactions;
};

// Fonction pour utiliser les données de test temporairement
// Remplacez `fetchTransactions` dans votre composant par cette fonction pour tester
export const useMockData = true; // Mettez à false quand votre vraie API est prête