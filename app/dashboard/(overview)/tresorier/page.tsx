'use client';
import { useState } from 'react';
import {
  Vault, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight,
  AlertTriangle, CheckCircle, Clock, ChevronRight,
  RefreshCw, Calendar, TrendingUp, TrendingDown,
  Package, Lock, Banknote, BarChart2, ShieldCheck,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Period = 'jour' | 'semaine' | 'mois';

interface Remise {
  id: string;
  caissier: string;
  initiales: string;
  montant: number;
  heure: string;
  statut: 'reçue' | 'en attente' | 'en retard';
}

interface MouvementCoffre {
  id: string;
  type: 'entrée' | 'sortie';
  montant: number;
  motif: string;
  heure: string;
  validéPar: string;
}

// ─── Mock data ──────────────────────────────────────────────────────────────────
const REMISES: Remise[] = [
  { id: 'r1', caissier: 'Jean Dupont',    initiales: 'JD', montant: 12500, heure: '10:45', statut: 'reçue' },
  { id: 'r2', caissier: 'Sophie Lavoie',  initiales: 'SL', montant: 18200, heure: '11:00', statut: 'reçue' },
  { id: 'r3', caissier: 'Marie Tremblay', initiales: 'MT', montant: 9800,  heure: '—',     statut: 'en retard' },
  { id: 'r4', caissier: 'Luc Gagnon',     initiales: 'LG', montant: 7400,  heure: '—',     statut: 'en attente' },
  { id: 'r5', caissier: 'Paul Martin',    initiales: 'PM', montant: 5100,  heure: '—',     statut: 'en attente' },
];

const MOUVEMENTS: MouvementCoffre[] = [
  { id: 'm1', type: 'entrée', montant: 12500, motif: 'Remise Caissier JD',   heure: '10:45', validéPar: 'Trésorier' },
  { id: 'm2', type: 'entrée', montant: 18200, motif: 'Remise Caissier SL',   heure: '11:00', validéPar: 'Trésorier' },
  { id: 'm3', type: 'sortie', montant: 30000, motif: 'Approvisionnement BNC',heure: '09:30', validéPar: 'Directeur' },
  { id: 'm4', type: 'entrée', montant: 50000, motif: 'Versement BRH',        heure: '08:00', validéPar: 'Directeur' },
];

const SEUILS = {
  coffreMin: 100000,
  coffreMax: 500000,
  caisseMin: 10000,
  reservesCible: 150000,
};

const PREVISIONS = [
  { label: 'Remises prévues auj.', montant: 53000, reçu: 30700 },
  { label: 'Décaissements prévus', montant: 25000, reçu: 5000  },
  { label: 'Réserves requises',    montant: 150000, reçu: 142050 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M HTG`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K HTG`;
  return `${v.toLocaleString('fr-FR')} HTG`;
}

function getDate() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, badge, action }: {
  icon: React.ElementType; title: string; badge?: number; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {badge !== undefined && badge > 0 && (
          <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Jauge de coffre ────────────────────────────────────────────────────────────
function CoffreGauge({ actuel, min, max }: { actuel: number; min: number; max: number }) {
  const pct = Math.min(100, Math.max(0, ((actuel - 0) / max) * 100));
  const minPct = (min / max) * 100;
  const isLow  = actuel < min;
  const isHigh = actuel > max * 0.9;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>0</span>
        <span className="text-red-400">Min {formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        {/* Min line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
          style={{ left: `${minPct}%` }}
        />
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all ${
            isLow ? 'bg-gradient-to-r from-red-400 to-red-600' :
            isHigh ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9B27C]' :
            'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className={`text-xs font-semibold ${isLow ? 'text-red-600' : 'text-[#1B5E20]'}`}>
          {isLow ? '⚠️ Sous le seuil minimum' : isHigh ? '⚠️ Proche du maximum' : '✅ Niveau optimal'}
        </span>
        <span className="text-xs text-gray-500">{Math.round(pct)}% du maximum</span>
      </div>
    </div>
  );
}

// ─── Barre de progression prévision ─────────────────────────────────────────────
function PrevisionBar({ label, montant, reçu }: { label: string; montant: number; reçu: number }) {
  const pct = Math.min(100, (reçu / montant) * 100);
  const isOk = pct >= 80;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-semibold ${isOk ? 'text-[#1B5E20]' : 'text-yellow-700'}`}>
          {formatCurrency(reçu)} / {formatCurrency(montant)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isOk ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20]' : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardTresorier() {
  const [period, setPeriod] = useState<Period>('jour');

  const montantCoffre = 142050;
  const remisesReçues  = REMISES.filter(r => r.statut === 'reçue');
  const remisesEnAttente = REMISES.filter(r => r.statut !== 'reçue');
  const totalReçu = remisesReçues.reduce((s, r) => s + r.montant, 0);
  const totalAttendu = REMISES.reduce((s, r) => s + r.montant, 0);

  const coffreCritique = montantCoffre < SEUILS.coffreMin;

  const PERIOD_LABELS: Record<Period, string> = {
    jour: "Aujourd'hui", semaine: '7 jours', mois: 'Ce mois',
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
            <Vault className="w-4 h-4" />
            <span className="text-sm font-medium">Gestion de liquidité</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Trésorier</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{getDate()}</p>
        </div>
        <div className="flex items-center gap-3">
          {coffreCritique && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-700">Coffre sous seuil</span>
            </div>
          )}
          <button className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Filtres période ── */}
      <div className="flex gap-2 mb-8">
        {(['jour', 'semaine', 'mois'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p
                ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Vault,    label: 'Montant coffre',
            value: formatCurrency(montantCoffre),
            sub: coffreCritique ? '⚠️ Sous le seuil minimum' : '✅ Niveau optimal',
            color: coffreCritique ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]',
            border: coffreCritique ? 'border-red-100' : 'border-yellow-100',
          },
          {
            icon: Package,  label: 'Remises reçues',
            value: `${remisesReçues.length} / ${REMISES.length}`,
            sub: formatCurrency(totalReçu),
            color: 'bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]',
            border: 'border-[#DDEAD5]',
          },
          {
            icon: Clock,    label: 'Remises en attente',
            value: remisesEnAttente.length.toString(),
            sub: `${formatCurrency(totalAttendu - totalReçu)} manquant`,
            color: remisesEnAttente.length > 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]',
            border: remisesEnAttente.length > 2 ? 'border-orange-100' : 'border-blue-100',
          },
          {
            icon: ShieldCheck, label: 'Réserves obligatoires',
            value: '94.7%',
            sub: `${formatCurrency(142050)} / ${formatCurrency(150000)}`,
            color: 'bg-gradient-to-br from-purple-500 to-purple-700',
            border: 'border-purple-100',
          },
        ].map(kpi => (
          <div key={kpi.label} className={`bg-white rounded-2xl p-5 shadow-sm border ${kpi.border} hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
              <kpi.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">{kpi.value}</p>
            <p className="text-sm text-gray-600 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── État du coffre (jauge) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9B27C] flex items-center justify-center">
              <Vault className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">État du coffre</h2>
              <p className="text-xs text-gray-400">Niveau de liquidité disponible</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(montantCoffre)}</p>
            <p className="text-xs text-gray-400">Solde actuel</p>
          </div>
        </div>
        <CoffreGauge actuel={montantCoffre} min={SEUILS.coffreMin} max={SEUILS.coffreMax} />

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Seuil minimum', value: formatCurrency(SEUILS.coffreMin), color: 'text-red-600' },
            { label: 'Réserves cible', value: formatCurrency(SEUILS.reservesCible), color: 'text-[#1B5E20]' },
            { label: 'Maximum sûr', value: formatCurrency(SEUILS.coffreMax), color: 'text-[#355C7D]' },
          ].map(s => (
            <div key={s.label} className="bg-[#F9F9F6] rounded-xl p-3 border border-gray-100">
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Remises + Mouvements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Remises du jour */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader
            icon={Package} title="Remises du jour"
            badge={remisesEnAttente.length}
            action={
              <span className="text-xs text-gray-500">
                {formatCurrency(totalReçu)} reçus / {formatCurrency(totalAttendu)} attendus
              </span>
            }
          />
          <div className="divide-y divide-gray-50">
            {REMISES.map(r => {
              const REMISE_CFG: Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle }> = {
                reçue:        { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', border: 'border-[#2E7D32]/20', icon: CheckCircle },
                'en attente': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200',   icon: Clock },
                'en retard':  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100',      icon: AlertTriangle },
              };
              const cfg = REMISE_CFG[r.statut] ?? REMISE_CFG['en attente'];
              const Icon = cfg.icon;
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#DDEAD5]/20 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {r.initiales}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{r.caissier}</p>
                    <p className="text-xs text-gray-400">{r.heure !== '—' ? `Reçue à ${r.heure}` : 'Non encore effectuée'}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(r.montant)}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <Icon className="w-3 h-3" />{r.statut}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mouvements du coffre */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader
            icon={ArrowLeftRight} title="Mouvements du coffre"
            action={
              <button className="flex items-center gap-1 text-xs text-[#2E7D32] font-medium hover:underline">
                Historique <ChevronRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="divide-y divide-gray-50">
            {MOUVEMENTS.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#DDEAD5]/20 transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.type === 'entrée' ? 'bg-[#DDEAD5]' : 'bg-red-50'
                }`}>
                  {m.type === 'entrée'
                    ? <ArrowDownCircle className="w-4 h-4 text-[#2E7D32]" />
                    : <ArrowUpCircle className="w-4 h-4 text-red-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.motif}</p>
                  <p className="text-xs text-gray-400">{m.heure} · validé par {m.validéPar}</p>
                </div>
                <p className={`text-sm font-bold shrink-0 ${m.type === 'entrée' ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                  {m.type === 'entrée' ? '+' : '-'}{formatCurrency(m.montant)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Prévisions de liquidité ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <SectionHeader icon={BarChart2} title="Prévisions de liquidité — aujourd'hui" />
        <div className="p-5 flex flex-col gap-5">
          {PREVISIONS.map(p => <PrevisionBar key={p.label} {...p} />)}
          <div className="flex items-center gap-3 mt-2 p-3 bg-[#DDEAD5] rounded-xl border border-[#2E7D32]/20">
            <CheckCircle className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <p className="text-sm text-[#1B5E20] font-medium">
              Liquidité projetée fin de journée : <strong>{formatCurrency(montantCoffre + (totalAttendu - totalReçu))}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── Alertes de liquidité ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <SectionHeader icon={AlertTriangle} title="Alertes de liquidité" badge={2} />
        <div className="divide-y divide-gray-50">
          {[
            { level: 'warning',  msg: '3 remises non reçues à cette heure',              detail: 'Marie Tremblay, Luc Gagnon, Paul Martin', time: 'Maintenant' },
            { level: 'critique', msg: 'Coffre sous le seuil optimal de 150 000 HTG',     detail: `Actuel : ${formatCurrency(montantCoffre)} — Manque : ${formatCurrency(SEUILS.reservesCible - montantCoffre)}`, time: '11:00' },
            { level: 'info',     msg: 'Versement BRH prévu cet après-midi à 14h30',      detail: 'Montant estimé : 80 000 HTG', time: 'Prévu' },
          ].map((a, i) => {
            const ALERT_CFG: Record<string, { bg: string; text: string; icon: typeof AlertTriangle }> = {
              critique: { bg: 'bg-red-50',    text: 'text-red-700',    icon: AlertTriangle },
              warning:  { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
              info:     { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: CheckCircle },
            };
            const cfg = ALERT_CFG[a.level] ?? ALERT_CFG['info'];
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.text}`} />
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${cfg.text}`}>{a.msg}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{a.time}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}