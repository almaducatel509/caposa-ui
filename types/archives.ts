// types/archives.ts
// Types pour le module d'archives - conforme aux pratiques bancaires

export type ArchiveCategory = 'operational' | 'regulatory' | 'administrative';

export type ArchiveType = 
  // Opérationnel
  | 'transaction_journaliere'
  | 'reconciliation_caisse'
  | 'mouvement_tresorerie'
  | 'pret_approuve'
  | 'pret_refuse'
  | 'depot'
  | 'retrait'
  
  // Réglementaire
  | 'rapport_mensuel'
  | 'rapport_liquidite'
  | 'rapport_solvabilite'
  | 'rapport_portefeuille'
  | 'rapport_conformite'
  | 'etat_financier'
  
  // Administratif
  | 'horaire'
  | 'poste'
  | 'branche'
  | 'parametre_bancaire'
  | 'document_interne';

export interface Archive {
  id: string; // Format: ARC_YYYYMMDD_XXXXX
  
  // Classification
  category: ArchiveCategory;
  type: ArchiveType;
  
  // Informations de base
  date: Date;
  periode?: string; // Ex: "Janvier 2026" pour rapports mensuels
  
  // Traçabilité employé
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  
  // Contenu
  summary: string; // Résumé court (1 ligne)
  description?: string; // Description détaillée (optionnel)
  
  // Données structurées (spécifiques à chaque type)
  metadata: Record<string, any>;
  
  // Liens vers détails
  detailsUrl?: string; // URL vers la page de détails
  documentUrl?: string; // URL vers PDF/document généré
  
  // Soft delete (seule la direction peut soft delete)
  isDeleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
  deletionReason?: string;
  
  // Horodatage
  createdAt: Date;
  updatedAt: Date;
}

// Metadata types pour chaque catégorie

export interface TransactionMetadata {
  transactionId: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment';
  status: 'completed' | 'pending' | 'failed';
}

export interface ReconciliationMetadata {
  reportId: string;
  openingCash: number;
  theoreticalCash: number;
  actualCash: number;
  discrepancy: number;
  status: 'balanced' | 'discrepancy' | 'pending';
  reviewedBy?: string;
  approvedBy?: string;
}

export interface RapportMetadata {
  reportType: 'liquidite' | 'solvabilite' | 'conformite' | 'portefeuille';
  periode: string;
  status: 'Conforme' | 'Non conforme' | 'Critique' | 'À surveiller';
  keyMetrics: Record<string, number>;
  pdfUrl?: string;
}

export interface LoanMetadata {
  loanId: string;
  memberId: string;
  memberName: string;
  amount: number;
  decision: 'approved' | 'rejected';
  approvedBy?: string;
  rejectionReason?: string;
}

// Filtres pour la recherche
export interface ArchiveFilters {
  category?: ArchiveCategory;
  type?: ArchiveType;
  employeeId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  includeDeleted?: boolean;
}

// Export stats
export interface ArchiveExportData {
  archives: Archive[];
  exportDate: Date;
  exportedBy: string;
  filters: ArchiveFilters;
  totalCount: number;
}

// Helper functions
export const getCategoryLabel = (category: ArchiveCategory): string => {
  const labels: Record<ArchiveCategory, string> = {
    operational: 'Opérationnel',
    regulatory: 'Réglementaire',
    administrative: 'Administratif'
  };
  return labels[category];
};

export const getTypeLabel = (type: ArchiveType): string => {
  const labels: Record<ArchiveType, string> = {
    transaction_journaliere: 'Transaction journalière',
    reconciliation_caisse: 'Réconciliation de caisse',
    mouvement_tresorerie: 'Mouvement de trésorerie',
    pret_approuve: 'Prêt approuvé',
    pret_refuse: 'Prêt refusé',
    depot: 'Dépôt',
    retrait: 'Retrait',
    rapport_mensuel: 'Rapport mensuel',
    rapport_liquidite: 'Rapport de liquidité',
    rapport_solvabilite: 'Rapport de solvabilité',
    rapport_portefeuille: 'Rapport de portefeuille',
    rapport_conformite: 'Rapport de conformité',
    etat_financier: 'État financier',
    horaire: 'Horaire',
    poste: 'Poste',
    branche: 'Branche',
    parametre_bancaire: 'Paramètre bancaire',
    document_interne: 'Document interne'
  };
  return labels[type];
};

export const getCategoryIcon = (category: ArchiveCategory): string => {
  const icons: Record<ArchiveCategory, string> = {
    operational: '⚙️',
    regulatory: '📋',
    administrative: '📁'
  };
  return icons[category];
};