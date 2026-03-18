// types/archives.ts
// Types pour le module d'archives — pratiques bancaires caisse populaire

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
  id:           string; // Format : ARC_YYYYMMDD_XXXXX
  category:     ArchiveCategory;
  type:         ArchiveType;
  date:         Date;
  periode?:     string;
  employeeId:   string;
  employeeName: string;
  employeeRole: string;
  summary:      string;
  description?: string;
  metadata:     Record<string, unknown>;
  detailsUrl?:  string;
  documentUrl?: string;
  // Soft delete — direction uniquement
  isDeleted:       boolean;
  deletedBy?:      string;
  deletedAt?:      Date;
  deletionReason?: string;
  // Horodatage
  createdAt: Date;
  updatedAt: Date;
}

// ─── Metadata typés par catégorie ─────────────────────────────────────────────
export interface TransactionMetadata {
  transactionId: string;
  memberId:      string;
  memberName:    string;
  amount:        number;
  type:          'depot' | 'retrait' | 'decaissement_pret' | 'remboursement_pret';
  status:        'decaisse' | 'en_attente' | 'echoue';
}

export interface ReconciliationMetadata {
  reportId:        string;
  openingCash:     number;
  theoreticalCash: number;
  actualCash:      number;
  discrepancy:     number;
  status:          'equilibre' | 'ecart' | 'en_attente';
  reviewedBy?:     string;
  approvedBy?:     string;
}

export interface RapportMetadata {
  reportType: 'liquidite' | 'solvabilite' | 'conformite' | 'portefeuille';
  periode:    string;
  status:     'conforme' | 'non_conforme' | 'critique' | 'a_surveiller';
  keyMetrics: Record<string, number>;
  pdfUrl?:    string;
}

export interface LoanMetadata {
  loanId:           string;
  memberId:         string;
  memberName:       string;
  amount:           number;
  decision:         'approuve' | 'rejete';
  approvedBy?:      string;
  rejectionReason?: string;
}

export interface ArchiveFilters {
  category?:       ArchiveCategory;
  type?:           ArchiveType;
  employeeId?:     string;
  dateFrom?:       Date;
  dateTo?:         Date;
  searchTerm?:     string;
  includeDeleted?: boolean;
}

// ─── Règle métier : archives non désactivables ────────────────────────────────
// Ces types ont valeur légale ou réglementaire.
// Toute tentative de désactivation doit être bloquée côté UI ET API.
const TYPES_VERROUILLES: ReadonlySet<ArchiveType> = new Set([
  // Obligation BRH
  'rapport_liquidite',
  'rapport_solvabilite',
  'rapport_conformite',
  'rapport_portefeuille',
  'rapport_mensuel',
  'etat_financier',
  // Décision officielle de crédit
  'pret_approuve',
  'pret_refuse',
  // Audit financier
  'reconciliation_caisse',
]);

export function estDesactivable(archive: Archive): boolean {
  return !TYPES_VERROUILLES.has(archive.type);
}

export function getRaisonVerrouillage(type: ArchiveType): string {
  if (['rapport_liquidite', 'rapport_solvabilite', 'rapport_conformite',
       'rapport_portefeuille', 'rapport_mensuel', 'etat_financier'].includes(type))
    return 'Rapport réglementaire BRH — obligation légale de conservation.';
  if (['pret_approuve', 'pret_refuse'].includes(type))
    return 'Décision officielle de crédit — valeur juridique.';
  if (type === 'reconciliation_caisse')
    return "Réconciliation de caisse — pièce d'audit financier.";
  return 'Cette archive est protégée et ne peut pas être désactivée.';
}

// ─── Helpers affichage ────────────────────────────────────────────────────────
export function getCategoryLabel(c: ArchiveCategory): string {
  return {
    operational:    'Opérationnel',
    regulatory:     'Réglementaire',
    administrative: 'Administratif',
  }[c];
}

export function getTypeLabel(t: ArchiveType): string {
  const labels: Record<ArchiveType, string> = {
    transaction_journaliere: 'Transaction journalière',
    reconciliation_caisse:   'Réconciliation de caisse',
    mouvement_tresorerie:    'Mouvement de trésorerie',
    pret_approuve:           'Prêt approuvé',
    pret_refuse:             'Prêt refusé',
    depot:                   'Dépôt',
    retrait:                 'Retrait',
    rapport_mensuel:         'Rapport mensuel',
    rapport_liquidite:       'Rapport de liquidité',
    rapport_solvabilite:     'Rapport de solvabilité',
    rapport_portefeuille:    'Rapport de portefeuille',
    rapport_conformite:      'Rapport de conformité',
    etat_financier:          'État financier',
    horaire:                 'Horaire',
    poste:                   'Poste',
    branche:                 'Branche',
    parametre_bancaire:      'Paramètre bancaire',
    document_interne:        'Document interne',
  };
  return labels[t];
}

export function getCategoryAccent(c: ArchiveCategory): { bg: string; text: string; border: string } {
  return {
    operational:    { bg: '#EBF2F8', text: '#355C7D', border: '#BFDBFE' },
    regulatory:     { bg: '#DDEAD5', text: '#1B5E20', border: '#DDEAD5' },
    administrative: { bg: '#FEF9EC', text: '#B45309', border: '#FDE68A' },
  }[c];
}