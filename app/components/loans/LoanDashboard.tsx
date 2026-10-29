'use client';

/**
 * LoanDashboard.tsx — vue d'ensemble du portefeuille de prêts
 * ─────────────────────────────────────────────────────────────────
 * Données : GET /loans/ (fetchLoans). Aucun mock.
 * Tous les montants par prêt (total dû, échéance, payé, solde, retard)
 * viennent de Django ; ici on ne fait que les additionner pour les KPI.
 *
 * Lecture seule : la colonne Actions n'ouvre que la fiche. Approuver,
 * rejeter, décaisser se font depuis la liste complète (loanList),
 * selon les permissions de useLoanPermissions.
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie,
} from 'recharts';
import {
  Landmark, Plus, X, ArrowRight, Users, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, XCircle, Banknote,
  Eye, Loader2, RefreshCw,
} from 'lucide-react';
import LoanForm from './LoanFormFields';
import LoanDetailModal from './modals/LoanDetailModal';
import PageHeader from '../header';
import type { MemberOption } from '../members/validations';
import {
  LoanData, LoanStatus, LoanType, LOAN_TYPE_LABELS, LOAN_STATUS_LABELS,
} from '../transactions/validation/loanSchema';
import { fetchLoans } from '@/app/lib/api/loans';
import { useLoanPermissions } from '@/app/lib/useloanpermissions';

// ─── Palette CAPOSA ───────────────────────────────────────────────

const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
  red:       '#EF4444',
};

const tooltipStyle = {
  backgroundColor: 'white',
  border: `1px solid ${C.greenPale}`,
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

// ─── Statuts Django ───────────────────────────────────────────────

const STATUS_CFG: Record<LoanStatus, { bg: string; text: string; dot: string }> = {
  pending:  { bg: '#FEF9EC',   text: '#B45309',   dot: '#F59E0B' },
  approved: { bg: '#EBF2F8',   text: C.blue,      dot: C.blue    },
  active:   { bg: C.greenPale, text: C.greenDark, dot: C.green   },
  paid:     { bg: '#F0FDF4',   text: '#166534',   dot: '#22C55E' },
  rejected: { bg: '#FEF2F2',   text: '#B91C1C',   dot: C.red     },
};

const TYPE_COLORS: Record<LoanType, string> = {
  commerce: C.green, logement: C.blue, agriculture: '#81C784', elevage: C.gold,
  equipement: '#A5C8A5', scolaire: '#7BAFD4', personnel: '#C8A97B',
};

// ─── Helpers ──────────────────────────────────────────────────────

const DAY = 86_400_000;

const formatHTG = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

/** Dates Django "YYYY-MM-DD" lues à midi local pour éviter le décalage d'un jour. */
const toDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);

const formatDate = (iso: string | null | undefined) =>
  iso ? toDate(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const daysUntil = (iso: string) => Math.ceil((toDate(iso).getTime() - Date.now()) / DAY);

const sum = (loans: LoanData[], pick: (l: LoanData) => number | null | undefined) =>
  loans.reduce((s, l) => s + (pick(l) ?? 0), 0);

/** Part déjà remboursée, d'après les montants Django. */
const progressOf = (l: LoanData) =>
  l.total_due ? Math.min(100, Math.round(((l.amount_paid ?? 0) / l.total_due) * 100)) : 0;

// ─── Carte KPI ────────────────────────────────────────────────────

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

// ─── Composant principal ──────────────────────────────────────────

interface LoanDashboardProps {
  /** Membres pour le formulaire « Nouveau prêt » (même source que la page liste). */
  members: MemberOption[];
}

export default function LoanDashboard({ members }: LoanDashboardProps) {
  const { canCreate } = useLoanPermissions();

  const [loans,     setLoans]     = useState<LoanData[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [tab,       setTab]       = useState<'tous' | 'actifs'>('tous');
  const [period,    setPeriod]    = useState<'day' | 'week' | 'month'>('month');
  const [modalOpen, setModalOpen] = useState(false);
  const [detail,    setDetail]    = useState<LoanData | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLoans();
      setLoans([...data].sort((a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les prêts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Sous-ensembles ──
  const activeOnly = useMemo(() => loans.filter(l => l.status === 'active'), [loans]);
  const late       = useMemo(() => activeOnly.filter(l => l.is_late), [activeOnly]);
  const critical   = useMemo(() => activeOnly.filter(l => (l.late_days ?? 0) >= 30), [activeOnly]);

  const periodLoans = useMemo(() => {
    const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const from = Date.now() - days * DAY;
    return loans.filter(l => toDate(l.created_at).getTime() >= from);
  }, [loans, period]);

  const recentDisplay = (tab === 'tous' ? periodLoans : activeOnly).slice(0, 5);

  // ── KPI (sommes des valeurs Django) ──
  const disbursed        = loans.filter(l => l.status === 'active' || l.status === 'paid');
  const totalDisbursed   = sum(disbursed, l => l.loan_amount);
  const totalOutstanding = sum(activeOnly, l => l.remaining_balance);
  const totalRepaid      = sum(activeOnly, l => l.amount_paid);
  const totalDue         = sum(activeOnly, l => l.total_due);
  const onTimeRate       = activeOnly.length ? ((activeOnly.length - late.length) / activeOnly.length) * 100 : 0;
  const decided          = loans.filter(l => l.status !== 'pending');
  const approvalRate     = decided.length ? (decided.filter(l => l.status !== 'rejected').length / decided.length) * 100 : 0;
  const pendingCount     = loans.filter(l => l.status === 'pending').length;
  const approvedCount    = loans.filter(l => l.status === 'approved').length;

  // Échéances à encaisser dans les 30 prochains jours (montant fixé par Django)
  const dueSoon = activeOnly.filter(l => l.next_due_date && daysUntil(l.next_due_date) <= 30);
  const dueSoonAmount = sum(dueSoon, l => l.installment_amount);

  // ── Graphiques ──
  const volumeData = useMemo(() => {
    const days: { label: string; date: string; count: number; amount: number }[] = [];
    for (let back = 0, found = 0; found < 7; back++) {
      const d = new Date(Date.now() - back * DAY);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      days.unshift({
        label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        date:  d.toLocaleDateString('sv-SE'),   // YYYY-MM-DD en heure locale
        count: 0, amount: 0,
      });
      found++;
    }
    loans.forEach(l => {
      const req = days.find(d => d.date === (l.request_date ?? l.created_at).slice(0, 10));
      if (req) req.count++;
      const dis = l.disbursement_date && days.find(d => d.date === l.disbursement_date);
      if (dis) dis.amount += l.loan_amount;
    });
    return days;
  }, [loans]);

  const typeDistrib = useMemo(() => {
    const src = tab === 'actifs' ? activeOnly : loans;
    return (Object.keys(TYPE_COLORS) as LoanType[]).map(t => ({
      name:  LOAN_TYPE_LABELS[t] ?? t,
      value: src.filter(l => l.loan_type === t).length,
      color: TYPE_COLORS[t],
    })).filter(d => d.value > 0);
  }, [loans, activeOnly, tab]);

  const statusDistrib = useMemo(() =>
    (Object.keys(STATUS_CFG) as LoanStatus[]).map(s => ({
      label: LOAN_STATUS_LABELS[s],
      count: loans.filter(l => l.status === s).length,
      color: STATUS_CFG[s].dot,
    })),
  [loans]);

  const progressDistrib = useMemo(() => {
    const d = [
      { range: '0–25 %',   count: 0, color: C.red   },
      { range: '26–50 %',  count: 0, color: C.gold  },
      { range: '51–75 %',  count: 0, color: C.blue  },
      { range: '76–100 %', count: 0, color: C.green },
    ];
    activeOnly.forEach(l => {
      const p = progressOf(l);
      d[p <= 25 ? 0 : p <= 50 ? 1 : p <= 75 ? 2 : 3].count++;
    });
    return d;
  }, [activeOnly]);

  const paymentStatus = [
    { name: 'À jour',            value: activeOnly.length - late.length,  color: C.green },
    { name: 'En retard (1–29 j)', value: late.length - critical.length,   color: C.gold  },
    { name: 'Critique (30+ j)',   value: critical.length,                 color: C.red   },
  ];

  // ── Ligne de l'aperçu (lecture seule) ──
  const LoanRow = ({ loan, idx }: { loan: LoanData; idx: number }) => {
    const sc         = STATUS_CFG[loan.status];
    const enCours    = loan.status === 'active';
    const isLate     = Boolean(loan.is_late);
    const isCritical = (loan.late_days ?? 0) >= 30;
    const progress   = progressOf(loan);

    return (
      <div className={`grid grid-cols-12 gap-3 items-center px-5 py-4 transition-all group border-b border-gray-50 last:border-0 ${
        isCritical ? 'bg-red-50/40 hover:bg-red-50/60'
        : isLate   ? 'bg-yellow-50/40 hover:bg-yellow-50/60'
        : idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F6]' : 'bg-[#F9F9F6]/40 hover:bg-[#F9F9F6]'
      }`}>

        <div className="col-span-3 flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate capitalize">{loan.member_name}</p>
            <p className="text-xs text-gray-400 font-mono">{loan.account_number}</p>
          </div>
        </div>

        <div className="col-span-1">
          <p className="text-xs font-medium text-gray-700">{LOAN_TYPE_LABELS[loan.loan_type] ?? loan.loan_type}</p>
          <p className="text-xs text-gray-400">{loan.loan_duration} mois</p>
        </div>

        <div className="col-span-2">
          <p className="text-sm font-bold text-gray-800">{formatHTG(loan.loan_amount)}</p>
          <p className="text-xs text-gray-400">{loan.interest_rate} % / an</p>
        </div>

        <div className="col-span-2">
          {enCours ? (
            <>
              <p className={`text-sm font-bold ${isCritical ? 'text-red-600' : isLate ? 'text-yellow-600' : 'text-[#355C7D]'}`}>
                {formatHTG(loan.remaining_balance)}
              </p>
              {isLate && <p className="text-xs text-red-500 font-medium">{loan.late_days} j de retard</p>}
            </>
          ) : loan.status === 'paid' ? (
            <p className="text-sm font-bold text-[#2E7D32]">Soldé</p>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>

        <div className="col-span-2">
          {enCours && (
            <>
              <div className="flex justify-end mb-1">
                <span className="text-xs font-semibold text-gray-700">{progress} %</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${progress}%`,
                  backgroundColor: progress >= 75 ? C.green : progress >= 50 ? C.blue : progress >= 25 ? C.gold : C.red,
                }} />
              </div>
            </>
          )}
          <div className={enCours ? 'mt-1.5' : ''}>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />{LOAN_STATUS_LABELS[loan.status]}
            </span>
          </div>
        </div>

        <div className="col-span-1">
          {tab === 'actifs' && loan.next_due_date ? (() => {
            const left = daysUntil(loan.next_due_date);
            const cls = isLate ? 'bg-red-50 text-red-700' : left <= 7 ? 'bg-yellow-50 text-yellow-700' : 'bg-[#DDEAD5] text-[#1B5E20]';
            const Icon = isLate ? XCircle : left <= 7 ? AlertTriangle : CheckCircle2;
            return (
              <div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${cls}`}>
                  <Icon className="w-3 h-3 shrink-0" />{isLate ? `-${loan.late_days} j` : `${left} j`}
                </span>
                <p className="text-xs text-gray-400 mt-1">{formatDate(loan.next_due_date)}</p>
              </div>
            );
          })() : (
            <div>
              <p className="text-xs font-semibold text-gray-700">{formatDate(loan.created_at)}</p>
              <p className="text-xs text-gray-400">{toDate(loan.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          )}
        </div>

        <div className="col-span-1 flex items-center justify-center">
          <button title="Voir la fiche" onClick={() => setDetail(loan)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ── Rendu ──
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Prêts" subtitle="Gestion et suivi du portefeuille" icon={<Landmark className="w-8 h-8 text-[#2E7D32]" />} />
        <div className="flex items-center gap-2 shrink-0">
          {tab === 'tous' && (
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
              {(['day', 'week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {p === 'day' ? 'Auj.' : p === 'week' ? '7 j' : '30 j'}
                </button>
              ))}
            </div>
          )}
          <button onClick={load} disabled={loading} title="Actualiser"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> Nouveau prêt
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
          <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</span>
          <button onClick={load} className="text-xs font-semibold underline">Réessayer</button>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm w-fit">
        {([{ key: 'tous', label: 'Tous les prêts', count: loans.length }, { key: 'actifs', label: 'Actifs (en cours)', count: activeOnly.length }] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading && loans.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement des prêts…
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {tab === 'tous' ? (
              <>
                <KPICard icon={Landmark}      label="Total prêts"      value={loans.length}                    sub={`${activeOnly.length} en cours`}         accent={C.green} />
                <KPICard icon={Banknote}      label="Total décaissé"   value={formatHTG(totalDisbursed)}       sub={`${disbursed.length} prêts`}             accent={C.blue}  />
                <KPICard icon={TrendingUp}    label="Solde restant"    value={formatHTG(totalOutstanding)}     sub="prêts en cours"                          accent={C.green} />
                <KPICard icon={CheckCircle2}  label="Taux approbation" value={`${approvalRate.toFixed(1)} %`}  sub={`${decided.length} demandes tranchées`}   accent={C.green} />
                <KPICard icon={Clock}         label="En attente"       value={pendingCount}                    sub={`${approvedCount} à décaisser`}          accent={C.gold}  />
                <KPICard icon={AlertTriangle} label="En retard"        value={late.length}                     sub={`${critical.length} critiques`}          accent={C.red}   />
              </>
            ) : (
              <>
                <KPICard icon={Landmark}      label="Prêts en cours"   value={activeOnly.length}               sub={`${late.length} en retard`}              accent={C.green} />
                <KPICard icon={Banknote}      label="Solde total"      value={formatHTG(totalOutstanding)}                                                   accent={C.blue}  />
                <KPICard icon={CheckCircle2}  label="Déjà remboursé"   value={formatHTG(totalRepaid)}          sub={`${totalDue ? ((totalRepaid / totalDue) * 100).toFixed(1) : '0'} % du dû`} accent={C.green} />
                <KPICard icon={Clock}         label="À encaisser 30 j" value={formatHTG(dueSoonAmount)}        sub={`${dueSoon.length} échéances`}           accent={C.gold}  />
                <KPICard icon={TrendingUp}    label="Ponctualité"      value={`${onTimeRate.toFixed(1)} %`}    sub={`${activeOnly.length - late.length} à jour`} accent={C.green} />
                <KPICard icon={AlertTriangle} label="Critiques"        value={critical.length}                 sub="30+ jours de retard"                     accent={C.red}   />
              </>
            )}
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tab === 'tous' ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Demandes — 7 derniers jours ouvrés</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={volumeData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
                    <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={v => [Number(v), 'Demandes']} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Demandes">
                      {volumeData.map((_, i) => <Cell key={i} fill={i === volumeData.length - 1 ? C.green : C.greenPale} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Situation des remboursements</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={paymentStatus} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                        {paymentStatus.map((p, i) => <Cell key={i} fill={p.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 flex flex-col gap-3">
                    {paymentStatus.map(item => (
                      <div key={item.name} className="flex items-center justify-between">
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

            {tab === 'tous' ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Montants décaissés — 7 jours ouvrés</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={volumeData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
                    <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={v => [formatHTG(Number(v)), 'Décaissé']} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} name="Décaissé">
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
                    <Tooltip contentStyle={tooltipStyle} formatter={v => [Number(v), 'Prêts']} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Prêts">
                      {progressDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Répartition par type</p>
              {typeDistrib.length === 0 ? (
                <p className="text-xs text-gray-400 py-16 text-center">Aucun prêt</p>
              ) : (
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
                    {typeDistrib.map(item => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {tab === 'tous' ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Statut des prêts</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusDistrib} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" stroke="#9CA3AF" fontSize={11} width={80} />
                    <Tooltip contentStyle={tooltipStyle} formatter={v => [Number(v), 'Prêts']} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Prêts">
                      {statusDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Top 5 — plus gros soldes restants</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[...activeOnly]
                      .sort((a, b) => (b.remaining_balance ?? 0) - (a.remaining_balance ?? 0))
                      .slice(0, 5)
                      .map(l => ({ name: l.member_name.split(' ')[0], amount: l.remaining_balance ?? 0 }))}
                    barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={v => [formatHTG(Number(v)), 'Solde']} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill={C.blue} name="Solde restant" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Aperçu — 5 plus récents */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">{tab === 'tous' ? 'Dernières demandes' : 'Prêts en cours — aperçu'}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {tab === 'tous' ? `${periodLoans.length} sur la période · ${loans.length} au total` : `${activeOnly.length} prêts en cours`}
                </p>
              </div>
              <a href="/dashboard/loans/loanList"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2E7D32] text-xs font-semibold text-[#2E7D32] hover:bg-[#DDEAD5]/40 transition-all">
                Voir tous les prêts <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 px-5 py-3">
              <div className="grid grid-cols-12 gap-3 items-center text-xs font-bold uppercase tracking-widest text-gray-500">
                <div className="col-span-3">Membre</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-2">Montant</div>
                <div className="col-span-2">Solde restant</div>
                <div className="col-span-2">Progression</div>
                <div className="col-span-1">{tab === 'actifs' ? 'Échéance' : 'Date'}</div>
                <div className="col-span-1 text-center">Fiche</div>
              </div>
            </div>

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

            <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Affichage des <span className="font-semibold text-gray-600">{recentDisplay.length}</span> plus récents
              </p>
              <a href="/dashboard/loans/loanList"
                className="flex items-center gap-1 text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] transition-colors">
                Voir les {tab === 'tous' ? loans.length : activeOnly.length} prêts <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </>
      )}

      {/* Nouveau prêt */}
      {modalOpen && canCreate && (
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
              <LoanForm members={members} onCancel={() => setModalOpen(false)} onCreated={() => load()} />
            </div>
          </div>
        </div>
      )}

      <LoanDetailModal loan={detail} onClose={() => setDetail(null)} />
    </div>
  );
}