'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie,
} from 'recharts';
import {
  Landmark, Search, Users, TrendingUp, CheckCircle2,
  AlertTriangle, XCircle, Banknote, Eye, MoreHorizontal,
  ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import TransactionDetailModal, { TransactionDetail } from '../transactions/DetailModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type LoanType = 'commerce' | 'logement' | 'agriculture' | 'elevage' | 'equipement' | 'scolaire' | 'personnel';

interface ActiveLoanData {
  id:           number;
  member_name:  string;
  member_id:    string;
  account_number: string;
  amount:       number;
  loan_type:    LoanType;
  purpose:      string;
  duration_months:   number;
  interest_rate:     number;
  monthly_payment:   number;
  remaining_balance: number;
  payments_made:     number;
  next_payment_date: string;
  last_payment_date?: string;
  late_days:    number;
  is_late:      boolean;
  created_at:   string;
  disbursed_at: string;
  // Traçabilité
  processed_by:  string;
  validated_by:  string;
  caisse_numero: string;
  caisse_id:     string;
  session_id:    string;
}

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
  page:      '#F9F9F6',
};

const tooltipStyle = {
  backgroundColor: 'white',
  border: `1px solid ${C.greenPale}`,
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

const TYPE_LABELS: Record<LoanType, string> = {
  commerce:    'Commerce',
  logement:    'Logement',
  agriculture: 'Agriculture',
  elevage:     'Élevage',
  equipement:  'Équipement',
  scolaire:    'Scolaire',
  personnel:   'Personnel',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

// ─── Mock data ────────────────────────────────────────────────────────────────
function generateActiveLoans(): ActiveLoanData[] {
  const types:    LoanType[] = ['commerce', 'logement', 'agriculture', 'elevage', 'equipement', 'scolaire', 'personnel'];
  const purposes  = ['Achat marchandises', 'Construction', 'Plantation', 'Bétail', 'Matériel', 'Scolarité', 'Urgence'];
  const members   = ['Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre', 'Claudette Moreau', 'Réginald Beaumont', 'Nadège Thermidor', 'Wilgens Désir'];
  const employes  = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supers    = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses   = [{ id: 'CAI001', numero: '01' }, { id: 'CAI002', numero: '02' }, { id: 'CAI003', numero: '03' }];

  const data: ActiveLoanData[] = [];

  for (let i = 0; i < 60; i++) {
    // Décaissement entre 1 et 18 mois dans le passé
    const disbursed = new Date();
    disbursed.setMonth(disbursed.getMonth() - Math.floor(Math.random() * 18) - 1);
    disbursed.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    const amount   = Math.floor(Math.random() * 70000) + 5000;
    const duration = [6, 12, 18, 24, 36, 48][Math.floor(Math.random() * 6)];
    const rate     = 2.5 + Math.random() * 5;
    const monthly  = (amount * (1 + rate / 100)) / duration;
    const monthsElapsed = Math.floor((Date.now() - disbursed.getTime()) / (30 * 86400000));
    const paid     = Math.min(monthsElapsed, duration - 1);
    const isLate   = Math.random() > 0.7;
    const lateDays = isLate ? Math.floor(Math.random() * 45) + 1 : 0;
    const caisse   = caisses[Math.floor(Math.random() * caisses.length)];

    const nextPayment = new Date();
    nextPayment.setDate(nextPayment.getDate() + (isLate ? -lateDays : Math.floor(Math.random() * 28) + 1));

    data.push({
      id:                i + 1,
      member_name:       members[i % members.length],
      member_id:         `MEM${1000 + i}`,
      account_number:    `ACC${1000 + i}`,
      amount,
      loan_type:         types[Math.floor(Math.random() * types.length)],
      purpose:           purposes[Math.floor(Math.random() * purposes.length)],
      duration_months:   duration,
      interest_rate:     parseFloat(rate.toFixed(2)),
      monthly_payment:   monthly,
      remaining_balance: Math.max(0, amount - monthly * paid),
      payments_made:     paid,
      next_payment_date: nextPayment.toISOString(),
      last_payment_date: paid > 0 ? new Date(Date.now() - 30 * 86400000).toISOString() : undefined,
      late_days:         lateDays,
      is_late:           isLate,
      created_at:        new Date(disbursed.getTime() - 5 * 86400000).toISOString(),
      disbursed_at:      disbursed.toISOString(),
      processed_by:      employes[Math.floor(Math.random() * employes.length)],
      validated_by:      supers[Math.floor(Math.random() * supers.length)],
      caisse_numero:     caisse.numero,
      caisse_id:         caisse.id,
      session_id:        `SES-${1000 + i}`,
    });
  }

  return data.sort((a, b) => b.remaining_balance - a.remaining_balance);
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: accent + '22' }}>
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

// ─── Groupes retard ───────────────────────────────────────────────────────────
const GROUPS = [
  { key: 'critical', label: 'Retard critique  (30+ jours)', test: (l: ActiveLoanData) => l.late_days >= 30,                              accent: '#EF4444', bg: 'bg-red-50',    border: 'border-red-100'    },
  { key: 'late',     label: 'En retard (1–29 jours)',       test: (l: ActiveLoanData) => l.is_late && l.late_days < 30,                  accent: '#F59E0B', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { key: 'ok',       label: 'À jour',                       test: (l: ActiveLoanData) => !l.is_late,                                     accent: C.green,   bg: 'bg-[#F9F9F6]', border: 'border-gray-100'   },
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ActiveLoansTable() {
  const [search,   setSearch]   = useState('');
  const [typeF,    setTypeF]    = useState('all');
  const [statusF,  setStatusF]  = useState('all');   // all | ok | late | critical
  const [minAmt,   setMinAmt]   = useState('');
  const [maxAmt,   setMaxAmt]   = useState('');
  const [periodF,  setPeriodF]  = useState<'all' | 'week' | 'month'>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sortField,setSortField]= useState<'balance' | 'late' | 'progress'>('balance');
  const [sortAsc,  setSortAsc]  = useState(false);
  const [detailTx, setDetailTx] = useState<TransactionDetail | null>(null);

  const loans = useMemo(() => generateActiveLoans(), []);

  const filtered = useMemo(() => {
    let r = loans.filter(l => {
      const q = search.toLowerCase();
      const matchSearch  = q === '' || l.member_name.toLowerCase().includes(q) || l.member_id.toLowerCase().includes(q) || String(l.id).includes(q);
      const matchType    = typeF === 'all' || l.loan_type === typeF;
      const matchMin     = !minAmt || l.amount >= parseFloat(minAmt);
      const matchMax     = !maxAmt || l.amount <= parseFloat(maxAmt);
      const matchStatus  = statusF === 'all'
        || (statusF === 'ok'       && !l.is_late)
        || (statusF === 'late'     && l.is_late && l.late_days < 30)
        || (statusF === 'critical' && l.late_days >= 30);
      const matchPeriod  = periodF === 'all'
        || (periodF === 'week'  && Math.abs(daysUntil(l.next_payment_date)) <= 7)
        || (periodF === 'month' && Math.abs(daysUntil(l.next_payment_date)) <= 30);
      return matchSearch && matchType && matchMin && matchMax && matchStatus && matchPeriod;
    });

    return [...r].sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === 'late')     return (a.late_days - b.late_days) * dir;
      if (sortField === 'progress') return ((a.payments_made / a.duration_months) - (b.payments_made / b.duration_months)) * dir;
      return (a.remaining_balance - b.remaining_balance) * dir;
    });
  }, [loans, search, typeF, minAmt, maxAmt, statusF, periodF, sortField, sortAsc]);

  const grouped = useMemo(() => {
    return GROUPS.map(g => ({ ...g, items: filtered.filter(g.test) }));
  }, [filtered]);

  const handleView = (l: ActiveLoanData) => {
    setDetailTx({
      id:             l.id,
      kind:           'loan',
      status:         'decaisse',
      montant:        l.amount,
      created_at:     l.disbursed_at,
      member_name:    l.member_name,
      member_id:      l.member_id,
      account_number: l.account_number,
      description:    `${TYPE_LABELS[l.loan_type]} — ${l.purpose}`,
      processed_by:   l.processed_by,
      validated_by:   l.validated_by,
      caisse_numero:  l.caisse_numero,
      caisse_id:      l.caisse_id,
      session_id:     l.session_id,
    });
  };

  const handleSort = (f: typeof sortField) => {
    if (sortField === f) setSortAsc(a => !a); else { setSortField(f); setSortAsc(false); }
  };

  const handleSelectAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(l => l.id)));
  };

  // ── KPIs ──
  const totalOutstanding    = loans.reduce((s, l) => s + l.remaining_balance, 0);
  const totalPrincipal      = loans.reduce((s, l) => s + l.amount, 0);
  const totalRepaid         = totalPrincipal - totalOutstanding;
  const lateLoans           = loans.filter(l => l.is_late);
  const criticalLoans       = loans.filter(l => l.late_days >= 30);
  const onTimeRate          = loans.length > 0 ? ((loans.length - lateLoans.length) / loans.length * 100) : 0;
  const totalMonthlyExpected = loans.reduce((s, l) => s + l.monthly_payment, 0);

  // ── Graphiques ──
  const lateDistrib = [
    { name: 'À jour',          value: loans.filter(l => !l.is_late).length,                               color: C.green   },
    { name: 'En retard (1–29j)',value: loans.filter(l => l.is_late && l.late_days < 30).length,            color: C.gold    },
    { name: 'Critique (30+j)', value: criticalLoans.length,                                               color: '#EF4444' },
  ];

  const progressDistrib = [
    { range: '0–25%',   count: 0, color: '#EF4444' },
    { range: '26–50%',  count: 0, color: C.gold    },
    { range: '51–75%',  count: 0, color: C.blue    },
    { range: '76–100%', count: 0, color: C.green   },
  ];
  loans.forEach(l => {
    const pct = (l.payments_made / l.duration_months) * 100;
    if (pct <= 25) progressDistrib[0].count++;
    else if (pct <= 50) progressDistrib[1].count++;
    else if (pct <= 75) progressDistrib[2].count++;
    else progressDistrib[3].count++;
  });

  const SortIcon = ({ f }: { f: typeof sortField }) =>
    sortField === f ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  return (
    <div className="flex flex-col gap-6">

      {/* Filtre période */}
      <div className="flex gap-2">
        {(['all', 'week', 'month'] as const).map(p => (
          <button key={p} onClick={() => setPeriodF(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              periodF === p
                ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-[#F9F9F6]'
            }`}>
            {p === 'all' ? 'Tous les prêts' : p === 'week' ? '7jrs' : '30jrs'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard icon={Landmark}      label="Prêts actifs"        value={loans.length}                     sub={`${lateLoans.length} en retard`}                  accent={C.green}   />
        <KPICard icon={Banknote}      label="Solde total restant" value={formatHTG(totalOutstanding)}                                                              accent={C.blue}    />
        <KPICard icon={CheckCircle2}  label="Montant remboursé"   value={formatHTG(totalRepaid)}           sub={`${((totalRepaid/totalPrincipal)*100).toFixed(1)}% du total`} accent={C.green} />
        <KPICard icon={Clock}         label="Attendu / mois"      value={formatHTG(totalMonthlyExpected)}  sub="Paiements mensuels"                               accent={C.gold}    />
        <KPICard icon={TrendingUp}    label="Taux de ponctualité" value={`${onTimeRate.toFixed(1)}%`}      sub={`${loans.length - lateLoans.length} à jour`}      accent={C.green}   />
        <KPICard icon={AlertTriangle} label="Critiques"           value={criticalLoans.length}             sub="30+ jours de retard"                              accent="#EF4444"   />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Statut paiements */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Statut des paiements</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={lateDistrib} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {lateDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-3">
              {lateDistrib.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progression remboursements */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Progression des remboursements</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={progressDistrib} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={11} />
              <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [v ?? 0, 'Prêts']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Prêts">
                {progressDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Membre, ID…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]">
            <option value="all">Tous les statuts</option>
            <option value="ok">À jour</option>
            <option value="late">En retard</option>
            <option value="critical">Critique (30+j)</option>
          </select>
          <select value={typeF} onChange={e => setTypeF(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]">
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="number" placeholder="Montant min" value={minAmt} onChange={e => setMinAmt(e.target.value)}
            className="w-32 px-3 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          <input type="number" placeholder="Montant max" value={maxAmt} onChange={e => setMaxAmt(e.target.value)}
            className="w-32 px-3 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          <span className="ml-auto self-center text-xs text-gray-400 shrink-0">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Header colonnes */}
        <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 px-5 py-3">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="col-span-1">
              <input type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30 cursor-pointer" />
            </div>
            <div className="col-span-2">Membre</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Montant initial</div>
            <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              onClick={() => handleSort('balance')}>
              Solde restant <SortIcon f="balance" />
            </div>
            <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              onClick={() => handleSort('progress')}>
              Progression <SortIcon f="progress" />
            </div>
            <div className="col-span-1 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              onClick={() => handleSort('late')}>
              Prochain pmt <SortIcon f="late" />
            </div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Badge sélection */}
        {selected.size > 0 && (
          <div className="bg-[#DDEAD5]/50 border-b border-[#DDEAD5] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#1B5E20]">
                {selected.size} prêt{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
              <button onClick={() => setSelected(new Set())}
                className="text-xs text-[#2E7D32] hover:text-[#1B5E20] font-medium underline">
                Désélectionner
              </button>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Envoyer rappel
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Exporter
              </button>
            </div>
          </div>
        )}

        {/* Corps groupé */}
        <div>
          {grouped.map(group => group.items.length === 0 ? null : (
            <div key={group.key}>
              {/* Séparateur de groupe */}
              <div className={`px-5 py-2 flex items-center gap-2 border-t ${group.bg} ${group.border}`}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.accent }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: group.accent }}>
                  {group.label}
                </p>
                <span className="text-xs text-gray-400 font-normal">({group.items.length})</span>
              </div>

              {/* Lignes */}
              {group.items.map((loan, idx) => {
                const isSelected = selected.has(loan.id);
                const progress   = Math.round((loan.payments_made / loan.duration_months) * 100);
                const daysLeft   = daysUntil(loan.next_payment_date);
                const isCritical = loan.late_days >= 30;
                const isLate     = loan.is_late;

                return (
                  <div  key={loan.id}
                    className={`grid grid-cols-12 gap-3 items-center px-5 py-4 transition-all group/row border-b border-gray-50 last:border-0 ${
                      isSelected
                        ? 'bg-[#DDEAD5]/30 border-l-4 border-[#2E7D32]'
                        : isCritical ? 'bg-red-50/30 hover:bg-red-50/50'
                        : isLate     ? 'bg-yellow-50/30 hover:bg-yellow-50/50'
                        : idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F6]' : 'bg-[#F9F9F6]/40 hover:bg-[#F9F9F6]'
                    }`} >

                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input type="checkbox" checked={isSelected}
                        onChange={() => setSelected(s => { const n = new Set(s); n.has(loan.id) ? n.delete(loan.id) : n.add(loan.id); return n; })}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30 cursor-pointer" />
                    </div>

                    {/* Membre */}
                    <div className="col-span-2 flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 group-hover/row:scale-105 transition-transform">
                        <Users className="w-4 h-4 text-[#2E7D32]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{loan.member_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{loan.member_id}</p>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="col-span-1">
                      <p className="text-xs font-medium text-gray-700">{TYPE_LABELS[loan.loan_type]}</p>
                      <p className="text-xs text-gray-400">{loan.duration_months} mois</p>
                    </div>

                    {/* Montant initial */}
                    <div className="col-span-2">
                      <p className="text-sm font-bold text-gray-800">{formatHTG(loan.amount)}</p>
                      <p className="text-xs text-gray-400">{loan.interest_rate}% / an · {formatHTG(Math.round(loan.monthly_payment))}/mois</p>
                    </div>

                    {/* Solde restant */}
                    <div className="col-span-2">
                      <p className={`text-sm font-bold ${isCritical ? 'text-red-600' : isLate ? 'text-yellow-600' : 'text-[#355C7D]'}`}>
                        {formatHTG(Math.max(0, loan.remaining_balance))}
                      </p>
                      {isLate && (
                        <p className="text-xs font-semibold text-red-500">{loan.late_days}j de retard</p>
                      )}
                    </div>

                    {/* Progression */}
                    <div className="col-span-2">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-gray-500">{loan.payments_made}/{loan.duration_months} paiements</span>
                        <span className="text-xs font-bold text-gray-700">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: progress >= 75 ? C.green : progress >= 50 ? C.blue : progress >= 25 ? C.gold : '#EF4444',
                          }} />
                      </div>
                    </div>

                    {/* Prochain paiement */}
                    <div className="col-span-1">
                      {isLate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700">
                          <XCircle className="w-3 h-3 shrink-0" />
                          -{loan.late_days}j
                        </span>
                      ) : daysLeft <= 7 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-50 text-yellow-700">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {daysLeft}j
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          {daysLeft}j
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(loan.next_payment_date)}</p>
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
              <Landmark className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Aucun prêt actif trouvé</p>
            <p className="text-xs text-gray-400">Modifiez les filtres pour voir plus de résultats</p>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{filtered.length}</span> prêt{filtered.length !== 1 ? 's' : ''} actif{filtered.length !== 1 ? 's' : ''}
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              {loans.length - lateLoans.length} à jour · {lateLoans.length} en retard
            </span>
          </div>
        )}
      </div>

      {/* Modal traçabilité */}
      <TransactionDetailModal
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
      />
    </div>
  );
}