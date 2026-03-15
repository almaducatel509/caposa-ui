'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie,
} from 'recharts';
import {
  Landmark, Search, Users, TrendingUp, CheckCircle2,
  Clock, AlertTriangle, XCircle, Banknote, Eye,
  MoreHorizontal, ChevronDown, ChevronUp, ArrowLeft,
  FileText, DollarSign,
} from 'lucide-react';
import TransactionDetailModal, { TransactionDetail } from '../transactions/DetailModal';
import PageHeader from '../header';

// ─── Types ────────────────────────────────────────────────────────────────────
type LoanStatus = 'en_attente' | 'approuve' | 'decaisse' | 'rembourse' | 'rejete' | 'annule';
type LoanType   = 'agriculture' | 'commerce' | 'logement' | 'education' | 'sante' | 'autre';
type LoanPurpose = 'plantation' | 'construction' | 'scolarite' | 'commerce' | 'elevage' | 'equipement' | 'autre';

interface LoanRequest {
  id:           number;
  amount:       number;
  status:       LoanStatus;
  member_name:  string;
  member_id:    string;
  account_number: string;
  created_at:   string;
  approved_at?: string;
  disbursed_at?: string;
  processed_by:  string;
  validated_by:  string;
  caisse_numero: string;
  caisse_id:     string;
  session_id:    string;
  loan_details: {
    duration_months:   number;
    interest_rate:     number;
    monthly_payment:   number;
    total_amount:      number;
    purpose:           LoanPurpose;
    loan_type:         LoanType;
    collateral_type:   'epargne_bloquee' | 'caution_solidaire' | 'betail' | 'terrain' | 'vehicule' | 'autre';
    repayment_frequency: 'mensuel' | 'hebdomadaire' | 'saisonnier';
    payments_made:     number;
    remaining_balance: number;
    next_payment_date?: string;
    late_days:         number;
  };
}

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
};

const tooltipStyle = {
  backgroundColor: 'white',
  border: `1px solid ${C.greenPale}`,
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

// ─── Config statuts ───────────────────────────────────────────────────────────
const STATUS_CFG: Record<LoanStatus, { label: string; bg: string; text: string; dot: string; icon: React.ElementType }> = {
  en_attente: { label: 'En attente', bg: '#FEF9EC',   text: '#B45309',   dot: '#F59E0B', icon: Clock        },
  approuve:   { label: 'Approuvé',   bg: '#EBF2F8',   text: C.blue,      dot: C.blue,    icon: CheckCircle2 },
  decaisse:   { label: 'Décaissé',   bg: C.greenPale, text: C.greenDark, dot: C.green,   icon: Banknote     },
  rembourse:  { label: 'Remboursé',  bg: '#F0FDF4',   text: '#166534',   dot: '#22C55E', icon: CheckCircle2 },
  rejete:     { label: 'Rejeté',     bg: '#FEF2F2',   text: '#B91C1C',   dot: '#EF4444', icon: XCircle      },
  annule:     { label: 'Annulé',     bg: '#F3F4F6',   text: '#4B5563',   dot: '#9CA3AF', icon: XCircle      },
};

const TYPE_LABELS: Record<LoanType, string> = {
  agriculture: 'Agriculture', commerce: 'Commerce',
  logement:    'Logement',    education: 'Éducation',
  sante:       'Santé',       autre: 'Autre',
};

const PURPOSE_LABELS: Record<LoanPurpose, string> = {
  plantation: 'Plantation', construction: 'Construction',
  scolarite:  'Scolarité',  commerce: 'Commerce',
  elevage:    'Élevage',    equipement: 'Équipement',
  autre:      'Autre',
};

const FREQ_LABELS: Record<string, string> = {
  mensuel: 'Mensuel', hebdomadaire: 'Hebdo.', saisonnier: 'Saisonnier',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Mock data ────────────────────────────────────────────────────────────────
function generateLoanRequests(daysBack: number): LoanRequest[] {
  const statuses: LoanStatus[] = ['decaisse', 'decaisse', 'decaisse', 'rembourse', 'approuve', 'en_attente', 'rejete', 'annule'];
  const types:    LoanType[]   = ['agriculture', 'commerce', 'logement', 'education', 'sante', 'autre'];
  const purposes: LoanPurpose[]= ['plantation', 'construction', 'scolarite', 'commerce', 'elevage', 'equipement', 'autre'];
  const collaterals            = ['epargne_bloquee', 'caution_solidaire', 'betail', 'terrain', 'vehicule', 'autre'] as const;
  const freqs                  = ['mensuel', 'mensuel', 'mensuel', 'hebdomadaire', 'saisonnier'] as const;
  const members   = ['Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre', 'Claudette Moreau', 'Réginald Beaumont', 'Nadège Thermidor', 'Wilgens Désir'];
  const employes  = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supers    = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses   = [{ id: 'CAI001', numero: '01' }, { id: 'CAI002', numero: '02' }, { id: 'CAI003', numero: '03' }];
  const data: LoanRequest[] = [];
  let attempts = 0;

  for (let i = 0; i < 80 && attempts < 200; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    if (date.getDay() === 0 || date.getDay() === 6) { i--; attempts++; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    const status   = statuses[Math.floor(Math.random() * statuses.length)];
    const amount   = Math.floor(Math.random() * 50000) + 5000;
    const duration = [6, 12, 18, 24, 36, 48][Math.floor(Math.random() * 6)];
    const rate     = 2.5 + Math.random() * 5;
    const monthly  = (amount * (1 + rate / 100)) / duration;
    const paid     = status === 'decaisse' ? Math.floor(Math.random() * duration) : status === 'rembourse' ? duration : 0;
    const lateDays = status === 'decaisse' && Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0;
    const caisse   = caisses[Math.floor(Math.random() * caisses.length)];

    data.push({
      id: i + 1, amount, status,
      member_name:   members[Math.floor(Math.random() * members.length)],
      member_id:     `MEM${1000 + i}`,
      account_number:`ACC${1000 + i}`,
      created_at:    date.toISOString(),
      approved_at:   !['en_attente','rejete'].includes(status) ? new Date(date.getTime() + 2 * 86400000).toISOString() : undefined,
      disbursed_at:  ['decaisse','rembourse'].includes(status)  ? new Date(date.getTime() + 5 * 86400000).toISOString() : undefined,
      processed_by:  employes[Math.floor(Math.random() * employes.length)],
      validated_by:  supers[Math.floor(Math.random() * supers.length)],
      caisse_numero: caisse.numero,
      caisse_id:     caisse.id,
      session_id:    `SES-${1000 + i}`,
      loan_details: {
        duration_months:   duration,
        interest_rate:     parseFloat(rate.toFixed(2)),
        monthly_payment:   monthly,
        total_amount:      amount * (1 + rate / 100),
        purpose:           purposes[Math.floor(Math.random() * purposes.length)],
        loan_type:         types[Math.floor(Math.random() * types.length)],
        collateral_type:   collaterals[Math.floor(Math.random() * collaterals.length)],
        repayment_frequency: freqs[Math.floor(Math.random() * freqs.length)],
        payments_made:     paid,
        remaining_balance: status === 'rembourse' ? 0 : amount - monthly * paid,
        next_payment_date: status === 'decaisse' ? new Date(Date.now() + 15 * 86400000).toISOString() : undefined,
        late_days:         lateDays,
      },
    });
    attempts++;
  }
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accent + '22' }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoanRequestsTable() {
  const [period,    setPeriod]    = useState<'day' | 'week' | 'month'>('week');
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('all');
  const [typeF,     setTypeF]     = useState('all');
  const [minAmt,    setMinAmt]    = useState('');
  const [maxAmt,    setMaxAmt]    = useState('');
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  const [detailTx,  setDetailTx]  = useState<TransactionDetail | null>(null);
  const [sortField, setSortField] = useState<'date' | 'amount' | 'duration'>('date');
  const [sortAsc,   setSortAsc]   = useState(false);

  const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  const loans    = useMemo(() => generateLoanRequests(daysBack), [daysBack]);

  const filtered = useMemo(() => {
    const r = loans.filter(l => {
      const q = search.toLowerCase();
      return (q === '' || l.member_name.toLowerCase().includes(q) || l.member_id.toLowerCase().includes(q) || String(l.id).includes(q))
        && (statusF === 'all' || l.status === statusF)
        && (typeF   === 'all' || l.loan_details.loan_type === typeF)
        && (!minAmt || l.amount >= parseFloat(minAmt))
        && (!maxAmt || l.amount <= parseFloat(maxAmt));
    });
    return [...r].sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === 'amount')   return (a.amount - b.amount) * dir;
      if (sortField === 'duration') return (a.loan_details.duration_months - b.loan_details.duration_months) * dir;
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });
  }, [loans, search, statusF, typeF, minAmt, maxAmt, sortField, sortAsc]);

  const grouped = useMemo(() =>
    filtered.reduce((acc, l) => {
      const key = new Date(l.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      if (!acc[key]) acc[key] = [];
      acc[key].push(l);
      return acc;
    }, {} as Record<string, LoanRequest[]>),
    [filtered]
  );

  const STATUS_MAP: Record<LoanStatus, TransactionDetail['status']> = {
    en_attente: 'en_attente', approuve: 'en_cours',  decaisse: 'decaisse',
    rembourse:  'rembourse',  rejete:   'echoue',     annule:   'annule',
  };

  const handleView = (l: LoanRequest) => setDetailTx({
    id: l.id, kind: 'loan', status: STATUS_MAP[l.status],
    montant: l.amount, created_at: l.disbursed_at ?? l.created_at,
    member_name: l.member_name, member_id: l.member_id, account_number: l.account_number,
    description: `${TYPE_LABELS[l.loan_details.loan_type]} — ${PURPOSE_LABELS[l.loan_details.purpose]}`,
    processed_by: l.processed_by, validated_by: l.validated_by,
    caisse_numero: l.caisse_numero, caisse_id: l.caisse_id, session_id: l.session_id,
  });

  const handleSort = (f: typeof sortField) => { if (sortField === f) setSortAsc(a => !a); else { setSortField(f); setSortAsc(false); } };
  const handleSelectAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(l => l.id)));

  const SortIcon = ({ f }: { f: typeof sortField }) => sortField === f ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  // ── KPIs ──
  const totalLoaned  = loans.filter(l => ['decaisse','rembourse'].includes(l.status)).reduce((s, l) => s + l.amount, 0);
  const totalRepaid  = loans.filter(l => l.status === 'rembourse').reduce((s, l) => s + l.amount, 0);
  const activeCount  = loans.filter(l => l.status === 'decaisse').length;
  const pendingCount = loans.filter(l => l.status === 'en_attente').length;
  const lateCount    = loans.filter(l => l.loan_details.late_days > 0).length;
  const approvalRate = loans.length > 0 ? (loans.filter(l => ['approuve','decaisse','rembourse'].includes(l.status)).length / loans.length * 100) : 0;

  // ── Graphiques ──
  const typeDistrib = useMemo(() => {
    const map: Record<LoanType, { count: number; amount: number; color: string }> = {
      agriculture: { count: 0, amount: 0, color: '#81C784' },
      commerce:    { count: 0, amount: 0, color: C.green   },
      logement:    { count: 0, amount: 0, color: C.blue    },
      education:   { count: 0, amount: 0, color: C.gold    },
      sante:       { count: 0, amount: 0, color: '#A5C8A5' },
      autre:       { count: 0, amount: 0, color: '#C8A97B' },
    };
    loans.forEach(l => { map[l.loan_details.loan_type].count++; map[l.loan_details.loan_type].amount += l.amount; });
    return Object.entries(map).map(([k, v]) => ({ name: TYPE_LABELS[k as LoanType], value: v.count, amount: v.amount, color: v.color }));
  }, [loans]);

  const statusDistrib = useMemo(() =>
    Object.entries(STATUS_CFG).map(([k, v]) => ({ label: v.label, count: loans.filter(l => l.status === k).length, color: v.dot })),
    [loans]
  );

  return (
    <div className="flex flex-col gap-6  md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <a href="/dashboard/loans" className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-gray-600 border border-transparent hover:border-gray-100 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <PageHeader title="Registre des prêts" subtitle="Historique complet — toutes demandes"
            icon={<FileText className="w-8 h-8 text-[#2E7D32]" />} />
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 shrink-0">
          {(['day', 'week', 'month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {p === 'day' ? 'Auj.' : p === 'week' ? '7 j' : '30 j'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard icon={FileText}    label="Total demandes"   value={loans.length}               sub={`${activeCount} actifs`}           accent={C.green}   />
        <KPICard icon={DollarSign}  label="Montant prêté"    value={formatHTG(totalLoaned)}                                              accent={C.blue}    />
        <KPICard icon={CheckCircle2}label="Remboursé"        value={formatHTG(totalRepaid)}     sub={`${loans.filter(l=>l.status==='rembourse').length} prêts`} accent={C.green} />
        <KPICard icon={TrendingUp}  label="Taux approbation" value={`${approvalRate.toFixed(1)}%`}                                      accent={C.green}   />
        <KPICard icon={Clock}       label="En attente"       value={pendingCount}               sub="à valider"                         accent={C.gold}    />
        <KPICard icon={AlertTriangle}label="En retard"       value={lateCount}                  sub="paiements"                         accent="#EF4444"   />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Répartition par type</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={200}>
              <PieChart>
                <Pie data={typeDistrib} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {typeDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-2">
              {typeDistrib.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-800">{item.value}</span>
                    <p className="text-xs text-gray-400">{formatHTG(item.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Statut des demandes</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusDistrib} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" horizontal={false} />
              <XAxis type="number" stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="label" stroke="#9CA3AF" fontSize={11} width={80} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [v ?? 0, 'Demandes']} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Demandes">
                {statusDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Filtres */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Membre, ID, montant…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]">
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={typeF} onChange={e => setTypeF(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]">
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="number" placeholder="Montant min" value={minAmt} onChange={e => setMinAmt(e.target.value)}
            className="w-28 px-3 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          <input type="number" placeholder="Montant max" value={maxAmt} onChange={e => setMaxAmt(e.target.value)}
            className="w-28 px-3 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          <span className="ml-auto self-center text-xs text-gray-400 shrink-0">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Header colonnes */}
        <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 px-5 py-3">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="col-span-1">
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30 cursor-pointer" />
            </div>
            <div className="col-span-1 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32]" onClick={() => handleSort('date')}>Date <SortIcon f="date" /></div>
            <div className="col-span-2">Membre</div>
            <div className="col-span-1">Type / But</div>
            <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32]" onClick={() => handleSort('amount')}>Montant <SortIcon f="amount" /></div>
            <div className="col-span-1 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32]" onClick={() => handleSort('duration')}>Durée <SortIcon f="duration" /></div>
            <div className="col-span-1">Statut</div>
            <div className="col-span-2">Paiements</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Badge sélection */}
        {selected.size > 0 && (
          <div className="bg-[#DDEAD5]/50 border-b border-[#DDEAD5] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#1B5E20]">{selected.size} prêt{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}</span>
              <button onClick={() => setSelected(new Set())} className="text-xs text-[#2E7D32] hover:text-[#1B5E20] font-medium underline">Désélectionner</button>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Exporter la sélection</button>
              <button className="px-3 py-1.5 rounded-lg bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all">Actions groupées</button>
            </div>
          </div>
        )}

        {/* Corps groupé par date */}
        <div>
          {Object.entries(grouped).map(([dateLabel, group]) => (
            <div key={dateLabel}>
              <div className="bg-linear-to-r from-[#DDEAD5]/40 to-[#F9F9F6] px-5 py-2 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{dateLabel}</p>
              </div>
              {group.map((loan, idx) => {
                const sc = STATUS_CFG[loan.status];
                const SIcon = sc.icon;
                const isSelected = selected.has(loan.id);
                const progress = Math.round((loan.loan_details.payments_made / loan.loan_details.duration_months) * 100);
                const isLate = loan.loan_details.late_days > 0;

                return (
                  <div key={loan.id}
                    className={`grid grid-cols-12 gap-3 items-center px-5 py-4 transition-all group border-b border-gray-50 last:border-0 ${
                      isSelected   ? 'bg-[#DDEAD5]/30 border-l-4 border-[#2E7D32]'
                      : isLate     ? 'bg-yellow-50/30 hover:bg-yellow-50/50'
                      : idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F6]' : 'bg-[#F9F9F6]/40 hover:bg-[#F9F9F6]'
                    }`}>

                    <div className="col-span-1">
                      <input type="checkbox" checked={isSelected}
                        onChange={() => setSelected(s => { const n = new Set(s); n.has(loan.id) ? n.delete(loan.id) : n.add(loan.id); return n; })}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30 cursor-pointer" />
                    </div>

                    {/* Date */}
                    <div className="col-span-1">
                      <p className="text-xs font-semibold text-gray-700">{formatDate(loan.created_at)}</p>
                      <p className="text-xs text-gray-400">{new Date(loan.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    {/* Membre */}
                    <div className="col-span-2 flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Users className="w-4 h-4 text-[#2E7D32]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{loan.member_name}</p>
                        {isLate && <p className="text-xs text-red-500 font-medium">{loan.loan_details.late_days}j retard</p>}
                      </div>
                    </div>

                    {/* Type / But */}
                    <div className="col-span-1">
                      <p className="text-xs font-medium text-gray-700">{TYPE_LABELS[loan.loan_details.loan_type]}</p>
                      <p className="text-xs text-gray-400">{PURPOSE_LABELS[loan.loan_details.purpose]}</p>
                    </div>

                    {/* Montant */}
                    <div className="col-span-2">
                      <p className="text-sm font-bold text-gray-800">{formatHTG(loan.amount)}</p>
                      <p className="text-xs text-gray-400">{loan.loan_details.interest_rate}% · {FREQ_LABELS[loan.loan_details.repayment_frequency]}</p>
                    </div>

                    {/* Durée */}
                    <div className="col-span-1">
                      <p className="text-sm font-semibold text-gray-700">{loan.loan_details.duration_months} mois</p>
                      <p className="text-xs text-gray-400">{formatHTG(Math.round(loan.loan_details.monthly_payment))}/mois</p>
                    </div>

                    {/* Statut */}
                    <div className="col-span-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium"
                        style={{ backgroundColor: sc.bg, color: sc.text }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />
                        {sc.label}
                      </span>
                    </div>

                    {/* Paiements */}
                    <div className="col-span-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">{loan.loan_details.payments_made}/{loan.loan_details.duration_months}</span>
                        <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${progress}%`,
                          backgroundColor: progress >= 75 ? C.green : progress >= 50 ? C.blue : progress >= 25 ? C.gold : '#EF4444',
                        }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{formatHTG(Math.max(0, loan.loan_details.remaining_balance))} restant</p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-center gap-1.5">
                      <button title="Voir" onClick={() => handleView(loan)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button title="Plus"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* État vide */}
        {filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Aucun prêt trouvé</p>
            <p className="text-xs text-gray-400">Modifiez les filtres pour voir plus de résultats</p>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{filtered.length}</span> prêt{filtered.length !== 1 ? 's' : ''} · {loans.length} au total
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              {activeCount} actifs · {pendingCount} en attente
            </span>
          </div>
        )}
      </div>

      <TransactionDetailModal transaction={detailTx} onClose={() => setDetailTx(null)} />
    </div>
  );
}