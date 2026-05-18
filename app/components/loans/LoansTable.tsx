'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Edit, Bell, Users, CheckCircle2, AlertTriangle,
  XCircle, Clock, Check, X, Archive, ShieldAlert, Banknote,
  ChevronDown, ChevronUp, ChevronsUpDown, FileText, Landmark,
  HandCoins,
  Wallet,
} from 'lucide-react';
import { FaSync } from 'react-icons/fa';
import PageHeader from '../header';
import TransactionDetailModal, { TransactionDetail } from '../transactions/DetailModal';
import LoanBulkActionDropdown, { LoanBulkAction } from './LoanBulkActionDropdown';
import LoanBulkActionModal, { LoanForBulk } from './modals/LoanBulkActionModal';
import LoanFilterBar, {
  LoanFilterPeriod, LoanFilterType, LoanFilterRange,
} from './LoanFilterBar';
// ⚠️ Renamed: EditLoanModal → ReviewLoanModal (the component does "review", not free edit)
import ReviewLoanModal, { LoanForEdit, EmployeeOption } from './modals/ReviewLoanModal';
import type {
  LoanData, LoanFormData, LoanPurpose, LoanStatus, LoanType,
  CollateralType, RepaymentFrequency,
} from '../transactions/validation/loanSchema';
import NewLoanModal from './modals/NewLoanModal';
import DisburseLoanModal, { LoanForDisburse } from './modals/DisburseLoanModal';
import { UserRole } from '@/app/lib/auth';
import RepaymentLoanModal, { LoanForRepayment } from './modals/RepaymentLoanModal';

// ─── Temporary useAuth ────────────────────────────────────────────────────────
// ⚠️ MOCK: replace with the real hook once `@/app/lib/auth` exposes `useAuth()`.
//    To test different roles, change MOCK_ROLE below:
//      - 'superviseur'  → sees "Approve / Reject" on pending loans
//      - 'caissier'     → sees "Disburse" on approved loans
//      - 'agent_credit' → only sees assignment + notes
const MOCK_ROLE: UserRole = 'superviseur';

function useAuth(): { user: { employee: { posts_details: { code: string }[] } } | null } {
  return {
    user: {
      employee: {
        posts_details: [{ code: MOCK_ROLE }],
      },
    },
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'demandes' | 'a_jour' | 'retard' | 'archive';

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
  agriculture: "Agriculture",
  commerce: "Commerce",
  logement: "Logement",
  elevage: "Élevage",
  equipement: "Équipement",
  scolaire: "Scolaire",
  personnel: "Personnel",
};

const PURPOSE_LABELS: Record<LoanPurpose, string> = {
  achat_marchandises: "Achat de marchandises",
  fonds_roulement: "Fonds de roulement",
  construction: "Construction",
  reparation_maison: "Réparation maison",
  plantation: "Plantation",
  elevage: "Élevage",
  scolarite: "Scolarité",
  urgence: "Urgence",
  equipement: "Équipement",
};

// ─── UX rules: who can act on which status ────────────────────────────────────
// ✅ Used to disable the Edit/Review icon when the user has nothing to do on this loan.
//    The backend remains the final authority — this just avoids dead clicks.
const CAN_REVIEW: Record<UserRole, LoanStatus[]> = {
  superviseur:  ['en_attente'],
  caissier:     ['approuve', 'decaisse'],
  agent_credit: ['en_attente', 'approuve', 'decaisse'],
  directeur:    [],
  tresorier:    [],
};

// ─── Mock employee list (for "Assigned to" field) ─────────────────────────────
const MOCK_EMPLOYEES: EmployeeOption[] = [
  { id: 'EMP001', name: 'Josiane Mercier'     },
  { id: 'EMP002', name: 'Patrick Dorcélus'    },
  { id: 'EMP003', name: 'Nadège Jean-Louis'   },
  { id: 'EMP004', name: 'Lionel Préval'       },
  { id: 'EMP005', name: 'Marie-Ange Celestin' },
  { id: 'EMP006', name: 'Réginald Toussaint'  },
];

// ─── Grid ─────────────────────────────────────────────────────────────────────
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
  if (period === 'week')  return (now.getTime() - d.getTime()) <= 7 * 86_400_000;
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
// Mirrors exactly the shape returned by Django's /api/loans/ endpoint.
// When the backend is wired in, this function gets replaced by a fetch() call
// returning Promise<LoanData[]> — no other change needed in the component.

function generateLoans(): LoanData[] {
  const statuses: LoanStatus[] = [
    "decaisse", "decaisse", "decaisse",
    "rembourse",
    "approuve",
    "en_attente", "en_attente",
    "rejete",
    "annule",
  ];

  const types: LoanType[] = [
    "agriculture", "commerce", "logement", "elevage",
    "equipement", "scolaire", "personnel",
  ];

  const purposes: LoanPurpose[] = [
    "plantation", "construction", "scolarite", "elevage",
    "equipement", "achat_marchandises", "fonds_roulement",
  ];

  const collaterals: CollateralType[] = [
    "epargne_bloquee", "caution_solidaire", "betail",
    "terrain", "materiel", "aucune",
  ];

  const freqs: RepaymentFrequency[] = [
    "mensuel", "mensuel", "mensuel",
    "hebdomadaire", "saisonnier",
  ];

  const members = [
    'Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre',
    'Claudette Moreau', 'Réginald Beaumont', 'Nadège Thermidor', 'Wilgens Désir',
  ];
  const officers    = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supervisors = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses     = [
    { id: 'CAI001', numero: '01' },
    { id: 'CAI002', numero: '02' },
    { id: 'CAI003', numero: '03' },
  ];

  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const data: LoanData[] = [];
  let attempts = 0;

  for (let i = 0; i < 80 && attempts < 200; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    if (date.getDay() === 0 || date.getDay() === 6) { i--; attempts++; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    const status          = pick(statuses);
    const amount          = Math.floor(Math.random() * 150_000) + 3_000;
    const duration_months = pick([6, 12, 18, 24, 36, 48]);
    const interest_rate   = parseFloat((2.5 + Math.random() * 5).toFixed(2));
    const total_amount    = amount * (1 + interest_rate / 100);
    const monthly_payment = total_amount / duration_months;

    const payments_made =
      status === 'decaisse'  ? Math.floor(Math.random() * duration_months) :
      status === 'rembourse' ? duration_months :
      0;

    const late_days =
      status === 'decaisse' && Math.random() > 0.6
        ? Math.floor(Math.random() * 45) + 1
        : 0;

    const remaining_balance =
      status === 'rembourse' ? 0 : Math.max(0, total_amount - monthly_payment * payments_made);

    const total_paid   = monthly_payment * payments_made;
    const progress_pct = Math.round((payments_made / duration_months) * 100);

    const caisse     = pick(caisses);
    const created_at = date.toISOString();

    data.push({
      // Identity
      id_loan:        String(i + 1),
      id_member:      `MEM${1000 + i}`,
      member_name:    pick(members),
      account_number: `ACC${1000 + i}`,

      // Loan conditions
      loan_type:           pick(types),
      purpose:             pick(purposes),
      collateral:          pick(collaterals),
      amount,
      duration_months,
      interest_rate,
      repayment_frequency: pick(freqs),

      // State
      status,

      // Dates
      created_at,
      approved_at: !['en_attente', 'rejete'].includes(status)
        ? new Date(date.getTime() + 2 * 86_400_000).toISOString()
        : undefined,
      disbursed_at: ['decaisse', 'rembourse'].includes(status)
        ? new Date(date.getTime() + 5 * 86_400_000).toISOString()
        : undefined,
      closed_at: ['rembourse', 'rejete', 'annule'].includes(status)
        ? new Date(date.getTime() + 30 * 86_400_000).toISOString()
        : undefined,
      next_payment_date: status === 'decaisse'
        ? new Date(Date.now() + 15 * 86_400_000).toISOString()
        : undefined,

      // Actors
      processed_by:  pick(officers),
      validated_by:  pick(supervisors),
      assigned_to:   Math.random() > 0.3 ? pick(MOCK_EMPLOYEES).id : undefined,
      caisse_id:     caisse.id,
      caisse_numero: caisse.numero,
      session_id:    `SES-${1000 + i}`,

      // Backend-computed
      monthly_payment,
      total_amount,
      payments_made,
      total_paid,
      remaining_balance,
      late_days,
      is_late: late_days > 0,
      progress_pct,
    });
    attempts++;
  }
  return data;
}

// ─── Tab classification ───────────────────────────────────────────────────────
function getEffectiveTab(l: LoanData): TabId {
  if (['rembourse', 'rejete', 'annule'].includes(l.status)) return 'archive';
  if (l.late_days > 0) return 'retard';
  if (l.status === 'decaisse') return 'a_jour';
  return 'demandes';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoansTable() {
  // ── Auth ──
  const { user } = useAuth();

  const userRole: UserRole =
    user?.employee?.posts_details?.some(p => p.code === 'superviseur') ? 'superviseur'
    : user?.employee?.posts_details?.some(p => p.code === 'caissier')   ? 'caissier'
    : 'agent_credit';

  // ── General state ──
  const [activeTab,      setActiveTab]      = useState<TabId>('demandes');
  const [sortField,      setSortField]      = useState('created_at');
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('desc');

  const [search,         setSearch]         = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<LoanFilterPeriod>('all');
  const [selectedType,   setSelectedType]   = useState<LoanFilterType>('all');
  const [selectedRange,  setSelectedRange]  = useState<LoanFilterRange>('all');

  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [activeAction,   setActiveAction]   = useState<LoanBulkAction | null>(null);
  const [detailTx,       setDetailTx]       = useState<TransactionDetail | null>(null);

  // ── Modals ──
  const [newLoanOpen,   setNewLoanOpen]   = useState(false);
  const [editingLoan,   setEditingLoan]   = useState<LoanData | null>(null);
  const [disburseLoan,  setDisburseLoan]  = useState<LoanData | null>(null);
  const [repaymentLoan, setRepaymentLoan] = useState<LoanData | null>(null);

  // ── Data (local state to reflect mutations) ──
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
        || l.id_member.toLowerCase().includes(q)
        || String(l.id_loan).includes(q);
      const matchType    = selectedType === 'all' || l.loan_type === selectedType;
      const matchRange_  = matchesRange(l.amount, selectedRange);
      const matchPeriod_ = matchesPeriod(l.created_at, selectedPeriod);
      return matchSearch && matchType && matchRange_ && matchPeriod_;
    });
  }, [tabLoans, search, selectedType, selectedRange, selectedPeriod]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'amount')      return (a.amount - b.amount) * dir;
    if (sortField === 'status')      return a.status.localeCompare(b.status) * dir;
    if (sortField === 'loan_type')   return a.loan_type.localeCompare(b.loan_type) * dir;
    if (sortField === 'duration')    return (a.duration_months - b.duration_months) * dir;
    if (sortField === 'progress') {
      const pa = a.payments_made / a.duration_months;
      const pb = b.payments_made / b.duration_months;
      return (pa - pb) * dir;
    }
    if (sortField === 'created_at')  return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    return a.member_name.localeCompare(b.member_name) * dir;
  }), [filtered, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(l => l.id_loan)));
  const toggleRow    = (id: string) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };

  const selectedLoans = useMemo(
    () => sorted.filter(l => selected.has(l.id_loan)),
    [sorted, selected],
  );

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setSelected(new Set());
    setSearch('');
    setSelectedPeriod('all');
    setSelectedType('all');
    setSelectedRange('all');
    if (tab === 'demandes')    { setSortField('created_at'); setSortDir('desc'); }
    else if (tab === 'retard') { setSortField('progress');   setSortDir('asc');  }
    else if (tab === 'a_jour') { setSortField('progress');   setSortDir('asc');  }
    else                       { setSortField('created_at'); setSortDir('desc'); }
  };

  const isArchiveTab  = activeTab === 'archive';
  const isDemandesTab = activeTab === 'demandes';
  const isActifsTab   = activeTab === 'a_jour' || activeTab === 'retard';

  const dropdownContext = isArchiveTab ? 'archive'
                        : isDemandesTab ? 'pending'
                        : 'active';

  // ── Adaptive columns ──
  const COLS = useMemo(() => [
    { label: 'Membre',  field: 'member_name' },
    { label: 'Type',    field: 'loan_type'   },
    { label: 'Montant', field: 'amount'      },
    { label: 'Statut',  field: 'status'      },
    isDemandesTab
      ? { label: 'Durée',       field: 'duration' }
      : { label: 'Progression', field: 'progress' },
    { label: 'Date',    field: 'created_at'  },
  ], [isDemandesTab]);

  // ── Detail (read-only view) ──
  const STATUS_MAP: Record<LoanStatus, TransactionDetail['status']> = {
    en_attente: 'en_attente', approuve: 'en_cours', decaisse: 'decaisse',
    rembourse:  'rembourse',  rejete: 'echoue',     annule: 'annule',
  };

  const handleView = (l: LoanData) => setDetailTx({
    id: l.id_loan, kind: 'loan', status: STATUS_MAP[l.status],
    montant: l.amount, created_at: l.disbursed_at ?? l.created_at,
    member_name: l.member_name, member_id: l.id_member, account_number: l.account_number,
    description: `${TYPE_LABELS[l.loan_type]} — ${PURPOSE_LABELS[l.purpose]}`,
    processed_by: l.processed_by, validated_by: l.validated_by,
    caisse_numero: l.caisse_numero, caisse_id: l.caisse_id, session_id: l.session_id,
  });

  // ── Open review modal ──
  const handleReview = (l: LoanData) => setEditingLoan(l);

  // ── Disburse ──
  const handleDisburse = (l: LoanData) => setDisburseLoan(l);
 const handleRecordPayment = (loan: LoanData) => {
  console.log('🟢 Opening repayment modal for loan:', loan.id_loan); // debug
  setRepaymentLoan(loan);   // ✅ le bon state
};

  const loanForDisburse: LoanForDisburse | null = useMemo(() => {
    if (!disburseLoan) return null;
    return {
      id_loan:         disburseLoan.id_loan,
      member_name:     disburseLoan.member_name,
      member_id:       disburseLoan.id_member,
      amount:          disburseLoan.amount,
      loan_type:       TYPE_LABELS[disburseLoan.loan_type],
      duration_months: disburseLoan.duration_months,
      monthly_payment: disburseLoan.monthly_payment,
    };
  }, [disburseLoan]);

  const handleDisburseConfirm = async (loanId: string | number) => {
    // TODO API: await loanService.disburse(loanId, { session: currentSessionId });
    console.log('TODO API disburse:', loanId);
    await new Promise(r => setTimeout(r, 400));
    setLoans(prev => prev.map(l =>
      l.id_loan === loanId
        ? { ...l, status: 'decaisse' as LoanStatus, disbursed_at: new Date().toISOString() }
        : l
    ));
  };

  // ── LoanData → LoanForEdit conversion ──
  const loanForEdit = useMemo<LoanForEdit | null>(() => {
    if (!editingLoan) return null;

    return {
      id_loan:     editingLoan.id_loan,
      id_member:   editingLoan.id_member,
      member_name: editingLoan.member_name,

      montantDemande: editingLoan.amount,
      status:         editingLoan.status,

      // Locked fields
      loan_type:       TYPE_LABELS[editingLoan.loan_type],
      purpose:         PURPOSE_LABELS[editingLoan.purpose],
      duration_months: editingLoan.duration_months,
      interest_rate:   editingLoan.interest_rate,
      monthly_payment: editingLoan.monthly_payment,
      created_at:      editingLoan.created_at,
      processed_by:    editingLoan.processed_by!,
      validated_by:    editingLoan.validated_by,

      // Editable fields
      assigned_to: editingLoan.assigned_to,
      notes:       editingLoan.notes,
    };
  }, [editingLoan]);

  // ── Confirm review actions ──
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
      // ─── WORKFLOW ACTION (status change) ───
      if (changes.status === 'approuve') {
        // await loanService.approve(loanId, { password: changes.password!, reason: changes.reason });
        console.log('TODO API approve:', loanId, { password: '***', reason: changes.reason });
      } else if (changes.status === 'rejete') {
        // await loanService.reject(loanId, { password: changes.password!, reason: changes.reason! });
        console.log('TODO API reject:', loanId, { password: '***', reason: changes.reason });
      } else if (changes.status === 'decaisse') {
        // await loanService.disburse(loanId, { session: currentSessionId, reason: changes.reason });
        console.log('TODO API disburse:', loanId, { reason: changes.reason });
      } else if (changes.status === 'rembourse') {
        // await loanService.close(loanId, { reason: changes.reason });
        console.log('TODO API close (rembourse):', loanId, { reason: changes.reason });
      }

      // ─── NEUTRAL CHANGES (notes, assignment) — supplementary patch ───
      if (changes.assigned_to !== undefined || changes.notes !== undefined) {
        // await loanService.patch(loanId, { assigned_to: changes.assigned_to, notes: changes.notes });
        console.log('TODO API patch:', loanId, {
          assigned_to: changes.assigned_to,
          notes:       changes.notes,
        });
      }

      // ─── Optimistic local update (remove once API returns the updated loan) ───
      setLoans(prev => prev.map(l => {
        if (l.id_loan !== loanId) return l;
        return {
          ...l,
          status:      changes.status      ?? l.status,
          assigned_to: changes.assigned_to !== undefined ? changes.assigned_to : l.assigned_to,
          notes:       changes.notes       !== undefined ? changes.notes       : l.notes,
        };
      }));
    } catch (error) {
      console.error('Error updating loan:', error);
      throw error;
    }
  };

  // ── Bulk actions ──
  const bulkLoans: LoanForBulk[] = selectedLoans.map(l => ({
    id_loan:           l.id_loan,
    member_name:       l.member_name,
    id_member:         l.id_member,
    montantDemande:    l.amount,
    status:            l.status,
    late_days:         l.late_days,
    remaining_balance: l.remaining_balance,
    duration_months:   l.duration_months,
    payments_made:     l.payments_made,
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

  // ── LoanData → LoanForRepayment conversion ──
  const loanForRepayment: LoanForRepayment | null = useMemo(() => {
    if (!repaymentLoan) return null;

    return {
      id_loan:     repaymentLoan.id_loan,
      member_name: repaymentLoan.member_name,
      member_id:   repaymentLoan.id_member,

      loan_details: {
        total_amount:        repaymentLoan.total_amount,
        monthly_payment:     repaymentLoan.monthly_payment,
        remaining_balance:   repaymentLoan.remaining_balance,
        repayment_frequency: repaymentLoan.repayment_frequency,
        next_payment_date:   repaymentLoan.next_payment_date,
        late_days:           repaymentLoan.late_days,
        payments_made:       repaymentLoan.payments_made,
      },
    };
  }, [repaymentLoan]);

  const handleRepaymentConfirm = async (payload: {
    loan_id: string;
    amount_paid: number;
    note?: string;
  }) => {
    try {
      // TODO API: await loanService.recordPayment(payload.loan_id, { amount: payload.amount_paid, note: payload.note, session: currentSessionId });
      console.log('TODO API repayment:', payload);
      await new Promise(r => setTimeout(r, 400));

      // Optimistic local update
      setLoans(prev => prev.map(l => {
        if (l.id_loan !== payload.loan_id) return l;

        const new_payments_made     = l.payments_made + 1;
        const new_remaining_balance = Math.max(0, l.remaining_balance - payload.amount_paid);
        const new_total_paid        = (l.total_paid ?? 0) + payload.amount_paid;
        const is_fully_paid         = new_remaining_balance <= 0;

        return {
          ...l,
          payments_made:     new_payments_made,
          remaining_balance: new_remaining_balance,
          total_paid:        new_total_paid,
          progress_pct:      Math.round((new_payments_made / l.duration_months) * 100),
          status:            is_fully_paid ? ('rembourse' as LoanStatus) : l.status,
          closed_at:         is_fully_paid ? new Date().toISOString() : l.closed_at,
          // Reset late info after payment (backend will recompute)
          late_days:         0,
          is_late:           false,
        };
      }));
    } catch (error) {
      console.error('Error during repayment:', error);
      throw error;
    }
  };

  // ── New loan ──
  const handleNewLoanSubmit = async (data: LoanFormData): Promise<void> => {
    console.log('New loan:', data);
    await new Promise<void>(r => setTimeout(r, 400));
    setNewLoanOpen(false);
    // TODO: refetch list from API
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
        loans={filtered} 
      />

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tabs */}
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

        {/* Archive banner */}
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

        {/* Selection bar */}
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

        {/* Column header */}
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

        {/* Rows */}
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
            const isSelected  = selected.has(loan.id_loan);
            const rawProgress = (loan.payments_made / loan.duration_months) * 100;
            const progress    = Math.min(100, Math.max(0, Math.round(rawProgress)));
            const isLate      = loan.late_days > 0;
            const isCritical  = loan.late_days >= 30;

            const canReview = !isArchiveTab && CAN_REVIEW[userRole].includes(loan.status);

            return (
              <div key={loan.id_loan}
                className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${isArchiveTab ? 'opacity-75' : ''} ${
                  isSelected ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : isCritical ? 'bg-red-50/30 hover:bg-red-50/50'
                  : isLate     ? 'bg-yellow-50/30 hover:bg-yellow-50/50'
                  : i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
                }`}
                style={{ gridTemplateColumns: GRID }}>

                {/* Checkbox */}
                <div className="flex items-center justify-center">
                  <button onClick={() => toggleRow(loan.id_loan)}
                    className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                    }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </button>
                </div>

                {/* Member */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${isArchiveTab ? 'opacity-60 grayscale' : ''}`}>
                    <Users className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate leading-tight ${isArchiveTab ? 'text-gray-400' : 'text-gray-900'}`}>
                      {loan.member_name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{loan.id_member}</p>
                  </div>
                </div>

                {/* Type / Purpose */}
                <div>
                  <p className="text-xs font-medium text-gray-700">{TYPE_LABELS[loan.loan_type]}</p>
                  <p className="text-xs text-gray-400 truncate">{PURPOSE_LABELS[loan.purpose]}</p>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-sm font-bold text-gray-800">{formatHTG(loan.amount)}</p>
                  <p className="text-xs text-gray-400">{loan.interest_rate}% · {loan.duration_months} mois</p>
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {isLate && (
                    <p className={`text-xs font-semibold mt-0.5 ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
                      {loan.late_days}j retard
                    </p>
                  )}
                </div>

                {/* Column 5: Duration or Progress */}
                {isDemandesTab ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {loan.duration_months} mois
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ~{formatHTG(Math.round(loan.monthly_payment))}/mois
                    </p>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {loan.payments_made}/{loan.duration_months}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${progress}%`,
                        backgroundColor: progress >= 75 ? C.green : progress >= 50 ? C.blue : progress >= 25 ? C.gold : '#EF4444',
                      }} />
                    </div>
                    {loan.remaining_balance > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {formatHTG(loan.remaining_balance)} restant
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
{/* 
                  {loan.status === 'approuve' && !isArchiveTab && (
                    <button
                      title="Décaisser ce prêt"
                      onClick={() => handleDisburse(loan)}
                      className="p-1.5 rounded-lg text-[#2E7D32] hover:bg-[#DDEAD5] transition-colors"
                    >
                      <Banknote className="w-3.5 h-3.5" />
                    </button>
                  )} */}

                  {/* DÉCAISSEMENT : remise des fonds au membre */}
                  {loan.status === 'approuve' && !isArchiveTab && (
                    <button
                      title="Décaisser ce prêt (remettre les fonds)"
                      onClick={() => handleDisburse(loan)}
                      className="p-1.5 rounded-lg text-[#2E7D32] hover:bg-[#DDEAD5] transition-colors cursor-pointer"
                    >
                      <HandCoins className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* REMBOURSEMENT : encaisser un paiement du membre */}
                  {isActifsTab && loan.status === 'decaisse' && (
                    <>
                      {/* <button
                        title="Envoyer un rappel"
                        onClick={() => handleSendReminder(loan)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-500 transition-colors cursor-pointer">
                        <Bell className="w-3.5 h-3.5" />
                      </button> */}
                     <button
                      title="Enregistrer un remboursement"
                      onClick={() => handleRecordPayment(loan)}
                      className="p-1.5 rounded-lg text-[#2E7D32] hover:bg-[#DDEAD5] transition-colors cursor-pointer">
                      <Wallet className="w-3.5 h-3.5" />
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
        currentUserRole={userRole}
        onClose={() => setEditingLoan(null)}
        onConfirm={handleReviewConfirm}
      />

      <DisburseLoanModal
        isOpen={disburseLoan !== null}
        loan={loanForDisburse}
        onClose={() => setDisburseLoan(null)}
        onConfirm={handleDisburseConfirm}
      />

      
      <RepaymentLoanModal
        isOpen={!!loanForRepayment}
        loan={loanForRepayment}
        onClose={() => setRepaymentLoan(null)}
        onConfirm={handleRepaymentConfirm}
      />
    </div>
  );
}