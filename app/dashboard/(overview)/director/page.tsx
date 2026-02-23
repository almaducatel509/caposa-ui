'use client';
import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, Users, AlertTriangle,
  CheckCircle, XCircle, Calendar, ChevronRight, RefreshCw,
  FileText, ShieldAlert, Globe, Briefcase, Activity,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Period = 'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee';

// ─── Mock data ──────────────────────────────────────────────────────────────────
const KPI_DATA = {
  jour:       { volume: 142050,  txCount: 44,  recouvrement: 94.2, endettement: 31.4, liquidite: 1.61, ecarts: 2,  membres: 412,  nouveauxMembres: 3  },
  semaine:    { volume: 891200,  txCount: 287, recouvrement: 95.8, endettement: 30.1, liquidite: 1.72, ecarts: 9,  membres: 412,  nouveauxMembres: 11 },
  mois:       { volume: 3842000, txCount: 1204,recouvrement: 96.5, endettement: 28.7, liquidite: 1.85, ecarts: 31, membres: 412,  nouveauxMembres: 38 },
  trimestre:  { volume: 11200000,txCount: 3650,recouvrement: 97.1, endettement: 27.9, liquidite: 1.92, ecarts: 87, membres: 412,  nouveauxMembres: 94 },
  annee:      { volume: 44800000,txCount: 14600,recouvrement:97.8, endettement: 26.2, liquidite: 2.01, ecarts: 312,membres: 412,  nouveauxMembres: 287},
};

const PREV_DATA = {
  jour:       { volume: 128400,  recouvrement: 93.1, endettement: 32.8, liquidite: 1.55 },
  semaine:    { volume: 810000,  recouvrement: 94.2, endettement: 31.4, liquidite: 1.61 },
  mois:       { volume: 3520000, recouvrement: 95.8, endettement: 30.1, liquidite: 1.72 },
  trimestre:  { volume: 10400000,recouvrement: 96.5, endettement: 28.7, liquidite: 1.85 },
  annee:      { volume: 41200000,recouvrement: 97.1, endettement: 27.9, liquidite: 1.92 },
};

const TREND_MONTHS = ['Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const VOLUME_TREND = [3120000, 3280000, 3450000, 3610000, 3720000, 3842000];
const RECOUVREMENT_TREND = [94.1, 95.0, 95.8, 96.1, 96.3, 96.5];

const RAPPORTS = [
  { id: 'r1', titre: 'Rapport mensuel — Décembre 2024', date: '31 déc. 2024', statut: 'approuvé',  type: 'mensuel' },
  { id: 'r2', titre: 'Rapport hebdomadaire S52',        date: '28 déc. 2024', statut: 'en attente', type: 'hebdo' },
  { id: 'r3', titre: 'Rapport de réconciliation',       date: '27 déc. 2024', statut: 'approuvé',  type: 'recon' },
  { id: 'r4', titre: 'Analyse de liquidité T4',         date: '24 déc. 2024', statut: 'approuvé',  type: 'liquidité' },
];

const ALERTES_STRATEGIQUES = [
  { id: 'as1', niveau: 'warning',  titre: 'Ratio créances douteuses en hausse', detail: '4.8% → dépasse le seuil de 4% recommandé', date: 'Aujourd\'hui' },
  { id: 'as2', niveau: 'info',     titre: 'Taux de recouvrement excellent',     detail: '96.5% — au-dessus de l\'objectif de 95%',  date: 'Ce mois' },
  { id: 'as3', niveau: 'critique', titre: 'Réserves obligatoires sous seuil',   detail: '8.2% — seuil minimum requis : 10%',         date: 'Cette semaine' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M HTG`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K HTG`;
  return `${v.toLocaleString('fr-FR')} HTG`;
}

function pct(v: number) { return `${v.toFixed(1)}%`; }

function delta(curr: number, prev: number) {
  const d = ((curr - prev) / prev) * 100;
  return { value: Math.abs(d).toFixed(1), up: d >= 0 };
}

function getDate() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Mini sparkline (CSS-only bars) ───────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} opacity-80`}
          style={{ height: `${((v - min) / range) * 100}%`, minHeight: 4 }}
        />
      ))}
    </div>
  );
}

// ─── KPI card with trend ───────────────────────────────────────────────────────
function KpiTrend({ icon: Icon, label, value, prev, format, invert, color, border, sparkValues, sparkColor }: {
  icon: React.ElementType; label: string; value: number; prev: number;
  format: (v: number) => string; invert?: boolean; color: string; border: string;
  sparkValues?: number[]; sparkColor?: string;
}) {
  const d = delta(value, prev);
  const isGood = invert ? !d.up : d.up;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${border} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${
          isGood ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-red-50 text-red-700'
        }`}>
          {d.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {d.value}%
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{format(value)}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sparkValues && sparkColor && (
        <div className="mt-3">
          <Sparkline values={sparkValues} color={sparkColor} />
        </div>
      )}
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatutBadge({ statut }: { statut: string }) {
  const cfg: Record<string, string> = {
    approuvé:    'bg-[#DDEAD5] text-[#1B5E20] border-[#2E7D32]/20',
    'en attente':'bg-yellow-50 text-yellow-700 border-yellow-200',
    rejeté:      'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${cfg[statut] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {statut}
    </span>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, action }: {
  icon: React.ElementType; title: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardDirecteur() {
  const [period, setPeriod] = useState<Period>('mois');

  const data = KPI_DATA[period];
  const prev = PREV_DATA[period];

  const statusCounts = useMemo(() => {
    const checks = [
      data.recouvrement >= 95,
      data.endettement < 35,
      data.liquidite >= 1.5,
      data.ecarts === 0,
    ];
    return {
      bon:      checks.filter(Boolean).length,
      alerte:   checks.filter(c => !c).length,
      critique: ALERTES_STRATEGIQUES.filter(a => a.niveau === 'critique').length,
      total:    checks.length,
    };
  }, [data]);

  const PERIODS: { id: Period; label: string }[] = [
    { id: 'jour',      label: "Aujourd'hui" },
    { id: 'semaine',   label: '7 jours' },
    { id: 'mois',      label: 'Ce mois' },
    { id: 'trimestre', label: 'Trimestre' },
    { id: 'annee',     label: 'Année' },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2E7D32] mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">Vue stratégique</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Directeur</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{getDate()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-600 font-medium">Décembre 2024</span>
          </div>
          <button className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Filtres de période ── */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p.id
                ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Status overview ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Activity,     label: 'KPIs suivis',       value: statusCounts.total.toString(),    bg: 'bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]', border: 'border-blue-100',   text: 'text-[#355C7D]' },
          { icon: CheckCircle,  label: 'Seuils respectés',  value: statusCounts.bon.toString(),      bg: 'bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]', border: 'border-[#DDEAD5]', text: 'text-[#1B5E20]' },
          { icon: AlertTriangle,label: 'En alerte',         value: statusCounts.alerte.toString(),   bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',border: 'border-yellow-100', text: 'text-yellow-700' },
          { icon: XCircle,      label: 'Critiques',         value: statusCounts.critique.toString(), bg: 'bg-gradient-to-br from-red-500 to-red-700',      border: 'border-red-100',    text: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl p-5 shadow-sm border ${s.border}`}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── KPIs avec tendance ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiTrend
          icon={BarChart2} label="Volume traité"
          value={data.volume} prev={prev.volume}
          format={formatCurrency}
          color="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]" border="border-[#DDEAD5]"
          sparkValues={VOLUME_TREND} sparkColor="bg-[#2E7D32]"
        />
        <KpiTrend
          icon={TrendingUp} label="Taux de recouvrement"
          value={data.recouvrement} prev={prev.recouvrement}
          format={pct}
          color="bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]" border="border-blue-100"
          sparkValues={RECOUVREMENT_TREND} sparkColor="bg-[#355C7D]"
        />
        <KpiTrend
          icon={ShieldAlert} label="Ratio d'endettement"
          value={data.endettement} prev={prev.endettement}
          format={pct} invert
          color="bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]" border="border-yellow-100"
        />
        <KpiTrend
          icon={Activity} label="Ratio de liquidité"
          value={data.liquidite} prev={prev.liquidite}
          format={(v) => v.toFixed(2)}
          color="bg-gradient-to-br from-purple-500 to-purple-700" border="border-purple-100"
        />
      </div>

      {/* ── Alertes stratégiques + Rapports ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Alertes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader icon={AlertTriangle} title="Alertes stratégiques"
            action={<span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">{ALERTES_STRATEGIQUES.length}</span>}
          />
          <div className="divide-y divide-gray-50">
            {ALERTES_STRATEGIQUES.map(a => {
              const ALERTE_CFG: Record<string, { bg: string; text: string; icon: typeof XCircle; border: string }> = {
                critique: { bg: 'bg-red-50',    text: 'text-red-700',    icon: XCircle,       border: 'border-red-100' },
                warning:  { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: AlertTriangle, border: 'border-yellow-100' },
                info:     { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: CheckCircle,   border: 'border-blue-100' },
              };
              const cfg = ALERTE_CFG[a.niveau] ?? ALERTE_CFG['info'];
              const Icon = cfg.icon;
              return (
                <div key={a.id} className="flex items-start gap-3 px-5 py-4">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.text}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${cfg.text}`}>{a.titre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{a.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rapports */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader icon={FileText} title="Rapports récents"
            action={
              <button className="flex items-center gap-1 text-xs text-[#2E7D32] font-medium hover:underline">
                Tout voir <ChevronRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="divide-y divide-gray-50">
            {RAPPORTS.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#DDEAD5]/20 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#355C7D] to-[#2A4A5E] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.titre}</p>
                  <p className="text-xs text-gray-400">{r.date}</p>
                </div>
                <StatutBadge statut={r.statut} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Performance synthèse ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <SectionHeader icon={Globe} title="Performance globale — synthèse" />
        <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Transactions',    value: data.txCount.toLocaleString('fr-FR'), sub: `sur la période (${period})`, color: 'text-[#2E7D32]' },
            { label: 'Membres actifs',  value: data.membres.toLocaleString('fr-FR'), sub: `+${data.nouveauxMembres} nouveaux`, color: 'text-[#355C7D]' },
            { label: 'Écarts signalés', value: data.ecarts.toString(),               sub: 'réconciliations requises', color: data.ecarts > 5 ? 'text-red-600' : 'text-[#2E7D32]' },
            { label: 'Score de perf.',  value: '87/100',                             sub: '↑ +3 vs période précédente', color: 'text-purple-700' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#F9F9F6] rounded-xl p-4 border border-gray-100">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-700 font-medium mt-0.5">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tendance volume 6 mois ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <SectionHeader icon={TrendingUp} title="Tendance volume — 6 derniers mois" />
        <div className="p-5">
          <div className="flex items-end gap-3 h-24">
            {VOLUME_TREND.map((v, i) => {
              const max = Math.max(...VOLUME_TREND);
              const pctH = (v / max) * 100;
              const isLast = i === VOLUME_TREND.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{formatCurrency(v)}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isLast ? 'bg-gradient-to-t from-[#1B5E20] to-[#2E7D32]' : 'bg-[#DDEAD5]'
                    }`}
                    style={{ height: `${pctH}%`, minHeight: 8 }}
                  />
                  <span className="text-xs text-gray-500">{TREND_MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}