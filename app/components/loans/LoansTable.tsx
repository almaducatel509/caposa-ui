'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Edit, Bell, Users, CheckCircle2, AlertTriangle,
  XCircle, Clock, Check, X, Archive, ShieldAlert, Banknote,
  ChevronDown, ChevronUp, ChevronsUpDown, FileText, Landmark,
} from 'lucide-react';
import { FaSync } from 'react-icons/fa';
import PageHeader from '../header';
import TransactionDetailModal, { TransactionDetail } from '../transactions/DetailModal';
import LoanBulkActionDropdown, { LoanBulkAction } from './LoanBulkActionDropdown';
import LoanBulkActionModal, { LoanForBulk } from './modals/LoanBulkActionModal';
import LoanFilterBar, {
  LoanFilterPeriod, LoanFilterType, LoanFilterRange,
} from './LoanFilterBar';
// ⚠️ Renommé : EditLoanModal → ReviewLoanModal (le composant fait du "review" pas de l'édition libre)
import ReviewLoanModal, { LoanForEdit, EmployeeOption, } from './modals/ReviewLoanModal';
import type { LoanFormData } from '../transactions/validation/loanSchema';
import NewLoanModal from './modals/NewLoanModal';
import { UserRole } from '@/app/lib/auth';

// ─── useAuth temporaire ───────────────────────────────────────────────────────
// ⚠️ MOCK : à remplacer par le vrai hook quand `@/app/lib/auth` exposera `useAuth()`.
//    L'ancienne version `throw new Error(...)` cassait toute la page au montage.
//    Cette version mock permet de tester l'UI en attendant le vrai backend.
//
// Pour tester différents rôles, change la valeur de MOCK_ROLE ci-dessous :
//   - 'superviseur'  → voit "Approuver / Rejeter" sur les demandes
//   - 'caissier'     → voit "Décaisser" sur les prêts approuvés
//   - 'agent_credit' → ne voit que assignation + notes
const MOCK_ROLE: UserRole = 'superviseur';

function useAuth(): { user: { employee: { posts_details: { code: string }[] } } | null } {
  // TODO: remplacer par le vrai useAuth depuis '@/app/lib/auth'
  return {
    user: {
      employee: {
        posts_details: [{ code: MOCK_ROLE }],
      },
    },
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type LoanStatus  = 'en_attente' | 'approuve' | 'decaisse' | 'rembourse' | 'rejete' | 'annule';
type LoanType    = 'agriculture' | 'commerce' | 'logement' | 'education' | 'sante'
                 | 'elevage' | 'equipement' | 'scolaire' | 'personnel' | 'autre';
type LoanPurpose = 'plantation' | 'construction' | 'scolarite' | 'commerce'
                 | 'elevage' | 'equipement' | 'autre';
type TabId       = 'demandes' | 'a_jour' | 'retard' | 'archive';

interface LoanData {
  id:                number;
  amount:            number;
  status:            LoanStatus;
  member_name:       string;
  member_id:         string;
  account_number:    string;
  created_at:        string;
  approved_at?:      string;
  disbursed_at?:     string;
  processed_by:      string;
  validated_by:      string;
  caisse_numero:     string;
  caisse_id:         string;
  session_id:        string;
  assigned_to?:      string;
  notes?:            string;
  loan_details: {
    duration_months:     number;
    interest_rate:       number;
    monthly_payment:     number;
    total_amount:        number;
    purpose:             LoanPurpose;
    loan_type:           LoanType;
    repayment_frequency: 'mensuel' | 'hebdomadaire' | 'saisonnier';
    payments_made:       number;
    remaining_balance:   number;
    next_payment_date?:  string;
    late_days:           number;
  };
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5',
  blue:  '#355C7D', gold: '#D4AF37',
};

const STATUS_CFG: Record<LoanStatus, { label: string; bg: string; text: string; dot: string }> = {
  en_attente: { label: 'En attente', bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  approuve:   { label: 'Approuvé',   bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]' },
  decaisse:   { label: 'Décaissé',   bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]' },
  rembourse:  { label: 'Remboursé',  bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', dot: 'bg-[#22C55E]' },
  rejete:     { label: 'Rejeté',     bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  annule:     { label: 'Annulé',     bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#9CA3AF]' },
};

const TYPE_LABELS: Record<LoanType, string> = {
  agriculture: 'Agriculture', commerce: 'Commerce', logement: 'Logement',
  education:   'Éducation',   sante: 'Santé',       elevage: 'Élevage',
  equipement:  'Équipement',  scolaire: 'Scolaire', personnel: 'Personnel',
  autre:       'Autre',
};

const PURPOSE_LABELS: Record<LoanPurpose, string> = {
  plantation: 'Plantation', construction: 'Construction', scolarite: 'Scolarité',
  commerce:   'Commerce',   elevage: 'Élevage',           equipement: 'Équipement',
  autre:      'Autre',
};

// ─── Règles UX : qui peut agir sur quel statut ────────────────────────────────
// ✅ Sert à griser l'icône Edit/Review quand l'utilisateur n'a rien à faire sur ce prêt.
//    Le backend reste l'autorité finale, mais on évite à l'utilisateur de cliquer pour rien.
const CAN_REVIEW: Record<UserRole, LoanStatus[]> = {
  superviseur: ['en_attente'],
  caissier: ['approuve', 'decaisse'],
  agent_credit: ['en_attente', 'approuve', 'decaisse'],
  directeur: [],
  tresorier: []
};

// ─── Liste mock des employés (pour le champ Assigné à) ────────────────────────
const MOCK_EMPLOYEES: EmployeeOption[] = [
  { id: 'EMP001', name: 'Josiane Mercier'     },
  { id: 'EMP002', name: 'Patrick Dorcélus'    },
  { id: 'EMP003', name: 'Nadège Jean-Louis'   },
  { id: 'EMP004', name: 'Lionel Préval'       },
  { id: 'EMP005', name: 'Marie-Ange Celestin' },
  { id: 'EMP006', name: 'Réginald Toussaint'  },
];

// ─── Grille ───────────────────────────────────────────────────────────────────
const GRID = '40px 2fr 1.2fr 1.4fr 1.2fr 1.5fr 1fr 140px';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatHTG = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

function matchesPeriod(iso: string, period: LoanFilterPeriod): boolean {
  if (period === 'all') return true;
  const d   = new Date(iso);
  const now = new Date();
  if (period === 'today') return d.toDateString() === now.toDateString();
  if (period === 'week')  return (now.getTime() - d.getTime()) <= 7 * 86400000;
  if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === 'year')  return d.getFullYear() === now.getFullYear();
  return true;
}

function matchesRange(amount: number, range: LoanFilterRange): boolean {
  if (range === 'all')    return true;
  if (range === 'small')  return amount < 10_000;
  if (range === 'medium') return amount >= 10_000  && amount <= 50_000;
  if (range === 'large')  return amount > 50_000   && amount <= 100_000;
  if (range === 'xlarge') return amount > 100_000;
  return true;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
function generateLoans(): LoanData[] {
  const statuses: LoanStatus[]  = ['decaisse', 'decaisse', 'decaisse', 'rembourse', 'approuve', 'en_attente', 'en_attente', 'rejete', 'annule'];
  const types:    LoanType[]    = ['agriculture', 'commerce', 'logement', 'education', 'sante', 'elevage', 'equipement', 'scolaire', 'personnel'];
  const purposes: LoanPurpose[] = ['plantation', 'construction', 'scolarite', 'commerce', 'elevage', 'equipement', 'autre'];
  const freqs                   = ['mensuel', 'mensuel', 'mensuel', 'hebdomadaire', 'saisonnier'] as const;
  const members   = ['Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre', 'Claudette Moreau', 'Réginald Beaumont', 'Nadège Thermidor', 'Wilgens Désir'];
  const employes  = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supers    = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses   = [{ id: 'CAI001', numero: '01' }, { id: 'CAI002', numero: '02' }, { id: 'CAI003', numero: '03' }];
  const data: LoanData[] = [];
  let attempts = 0;

  for (let i = 0; i < 80 && attempts < 200; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    if (date.getDay() === 0 || date.getDay() === 6) { i--; attempts++; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    const status   = statuses[Math.floor(Math.random() * statuses.length)];
    const amount   = Math.floor(Math.random() * 150_000) + 3_000;
    const duration = [6, 12, 18, 24, 36, 48][Math.floor(Math.random() * 6)];
    const rate     = 2.5 + Math.random() * 5;
    const monthly  = (amount * (1 + rate / 100)) / duration;
    const paid     = status === 'decaisse' ? Math.min(duration, Math.floor(Math.random() * duration)) : status === 'rembourse' ? duration : 0;
    const lateDays = status === 'decaisse' && Math.random() > 0.6 ? Math.floor(Math.random() * 45) + 1 : 0;
    const caisse   = caisses[Math.floor(Math.random() * caisses.length)];

    data.push({
      id: i + 1, amount, status,
      member_name:    members[Math.floor(Math.random() * members.length)],
      member_id:      `MEM${1000 + i}`,
      account_number: `ACC${1000 + i}`,
      created_at:     date.toISOString(),
      approved_at:    !['en_attente', 'rejete'].includes(status) ? new Date(date.getTime() + 2 * 86400000).toISOString() : undefined,
      disbursed_at:   ['decaisse', 'rembourse'].includes(status)  ? new Date(date.getTime() + 5 * 86400000).toISOString() : undefined,
      processed_by:   employes[Math.floor(Math.random() * employes.length)],
      validated_by:   supers[Math.floor(Math.random() * supers.length)],
      caisse_numero:  caisse.numero, caisse_id: caisse.id,
      session_id:     `SES-${1000 + i}`,
      assigned_to:    Math.random() > 0.3 ? MOCK_EMPLOYEES[Math.floor(Math.random() * MOCK_EMPLOYEES.length)].id : undefined,
      notes:          undefined,
      loan_details: {
        duration_months:     duration,
        interest_rate:       parseFloat(rate.toFixed(2)),
        monthly_payment:     monthly,
        total_amount:        amount * (1 + rate / 100),
        purpose:             purposes[Math.floor(Math.random() * purposes.length)],
        loan_type:           types[Math.floor(Math.random() * types.length)],
        repayment_frequency: freqs[Math.floor(Math.random() * freqs.length)],
        payments_made:       paid,
        remaining_balance:   status === 'rembourse' ? 0 : Math.max(0, amount - monthly * paid),
        next_payment_date:   status === 'decaisse' ? new Date(Date.now() + 15 * 86400000).toISOString() : undefined,
        late_days:           lateDays,
      },
    });
    attempts++;
  }
  return data;
}

// ─── Classification onglet ────────────────────────────────────────────────────
function getEffectiveTab(l: LoanData): TabId {
  if (l.status === 'en_attente' || l.status === 'approuve') return 'demandes';
  if (l.status === 'decaisse') {
    return l.loan_details.late_days > 0 ? 'retard' : 'a_jour';
  }
  return 'archive';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoansTable() {
  // ── Auth ──
  const { user } = useAuth();

  const userRole: UserRole =
    user?.employee?.posts_details?.some(p => p.code === 'superviseur') ? 'superviseur'
    : user?.employee?.posts_details?.some(p => p.code === 'caissier')   ? 'caissier'
    : 'agent_credit';

  // ── State général ──
  const [activeTab,      setActiveTab]      = useState<TabId>('demandes');
  const [sortField,      setSortField]      = useState('created_at');
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('desc');

  const [search,         setSearch]         = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<LoanFilterPeriod>('all');
  const [selectedType,   setSelectedType]   = useState<LoanFilterType>('all');
  const [selectedRange,  setSelectedRange]  = useState<LoanFilterRange>('all');

  const [selected,       setSelected]       = useState<Set<number>>(new Set());
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [activeAction,   setActiveAction]   = useState<LoanBulkAction | null>(null);
  const [detailTx,       setDetailTx]       = useState<TransactionDetail | null>(null);

  // ── Modals ──
  const [newLoanOpen, setNewLoanOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanData | null>(null);

  // ── Données (state local pour refléter les modifs) ──
  const [loans, setLoans] = useState<LoanData[]>(() => generateLoans());

  const counts = useMemo(() => ({
    demandes: loans.filter(l => getEffectiveTab(l) === 'demandes').length,
    a_jour:   loans.filter(l => getEffectiveTab(l) === 'a_jour').length,
    retard:   loans.filter(l => getEffectiveTab(l) === 'retard').length,
    archive:  loans.filter(l => getEffectiveTab(l) === 'archive').length,
  }), [loans]);

  const tabLoans = useMemo(
    () => loans.filter(l => getEffectiveTab(l) === activeTab),
    [loans, activeTab],
  );

  const filtered = useMemo(() => {
    return tabLoans.filter(l => {
      const q = search.toLowerCase();
      const matchSearch = q === ''
        || l.member_name.toLowerCase().includes(q)
        || l.member_id.toLowerCase().includes(q)
        || String(l.id).includes(q);
      const matchType    = selectedType === 'all' || l.loan_details.loan_type === selectedType;
      const matchRange_  = matchesRange(l.amount, selectedRange);
      const matchPeriod_ = matchesPeriod(l.created_at, selectedPeriod);
      return matchSearch && matchType && matchRange_ && matchPeriod_;
    });
  }, [tabLoans, search, selectedType, selectedRange, selectedPeriod]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'amount')    return (a.amount - b.amount) * dir;
    if (sortField === 'status')    return a.status.localeCompare(b.status) * dir;
    if (sortField === 'loan_type') return a.loan_details.loan_type.localeCompare(b.loan_details.loan_type) * dir;
    if (sortField === 'duration')  return (a.loan_details.duration_months - b.loan_details.duration_months) * dir;
    if (sortField === 'progress') {
      const pa = a.loan_details.payments_made / a.loan_details.duration_months;
      const pb = b.loan_details.payments_made / b.loan_details.duration_months;
      return (pa - pb) * dir;
    }
    if (sortField === 'created_at') return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    return a.member_name.localeCompare(b.member_name) * dir;
  }), [filtered, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(l => l.id)));
  const toggleRow    = (id: number) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };

  const selectedLoans = useMemo(
    () => sorted.filter(l => selected.has(l.id)),
    [sorted, selected],
  );

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setSelected(new Set());
    setSearch('');
    setSelectedPeriod('all');
    setSelectedType('all');
    setSelectedRange('all');
    if (tab === 'demandes')        { setSortField('created_at'); setSortDir('desc'); }
    else if (tab === 'retard')     { setSortField('progress');   setSortDir('asc');  }
    else if (tab === 'a_jour')     { setSortField('progress');   setSortDir('asc');  }
    else                           { setSortField('created_at'); setSortDir('desc'); }
  };

  const isArchiveTab  = activeTab === 'archive';
  const isDemandesTab = activeTab === 'demandes';
  const isActifsTab   = activeTab === 'a_jour' || activeTab === 'retard';

  const dropdownContext = isArchiveTab ? 'archive'
                        : isDemandesTab ? 'pending'
                        : 'active';

  // ── Colonnes adaptatives ──
  const COLS = useMemo(() => [
    { label: 'Membre',      field: 'member_name' },
    { label: 'Type',        field: 'loan_type'   },
    { label: 'Montant',     field: 'amount'      },
    { label: 'Statut',      field: 'status'      },
    isDemandesTab
      ? { label: 'Durée',       field: 'duration' }
      : { label: 'Progression', field: 'progress' },
    { label: 'Date',        field: 'created_at'  },
  ], [isDemandesTab]);

  // ── Détail (vue read-only) ──
  const STATUS_MAP: Record<LoanStatus, TransactionDetail['status']> = {
    en_attente: 'en_attente', approuve: 'en_cours', decaisse: 'decaisse',
    rembourse:  'rembourse',  rejete: 'echoue',     annule: 'annule',
  };

  const handleView = (l: LoanData) => setDetailTx({
    id: l.id, kind: 'loan', status: STATUS_MAP[l.status],
    montant: l.amount, created_at: l.disbursed_at ?? l.created_at,
    member_name: l.member_name, member_id: l.member_id, account_number: l.account_number,
    description: `${TYPE_LABELS[l.loan_details.loan_type]} — ${PURPOSE_LABELS[l.loan_details.purpose]}`,
    processed_by: l.processed_by, validated_by: l.validated_by,
    caisse_numero: l.caisse_numero, caisse_id: l.caisse_id, session_id: l.session_id,
  });

  // ── Ouvrir le modal d'examen ──
  const handleReview = (l: LoanData) => setEditingLoan(l);

  // ── Conversion LoanData → LoanForEdit pour le modal ──
  const loanForEdit = useMemo<LoanForEdit | null>(() => {
    if (!editingLoan) return null;
    return {
      id:              editingLoan.id,
      member_name:     editingLoan.member_name,
      member_id:       editingLoan.member_id,
      amount:          editingLoan.amount,
      status:          editingLoan.status,
      loan_type:       TYPE_LABELS[editingLoan.loan_details.loan_type],
      purpose:         PURPOSE_LABELS[editingLoan.loan_details.purpose],
      duration_months: editingLoan.loan_details.duration_months,
      interest_rate:   editingLoan.loan_details.interest_rate,
      monthly_payment: editingLoan.loan_details.monthly_payment,
      created_at:      editingLoan.created_at,
      processed_by:    editingLoan.processed_by,
      validated_by:    editingLoan.validated_by,
      assigned_to:     editingLoan.assigned_to,
      notes:           editingLoan.notes,
    };
  }, [editingLoan]);

  // ⚠️ ANCIENNE VERSION — remplacée par handleReviewConfirm ci-dessous
  // const handleEditConfirm = async (
  //   loanId: string | number,
  //   changes: { status?: LoanStatus; reason?: string; assigned_to?: string; notes?: string },
  // ) => {
  //   console.log('Édition prêt:', loanId, changes);
  //   await new Promise(r => setTimeout(r, 400));
  //   setLoans(prev => prev.map(l => { /* ... */ }));
  // };

  // ── Confirmation des actions du modal Review ──
  const handleReviewConfirm = async (
    loanId: string | number,
    changes: {
      status?:      LoanStatus;
      reason?:      string;
      assigned_to?: string;
      notes?:       string;
      password?:    string;
    },
  ) => {
    try {
      // ─── ACTION DE WORKFLOW (changement de statut) ───
      // TODO: brancher les endpoints API quand loanService sera créé
      if (changes.status === 'approuve') {
        // await loanService.approve(loanId, {
        //   password: changes.password!,
        //   reason:   changes.reason,
        // });
        console.log('TODO API approve:', loanId, { password: '***', reason: changes.reason });
      } else if (changes.status === 'rejete') {
        // await loanService.reject(loanId, {
        //   password: changes.password!,
        //   reason:   changes.reason!,
        // });
        console.log('TODO API reject:', loanId, { password: '***', reason: changes.reason });
      } else if (changes.status === 'decaisse') {
        // await loanService.disburse(loanId, {
        //   session: currentSessionId,  // viendra du contexte caisse
        //   reason:  changes.reason,
        // });
        console.log('TODO API disburse:', loanId, { reason: changes.reason });
      } else if (changes.status === 'rembourse') {
        // await loanService.close(loanId, { reason: changes.reason });
        console.log('TODO API close (rembourse):', loanId, { reason: changes.reason });
      }

      // ─── CHANGEMENTS NEUTRES (notes, assignation) — patch en complément ───
      if (changes.assigned_to !== undefined || changes.notes !== undefined) {
        // await loanService.patch(loanId, {
        //   assigned_to: changes.assigned_to,
        //   notes:       changes.notes,
        // });
        console.log('TODO API patch:', loanId, {
          assigned_to: changes.assigned_to,
          notes:       changes.notes,
        });
      }

      // ─── Mise à jour locale optimiste (à retirer quand l'API renverra le prêt à jour) ───
      setLoans(prev => prev.map(l => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          status:      changes.status      ?? l.status,
          assigned_to: changes.assigned_to !== undefined ? changes.assigned_to : l.assigned_to,
          notes:       changes.notes       !== undefined ? changes.notes       : l.notes,
        };
      }));

      // Quand l'API sera branchée :
      // await refetchLoans();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prêt:', error);
      throw error;  // propage l'erreur pour que le modal puisse l'afficher
    }
  };

  // ── Bulk actions ──
  const bulkLoans: LoanForBulk[] = selectedLoans.map(l => ({
    id: l.id,
    member_name: l.member_name,
    member_id: l.member_id,
    amount: l.amount,
    status: l.status,
    late_days: l.loan_details.late_days,
    remaining_balance: l.loan_details.remaining_balance,
    duration_months: l.loan_details.duration_months,
    payments_made: l.loan_details.payments_made,
  }));

  const handleBulkConfirm = async (
    action: LoanBulkAction,
    eligibleIds: (string | number)[],
    payload?: string,
  ) => {
    console.log('Bulk action:', action, 'IDs:', eligibleIds, 'payload:', payload);
    await new Promise(r => setTimeout(r, 600));
    setSelected(new Set());
    setActiveAction(null);
  };

  // ── Nouveau prêt ──
  const handleNewLoanSubmit = async (data: LoanFormData): Promise<void> => {
    console.log('Nouveau prêt:', data);
    await new Promise<void>(r => setTimeout(r, 400));
    setNewLoanOpen(false);
    // TODO: rafraîchir la liste depuis l'API
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Prêts"
          subtitle="Registre complet — demandes, suivi et historique"
          icon={<Landmark className="w-8 h-8 text-[#2E7D32]" />}
        />
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:border-[#2E7D32]/30 transition-colors shrink-0">
          <FaSync className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {/* ── FilterBar ── */}
      <LoanFilterBar
        filterValue={search}
        selectedPeriod={selectedPeriod}
        selectedType={selectedType}
        selectedRange={selectedRange}
        onSearchChange={v => setSearch(v ?? '')}
        onClear={() => setSearch('')}
        onPeriodChange={setSelectedPeriod}
        onTypeChange={setSelectedType}
        onRangeChange={setSelectedRange}
        onAdd={() => setNewLoanOpen(true)}
        totalCount={sorted.length}
      />

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Onglets */}
        <div className="flex items-center gap-0 px-2 border-b border-gray-100 bg-white overflow-x-auto overflow-y-hidden">
          {[
            { id: 'demandes' as TabId, label: 'Demandes',  icon: Clock,         active: 'border-yellow-500 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', count: counts.demandes },
            { id: 'a_jour'   as TabId, label: 'À jour',    icon: CheckCircle2,  active: 'border-[#2E7D32] text-[#1B5E20]',   badge: 'bg-[#DDEAD5] text-[#1B5E20]',   count: counts.a_jour   },
            { id: 'retard'   as TabId, label: 'En retard', icon: AlertTriangle, active: 'border-orange-500 text-orange-600', badge: 'bg-orange-100 text-orange-600', count: counts.retard   },
            { id: 'archive'  as TabId, label: 'Archive',   icon: Archive,       active: 'border-red-400 text-red-600',       badge: 'bg-red-100 text-red-600',       count: counts.archive  },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 whitespace-nowrap shrink-0 ${
                  isCurrent ? `${tab.active} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${isCurrent ? tab.badge : 'bg-gray-100 text-gray-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bannière archive */}
        {isArchiveTab && (
          <div className="flex items-start gap-3 px-5 py-3 bg-red-50 border-b border-red-100">
            <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700">Section clôturée — Prêts remboursés, rejetés ou annulés</p>
              <p className="text-xs text-red-500 mt-0.5">
                Ces demandes sont en lecture seule. Aucune modification, approbation ou décaissement
                ne peut être enregistré depuis cet onglet.
              </p>
            </div>
          </div>
        )}

        {/* Barre sélection */}
        {selected.size > 0 && (
          <div className="px-5 py-3 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span className="text-sm font-semibold text-[#1B5E20]">
                {selected.size} prêt{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <LoanBulkActionDropdown
                selectedCount={selected.size}
                isOpen={dropdownOpen}
                onToggle={() => setDropdownOpen(o => !o)}
                onAction={(action) => setActiveAction(action)}
                context={dropdownContext}
              />
              <button onClick={() => setSelected(new Set())}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Header colonnes */}
        <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
          style={{ display: 'grid', gridTemplateColumns: GRID }}>
          <div className="flex items-center justify-center">
            <button onClick={toggleAll}
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                allSelected || someSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
              }`}>
              {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </button>
          </div>
          {COLS.map(col => (
            <button key={col.label} onClick={() => toggleSort(col.field)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left text-gray-600 hover:text-[#1B5E20] cursor-pointer transition-colors">
              {col.label}
              <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />
            </button>
          ))}
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">Actions</span>
        </div>

        {/* Lignes */}
        <div className="divide-y divide-gray-50">
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isArchiveTab ? 'bg-red-50' : 'bg-[#DDEAD5]'}`}>
                {isArchiveTab
                  ? <Archive  className="w-7 h-7 text-red-400" />
                  : <FileText className="w-7 h-7 text-[#2E7D32]" />}
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {isArchiveTab ? 'Aucun prêt archivé' : 'Aucun prêt trouvé'}
              </p>
              <p className="text-xs text-gray-400">
                {isArchiveTab ? 'Les prêts remboursés, rejetés ou annulés apparaîtront ici'
                               : 'Modifiez vos critères pour voir plus de résultats'}
              </p>
            </div>
          )}

          {sorted.map((loan, i) => {
            const cfg         = STATUS_CFG[loan.status];
            const isSelected  = selected.has(loan.id);
            const rawProgress = (loan.loan_details.payments_made / loan.loan_details.duration_months) * 100;
            const progress    = Math.min(100, Math.max(0, Math.round(rawProgress)));
            const isLate      = loan.loan_details.late_days > 0;
            const isCritical  = loan.loan_details.late_days >= 30;

            // ✅ Le bouton Edit/Review est actif seulement si le rôle peut agir sur ce statut
            const canReview = !isArchiveTab && CAN_REVIEW[userRole].includes(loan.status);

            return (
              <div key={loan.id}
                className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${isArchiveTab ? 'opacity-75' : ''} ${
                  isSelected ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : isCritical ? 'bg-red-50/30 hover:bg-red-50/50'
                  : isLate     ? 'bg-yellow-50/30 hover:bg-yellow-50/50'
                  : i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
                }`}
                style={{ gridTemplateColumns: GRID }}>

                {/* Checkbox */}
                <div className="flex items-center justify-center">
                  <button onClick={() => toggleRow(loan.id)}
                    className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                    }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </button>
                </div>

                {/* Membre */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${isArchiveTab ? 'opacity-60 grayscale' : ''}`}>
                    <Users className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate leading-tight ${isArchiveTab ? 'text-gray-400' : 'text-gray-900'}`}>
                      {loan.member_name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{loan.member_id}</p>
                  </div>
                </div>

                {/* Type / But */}
                <div>
                  <p className="text-xs font-medium text-gray-700">{TYPE_LABELS[loan.loan_details.loan_type]}</p>
                  <p className="text-xs text-gray-400 truncate">{PURPOSE_LABELS[loan.loan_details.purpose]}</p>
                </div>

                {/* Montant */}
                <div>
                  <p className="text-sm font-bold text-gray-800">{formatHTG(loan.amount)}</p>
                  <p className="text-xs text-gray-400">{loan.loan_details.interest_rate}% · {loan.loan_details.duration_months} mois</p>
                </div>

                {/* Statut */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {isLate && (
                    <p className={`text-xs font-semibold mt-0.5 ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
                      {loan.loan_details.late_days}j retard
                    </p>
                  )}
                </div>

                {/* Colonne 5 : Durée ou Progression */}
                {isDemandesTab ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {loan.loan_details.duration_months} mois
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ~{formatHTG(Math.round(loan.loan_details.monthly_payment))}/mois
                    </p>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {loan.loan_details.payments_made}/{loan.loan_details.duration_months}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${progress}%`,
                        backgroundColor: progress >= 75 ? C.green : progress >= 50 ? C.blue : progress >= 25 ? C.gold : '#EF4444',
                      }} />
                    </div>
                    {loan.loan_details.remaining_balance > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {formatHTG(loan.loan_details.remaining_balance)} restant
                      </p>
                    )}
                  </div>
                )}

                {/* Date */}
                <div>
                  <p className="text-xs font-semibold text-gray-700">{formatDate(loan.created_at)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(loan.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-1">
                  <button title="Voir" onClick={() => handleView(loan)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* ✅ Bouton Review : actif si le rôle peut agir, grisé sinon */}
                  {!isArchiveTab && (
                    <button
                      title={canReview
                        ? 'Examiner / agir sur ce prêt'
                        : `En lecture seule pour votre rôle (${userRole}) à ce statut`}
                      onClick={() => canReview && handleReview(loan)}
                      disabled={!canReview}
                      className={`p-1.5 rounded-lg transition-colors ${
                        canReview
                          ? 'text-gray-400 hover:bg-[#DDEAD5] hover:text-[#2E7D32] cursor-pointer'
                          : 'text-gray-200 cursor-not-allowed'
                      }`}>
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isActifsTab && (
                    <>
                      <button title="Envoyer un rappel"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-500 transition-colors">
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button title="Marquer un paiement"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-[#DDEAD5] hover:text-[#2E7D32] transition-colors">
                        <Banknote className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isArchiveTab && (
                    <span className="text-xs text-gray-400 italic px-2">Lecture seule</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {loans.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{sorted.length}</span> résultat{sorted.length !== 1 ? 's' : ''} sur cet onglet
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {counts.demandes > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> {counts.demandes} demande{counts.demandes !== 1 ? 's' : ''}
                </span>
              )}
              {counts.a_jour > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> {counts.a_jour} à jour
                </span>
              )}
              {counts.retard > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> {counts.retard} en retard
                </span>
              )}
              {counts.archive > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {counts.archive} archivé{counts.archive !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <TransactionDetailModal
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
      />

      <LoanBulkActionModal
        action={activeAction}
        loans={bulkLoans}
        onClose={() => setActiveAction(null)}
        onConfirm={handleBulkConfirm}
      />

      <NewLoanModal
        isOpen={newLoanOpen}
        onClose={() => setNewLoanOpen(false)}
        onSubmit={handleNewLoanSubmit}
      />

      <ReviewLoanModal
        isOpen={editingLoan !== null}
        loan={loanForEdit}
        employees={MOCK_EMPLOYEES}
        //  {/* ✅ connecté à l'utilisateur authentifié */}
        currentUserRole={userRole}   
        onClose={() => setEditingLoan(null)}
        onConfirm={handleReviewConfirm}
      />
    </div>
  );
}