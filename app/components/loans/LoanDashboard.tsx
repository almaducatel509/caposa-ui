'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie,
} from 'recharts';
import {
  Landmark, Plus, X, ArrowRight, Users, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, XCircle, Banknote,
  Eye, MoreHorizontal,
} from 'lucide-react';
import LoanForm from './LoanFormFields';
import TransactionDetailModal, { TransactionDetail } from '../transactions/DetailModal';
import PageHeader from '../header';

// ─── Types ────────────────────────────────────────────────────────────────────
type LoanStatus = 'en_attente' | 'approuve' | 'decaisse' | 'rembourse' | 'rejete' | 'annule';
type LoanType   = 'commerce' | 'logement' | 'agriculture' | 'elevage' | 'equipement' | 'scolaire' | 'personnel';

interface LoanData {
  id:               number;
  member_name:      string;
  member_id:        string;
  account_number:   string;
  amount:           number;
  status:           LoanStatus;
  loan_type:        LoanType;
  purpose:          string;
  duration_months:  number;
  interest_rate:    number;
  monthly_payment:  number;
  remaining_balance:number;
  payments_made:    number;
  late_days:        number;
  is_late:          boolean;
  next_payment_date:string;
  created_at:       string;
  disbursed_at?:    string;
  processed_by:     string;
  validated_by:     string;
  caisse_numero:    string;
  caisse_id:        string;
  session_id:       string;
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
  commerce:    'Commerce',    logement:   'Logement',
  agriculture: 'Agriculture', elevage:    'Élevage',
  equipement:  'Équipement',  scolaire:   'Scolaire',
  personnel:   'Personnel',
};

// ─── Groupes retard ───────────────────────────────────────────────────────────
const RETARD_GROUPS = [
  { key: 'critical', label: 'Retard critique (30+ jours)', test: (l: LoanData) => l.late_days >= 30,            accent: '#EF4444', bg: 'bg-red-50',    border: 'border-red-100'    },
  { key: 'late',     label: 'En retard (1–29 jours)',      test: (l: LoanData) => l.is_late && l.late_days < 30, accent: '#F59E0B', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { key: 'ok',       label: 'À jour',                      test: (l: LoanData) => !l.is_late,                    accent: C.green,   bg: 'bg-[#F9F9F6]', border: 'border-gray-100'   },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

// ─── Mock data ────────────────────────────────────────────────────────────────
function generateLoans(): LoanData[] {
  const statuses: LoanStatus[] = ['decaisse', 'decaisse', 'decaisse', 'rembourse', 'approuve', 'en_attente', 'rejete', 'annule'];
  const types:    LoanType[]   = ['commerce', 'logement', 'agriculture', 'elevage', 'equipement', 'scolaire', 'personnel'];
  const purposes  = ['Achat marchandises', 'Construction', 'Plantation', 'Bétail', 'Matériel', 'Scolarité', 'Urgence'];
  const members   = ['Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre', 'Claudette Moreau', 'Réginald Beaumont', 'Nadège Thermidor', 'Wilgens Désir'];
  const employes  = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supers    = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses   = [{ id: 'CAI001', numero: '01' }, { id: 'CAI002', numero: '02' }, { id: 'CAI003', numero: '03' }];
  const data: LoanData[] = [];

  for (let i = 0; i < 80; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    if (date.getDay() === 0 || date.getDay() === 6) { i--; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    const status  = statuses[Math.floor(Math.random() * statuses.length)];
    const amount  = Math.floor(Math.random() * 70000) + 5000;
    const dur     = [6, 12, 18, 24, 36, 48][Math.floor(Math.random() * 6)];
    const rate    = 2.5 + Math.random() * 5;
    const monthly = (amount * (1 + rate / 100)) / dur;
    const paid    = status === 'decaisse' ? Math.floor(Math.random() * dur) : status === 'rembourse' ? dur : 0;
    const isLate  = status === 'decaisse' && Math.random() > 0.7;
    const lateDays = isLate ? Math.floor(Math.random() * 45) + 1 : 0;
    const caisse  = caisses[Math.floor(Math.random() * caisses.length)];
    const nextPmt = new Date();
    nextPmt.setDate(nextPmt.getDate() + (isLate ? -lateDays : Math.floor(Math.random() * 28) + 1));

    data.push({
      id: i + 1, member_name: members[i % members.length], member_id: `MEM${1000 + i}`,
      account_number: `ACC${1000 + i}`, amount, status,
      loan_type: types[Math.floor(Math.random() * types.length)],
      purpose:   purposes[Math.floor(Math.random() * purposes.length)],
      duration_months: dur, interest_rate: parseFloat(rate.toFixed(2)), monthly_payment: monthly,
      remaining_balance: status === 'rembourse' ? 0 : Math.max(0, amount - monthly * paid),
      payments_made: paid, late_days: lateDays, is_late: isLate,
      next_payment_date: nextPmt.toISOString(), created_at: date.toISOString(),
      disbursed_at: ['decaisse', 'rembourse'].includes(status) ? new Date(date.getTime() + 5 * 86400000).toISOString() : undefined,
      processed_by:  employes[Math.floor(Math.random() * employes.length)],
      validated_by:  supers[Math.floor(Math.random() * supers.length)],
      caisse_numero: caisse.numero, caisse_id: caisse.id, session_id: `SES-${1000 + i}`,
    });
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
export default function LoanDashboard() {
  const [tab,       setTab]       = useState<'tous' | 'actifs'>('tous');
  const [period,    setPeriod]    = useState<'day' | 'week' | 'month'>('week');
  const [periodF,   setPeriodF]   = useState<'all' | 'week' | 'month'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailTx,  setDetailTx]  = useState<TransactionDetail | null>(null);
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('all');
  const [retardF,   setRetardF]   = useState('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'balance' | 'late'>('date');

  const allLoans   = useMemo(() => generateLoans(), []);
  const activeOnly = useMemo(() => allLoans.filter(l => l.status === 'decaisse'), [allLoans]);

  const periodLoans = useMemo(() => {
    if (period === 'day')  return allLoans.filter(l => new Date(l.created_at) >= new Date(Date.now() - 86400000));
    if (period === 'week') return allLoans.filter(l => new Date(l.created_at) >= new Date(Date.now() - 7 * 86400000));
    return allLoans;
  }, [allLoans, period]);

  // 5 derniers prêts pour l'aperçu
  const recentLoans = useMemo(() => periodLoans.slice(0, 5), [periodLoans]);
  const recentActifs = useMemo(() => activeOnly.slice(0, 5), [activeOnly]);

  const LOAN_STATUS_MAP: Record<LoanStatus, TransactionDetail['status']> = {
    en_attente: 'en_attente', approuve: 'en_cours',  decaisse: 'decaisse',
    rembourse:  'rembourse',  rejete:   'echoue',     annule:   'annule',
  };

  const handleView = (l: LoanData) => setDetailTx({
    id: l.id, kind: 'loan', status: LOAN_STATUS_MAP[l.status],
    montant: l.amount, created_at: l.disbursed_at ?? l.created_at,
    member_name: l.member_name, member_id: l.member_id, account_number: l.account_number,
    description: `${TYPE_LABELS[l.loan_type]} — ${l.purpose}`,
    processed_by: l.processed_by, validated_by: l.validated_by,
    caisse_numero: l.caisse_numero, caisse_id: l.caisse_id, session_id: l.session_id,
  });

  const recentDisplay = tab === 'tous' ? recentLoans : recentActifs;

  // ── KPIs ──
  const late     = activeOnly.filter(l => l.is_late);
  const critical = activeOnly.filter(l => l.late_days >= 30);
  const totalDisbursed    = allLoans.filter(l => ['decaisse','rembourse'].includes(l.status)).reduce((s, l) => s + l.amount, 0);
  const totalOutstanding  = activeOnly.reduce((s, l) => s + l.remaining_balance, 0);
  const totalPrincipal    = activeOnly.reduce((s, l) => s + l.amount, 0);
  const totalRepaid       = totalPrincipal - totalOutstanding;
  const onTimeRate        = activeOnly.length > 0 ? ((activeOnly.length - late.length) / activeOnly.length * 100) : 0;
  const approvalRate      = allLoans.length > 0 ? (allLoans.filter(l => ['approuve','decaisse','rembourse'].includes(l.status)).length / allLoans.length * 100) : 0;
  const monthlyExpected   = activeOnly.reduce((s, l) => s + l.monthly_payment, 0);

  // ── Graphiques ──
  const volumeData = useMemo(() => {
    const days: { label: string; date: string; count: number; amount: number }[] = [];
    let dBack = 0, found = 0;
    while (found < 7) {
      dBack++;
      const d = new Date(); d.setDate(d.getDate() - dBack);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      days.unshift({ label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), date: d.toISOString().split('T')[0], count: 0, amount: 0 });
      found++;
    }
    allLoans.forEach(l => { const idx = days.findIndex(d => d.date === l.created_at.split('T')[0]); if (idx >= 0) { days[idx].count++; days[idx].amount += l.amount; } });
    return days;
  }, [allLoans]);

  const typeDistrib = useMemo(() => {
    const map: Record<string, { count: number; color: string }> = {
      commerce: { count: 0, color: C.green }, logement: { count: 0, color: C.blue },
      agriculture: { count: 0, color: '#81C784' }, elevage: { count: 0, color: C.gold },
      equipement: { count: 0, color: '#A5C8A5' }, scolaire: { count: 0, color: '#7BAFD4' }, personnel: { count: 0, color: '#C8A97B' },
    };
    (tab === 'actifs' ? activeOnly : allLoans).forEach(l => { if (map[l.loan_type]) map[l.loan_type].count++; });
    return Object.entries(map).map(([k, v]) => ({ name: TYPE_LABELS[k as LoanType], value: v.count, color: v.color }));
  }, [allLoans, activeOnly, tab]);

  const statusDistrib = useMemo(() =>
    Object.entries(STATUS_CFG).map(([k, v]) => ({ label: v.label, count: allLoans.filter(l => l.status === k).length, color: v.dot })),
    [allLoans]
  );

  const progressDistrib = useMemo(() => {
    const d = [{ range: '0–25%', count: 0, color: '#EF4444' }, { range: '26–50%', count: 0, color: C.gold }, { range: '51–75%', count: 0, color: C.blue }, { range: '76–100%', count: 0, color: C.green }];
    activeOnly.forEach(l => { const p = (l.payments_made / l.duration_months) * 100; if (p <= 25) d[0].count++; else if (p <= 50) d[1].count++; else if (p <= 75) d[2].count++; else d[3].count++; });
    return d;
  }, [activeOnly]);

  // ── Ligne partagée ────────────────────────────────────────────────────────
  const LoanRow = ({ loan, idx }: { loan: LoanData; idx: number }) => {
    const sc = STATUS_CFG[loan.status];
    const isSelected = selected.has(loan.id);
    const progress   = Math.round((loan.payments_made / loan.duration_months) * 100);
    const isLate     = loan.is_late;
    const isCritical = loan.late_days >= 30;
    const daysLeft   = daysUntil(loan.next_payment_date);

    return (
      <div className={`grid grid-cols-12 gap-3 items-center px-5 py-4 transition-all group border-b border-gray-50 last:border-0 ${
        isSelected   ? 'bg-[#DDEAD5]/30 border-l-4 border-[#2E7D32]'
        : isCritical ? 'bg-red-50/40 hover:bg-red-50/60'
        : isLate     ? 'bg-yellow-50/40 hover:bg-yellow-50/60'
        : idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F6]' : 'bg-[#F9F9F6]/40 hover:bg-[#F9F9F6]'
      }`}>

        <div className="col-span-1">
          <input type="checkbox" checked={isSelected}
            onChange={() => setSelected(s => { const n = new Set(s); n.has(loan.id) ? n.delete(loan.id) : n.add(loan.id); return n; })}
            onClick={e => e.stopPropagation()}
            className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30 cursor-pointer" />
        </div>

        <div className="col-span-2 flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{loan.member_name}</p>
            <p className="text-xs text-gray-400 font-mono">{loan.member_id}</p>
          </div>
        </div>

        <div className="col-span-1">
          <p className="text-xs font-medium text-gray-700">{TYPE_LABELS[loan.loan_type]}</p>
          <p className="text-xs text-gray-400">{loan.duration_months} mois</p>
        </div>

        <div className="col-span-2">
          <p className="text-sm font-bold text-gray-800">{formatHTG(loan.amount)}</p>
          <p className="text-xs text-gray-400">{loan.interest_rate}% / an</p>
        </div>

        <div className="col-span-2">
          <p className={`text-sm font-bold ${
            loan.remaining_balance === 0 ? 'text-[#2E7D32]' : isCritical ? 'text-red-600' : isLate ? 'text-yellow-600' : 'text-[#355C7D]'
          }`}>{formatHTG(Math.max(0, loan.remaining_balance))}</p>
          {isLate && <p className="text-xs text-red-500 font-medium">{loan.late_days}j de retard</p>}
        </div>

        <div className="col-span-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">{loan.payments_made}/{loan.duration_months}</span>
            <span className="text-xs font-semibold text-gray-700">{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: progress >= 75 ? C.green : progress >= 50 ? C.blue : progress >= 25 ? C.gold : '#EF4444' }} />
          </div>
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />{sc.label}
            </span>
          </div>
        </div>

        {/* Colonne contextuelle : prochain paiement (actifs) ou date création (tous) */}
        <div className="col-span-1">
          {tab === 'actifs' ? (
            <>
              {isLate ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700"><XCircle className="w-3 h-3 shrink-0" />-{loan.late_days}j</span>
              ) : daysLeft <= 7 ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-50 text-yellow-700"><AlertTriangle className="w-3 h-3 shrink-0" />{daysLeft}j</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]"><CheckCircle2 className="w-3 h-3 shrink-0" />{daysLeft}j</span>
              )}
              <p className="text-xs text-gray-400 mt-1">{formatDate(loan.next_payment_date)}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-700">{formatDate(loan.created_at)}</p>
              <p className="text-xs text-gray-400">{new Date(loan.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </>
          )}
        </div>

        <div className="col-span-1 flex items-center justify-center gap-1.5">
          <button title="Voir" onClick={() => handleView(loan)} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button title="Plus" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Prêts" subtitle="Gestion et suivi du portefeuille" icon={<Landmark className="w-8 h-8 text-[#2E7D32]" />} />
        <div className="flex items-center gap-2 shrink-0">
          {tab === 'tous' ? (
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
              {(['day', 'week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {p === 'day' ? 'Auj.' : p === 'week' ? '7 j' : '30 j'}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
              {(['all', 'week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setPeriodF(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${periodF === p ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {p === 'all' ? 'Tous' : p === 'week' ? 'Cette sem.' : 'Ce mois'}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> Nouveau prêt
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm w-fit">
        {([{ key: 'tous', label: 'Tous les prêts', count: allLoans.length }, { key: 'actifs', label: 'Actifs (en cours)', count: activeOnly.length }] as const).map(t => (
          <button key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); setStatusF('all'); setRetardF('all'); setSortField('date'); setSelected(new Set()); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* KPIs adaptatifs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {tab === 'tous' ? (<>
          <KPICard icon={Landmark}      label="Total prêts"      value={allLoans.length}               sub={`${activeOnly.length} actifs`}                           accent={C.green}   />
          <KPICard icon={Banknote}      label="Total décaissé"   value={formatHTG(totalDisbursed)}                                                                    accent={C.blue}    />
          <KPICard icon={TrendingUp}    label="Solde restant"    value={formatHTG(totalOutstanding)}                                                                  accent={C.green}   />
          <KPICard icon={CheckCircle2}  label="Taux approbation" value={`${approvalRate.toFixed(1)}%`} sub={`${allLoans.filter(l=>l.status==='rembourse').length} remboursés`} accent={C.green} />
          <KPICard icon={Clock}         label="En attente"       value={allLoans.filter(l=>l.status==='en_attente').length} sub="à valider"                           accent={C.gold}    />
          <KPICard icon={AlertTriangle} label="En retard"        value={late.length}                   sub={`${critical.length} critiques`}                          accent="#EF4444"   />
        </>) : (<>
          <KPICard icon={Landmark}      label="Prêts actifs"     value={activeOnly.length}             sub={`${late.length} en retard`}                              accent={C.green}   />
          <KPICard icon={Banknote}      label="Solde total"      value={formatHTG(totalOutstanding)}                                                                  accent={C.blue}    />
          <KPICard icon={CheckCircle2}  label="Remboursé"        value={formatHTG(totalRepaid)}        sub={`${((totalRepaid/(totalPrincipal||1))*100).toFixed(1)}% du total`} accent={C.green} />
          <KPICard icon={Clock}         label="Attendu / mois"   value={formatHTG(monthlyExpected)}    sub="Paiements mensuels"                                      accent={C.gold}    />
          <KPICard icon={TrendingUp}    label="Ponctualité"      value={`${onTimeRate.toFixed(1)}%`}   sub={`${activeOnly.length - late.length} à jour`}             accent={C.green}   />
          <KPICard icon={AlertTriangle} label="Critiques"        value={critical.length}               sub="30+ jours de retard"                                     accent="#EF4444"   />
        </>)}
      </div>

      {/* Graphiques adaptatifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* G1 : volume (tous) | statut paiements (actifs) */}
        {tab === 'tous' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Volume — 7 derniers jours ouvrés</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volumeData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [v ?? 0, 'Prêts']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Prêts">
                  {volumeData.map((_, i) => <Cell key={i} fill={i === volumeData.length - 1 ? C.green : C.greenPale} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Statut des paiements</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'À jour',            value: activeOnly.length - late.length,   color: C.green   },
                    { name: 'En retard (1–29j)', value: late.length - critical.length,     color: C.gold    },
                    { name: 'Critique (30+j)',   value: critical.length,                   color: '#EF4444' },
                  ]} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                    {[C.green, C.gold, '#EF4444'].map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 flex flex-col gap-3">
                {[{ name: 'À jour', value: activeOnly.length - late.length, color: C.green }, { name: 'En retard (1–29j)', value: late.length - critical.length, color: C.gold }, { name: 'Critique (30+j)', value: critical.length, color: '#EF4444' }].map((item, i) => (
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
        )}

        {/* G2 : montants (tous) | progression (actifs) */}
        {tab === 'tous' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Montants décaissés</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volumeData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [formatHTG(v ?? 0), 'Montant']} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} name="Montant">
                  {volumeData.map((_, i) => <Cell key={i} fill={i === volumeData.length - 1 ? C.blue : '#D4E3EF'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Progression des remboursements</p>
            <ResponsiveContainer width="100%" height={220}>
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
        )}

        {/* G3 : répartition par type (partagé) */}
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
                  <span className="text-xs font-bold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* G4 : statuts (tous) | top soldes (actifs) */}
        {tab === 'tous' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Statut des prêts</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusDistrib} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="#9CA3AF" fontSize={11} width={80} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [v ?? 0, 'Prêts']} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Prêts">
                  {statusDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Top 5 — Plus gros soldes restants</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[...activeOnly].sort((a, b) => b.remaining_balance - a.remaining_balance).slice(0, 5).map(l => ({ name: l.member_name.split(' ')[0], amount: l.remaining_balance }))} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [formatHTG(v ?? 0), 'Solde']} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill={C.blue} name="Solde restant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Aperçu — 5 derniers prêts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-800">
              {tab === 'tous' ? 'Dernières demandes' : 'Prêts actifs — aperçu'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {tab === 'tous' ? `${allLoans.length} prêts au total` : `${activeOnly.length} prêts actifs`}
            </p>
          </div>
          <a href="/dashboard/loans/loanList"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2E7D32] text-xs font-semibold text-[#2E7D32] hover:bg-[#DDEAD5]/40 transition-all">
            Voir tous les prêts <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Header colonnes */}
        <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 px-5 py-3">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="col-span-2">Membre</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Montant</div>
            <div className="col-span-2">Solde restant</div>
            <div className="col-span-3">Progression</div>
            <div className="col-span-1">{tab === 'actifs' ? 'Prochain pmt' : 'Date'}</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* 5 lignes */}
        <div className="divide-y divide-gray-50">
          {recentDisplay.map((loan, idx) => <LoanRow key={loan.id} loan={loan} idx={idx} />)}
        </div>

        {recentDisplay.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
              <Landmark className="w-6 h-6 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Aucun prêt à afficher</p>
          </div>
        )}

        {/* Footer — lien vers page complète */}
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Affichage des <span className="font-semibold text-gray-600">{recentDisplay.length}</span> plus récents
          </p>
          <a href="/dashboard/loans/loanList"
            className="flex items-center gap-1 text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] transition-colors">
            Voir les {tab === 'tous' ? allLoans.length : activeOnly.length} prêts <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Modal nouveau prêt */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10">
          <div className="w-full max-w-2xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Nouvelle demande de prêt</p>
                  <p className="text-xs text-gray-400">Remplissez les informations du prêt</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[80vh]">
              <LoanForm onCancel={() => setModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <TransactionDetailModal transaction={detailTx} onClose={() => setDetailTx(null)} />
    </div>
  );
}