'use client';

import { MemberFinancialData } from '@/types/analyses';
import {
  X, TrendingUp, TrendingDown, CheckCircle2, Banknote,
  AlertCircle, BarChart3, PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

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

function formatHTG(n: number) {
  return Math.round(n).toLocaleString('fr-HT') + ' HTG';
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  member:  MemberFinancialData;
  onClose: () => void;
}

export default function MemberDetailModal({ member, onClose }: Props) {

  // ── Données graphiques ──
  const evolutionData = member.historique.map(h => ({
    mois:     h.mois,
    revenu:   Math.round(h.revenu),
    depenses: Math.round(h.depenses),
    solde:    Math.round(h.revenu - h.depenses),
  }));

  const repartitionData = [
    { name: 'Dépenses', value: Math.round(member.depensesMensuellesMoyennes), color: '#EF4444' },
    { name: 'Capacité', value: Math.round(member.capaciteRemboursement),      color: C.green   },
  ];

  const indicateursData = [
    { label: 'Stabilité',    value: member.scoreStabilite,          max: 100, color: C.green },
    { label: 'Taux remb.',   value: member.tauxRemboursement,       max: 100, color: C.blue  },
    { label: 'Endettement',  value: member.ratioEndettement * 100,  max: 50,  color: C.gold  },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8 mx-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold shrink-0">
                {member.prenom[0]}{member.nom[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{member.prenom} {member.nom}</h2>
                <p className="text-white/70 font-mono text-sm">{member.id}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2.5 py-1 bg-white/15 rounded-lg text-xs font-semibold">
                    Membre depuis {Math.floor(member.anciennete / 12)} an{Math.floor(member.anciennete / 12) > 1 ? 's' : ''}
                  </span>
                  {member.estSaisonnier && (
                    <span className="px-2.5 py-1 bg-white/15 rounded-lg text-xs font-semibold">
                      Revenus saisonniers
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Contenu ──────────────────────────────────────────────────────── */}
        <div className="p-6 space-y-6">

          {/* Vue d'ensemble — 4 KPI */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Vue d'ensemble financière</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Revenu */}
              <div className="bg-[#EBF2F8]/50 rounded-2xl border border-[#D4E3EF] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#355C7D]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#355C7D]">Revenu moyen</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatHTG(member.revenuMensuelMoyen)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {member.estSaisonnier ? 'Moy. 12 mois (saisonnier)' : 'Moyenne 6 mois'}
                </p>
              </div>

              {/* Dépenses */}
              <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Dépenses</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatHTG(member.depensesMensuellesMoyennes)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((member.depensesMensuellesMoyennes / member.revenuMensuelMoyen) * 100).toFixed(1)}% du revenu
                </p>
              </div>

              {/* Capacité */}
              <div className="bg-[#DDEAD5]/40 rounded-2xl border border-[#DDEAD5] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#1B5E20]">Capacité remb.</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatHTG(member.capaciteRemboursement)}</p>
                <p className="text-xs text-gray-500 mt-1">Disponible / mois</p>
              </div>

              {/* Score stabilité */}
              <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PieChartIcon className="w-4 h-4 text-[#355C7D]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Stabilité</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{Math.round(member.scoreStabilite)}/100</p>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full"
                      style={{ backgroundColor: i < Math.round(member.scoreStabilite / 20) ? C.green : '#E5E7EB' }} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Graphiques */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Évolution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Évolution revenus & dépenses</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
                  <XAxis dataKey="mois" fontSize={11} stroke="#9CA3AF" />
                  <YAxis fontSize={11} stroke="#9CA3AF" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [formatHTG(v ?? 0), '']} />
                  <Legend />
                  <Line type="monotone" dataKey="revenu"   stroke={C.blue}  strokeWidth={2} name="Revenus"  />
                  <Line type="monotone" dataKey="depenses" stroke="#EF4444" strokeWidth={2} name="Dépenses" />
                  <Line type="monotone" dataKey="solde"    stroke={C.green} strokeWidth={2} name="Solde" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition budget */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Répartition budget mensuel</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={240}>
                  <PieChart>
                    <Pie data={repartitionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {repartitionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [formatHTG(v ?? 0), '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {repartitionData.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatHTG(item.value)}</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-4">
                        {((item.value / member.revenuMensuelMoyen) * 100).toFixed(1)}% du revenu
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Indicateurs de performance */}
          <section className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-[#2E7D32]" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Indicateurs de performance</p>
            </div>
            <div className="space-y-4">
              {indicateursData.map((ind, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-700">{ind.label}</span>
                    <span className="text-sm font-bold text-gray-900">{Math.round(ind.value)}/{ind.max}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (ind.value / ind.max) * 100)}%`, backgroundColor: ind.color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Prêt actuel */}
          {member.dernierPret && (
            <section className="bg-[#DDEAD5]/30 rounded-2xl border border-[#DDEAD5] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-4 h-4 text-[#2E7D32]" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#1B5E20]">Prêt actuel</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Montant',           value: formatHTG(member.dernierPret.montant)    },
                  { label: 'Mensualité',        value: formatHTG(member.dernierPret.mensualite) },
                  { label: "Ratio d'endettement", value: `${(member.ratioEndettement * 100).toFixed(1)}%` },
                ].map(col => (
                  <div key={col.label}>
                    <p className="text-xs text-gray-500 mb-1">{col.label}</p>
                    <p className="text-lg font-bold text-gray-900">{col.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#DDEAD5]">
                <p className="text-xs text-gray-600">
                  Ce prêt représente{' '}
                  <span className="font-semibold text-gray-800">
                    {((member.dernierPret.mensualite / member.capaciteRemboursement) * 100).toFixed(1)}%
                  </span>{' '}
                  de la capacité de remboursement mensuelle du membre.
                </p>
              </div>
            </section>
          )}

          {/* Historique + Recommandation */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Historique crédit */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Historique de crédit</p>
              <div className="space-y-3">
                {[
                  { label: 'Ancienneté',          value: `${Math.floor(member.anciennete / 12)} an${Math.floor(member.anciennete / 12) > 1 ? 's' : ''} ${member.anciennete % 12} mois` },
                  { label: 'Nombre de prêts',     value: String(member.nombrePrets) },
                  { label: 'Taux de remboursement', value: `${member.tauxRemboursement.toFixed(1)}%`, green: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.green ? 'text-[#2E7D32]' : 'text-gray-900'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommandation */}
            <div className="bg-[#DDEAD5]/30 rounded-2xl border border-[#DDEAD5] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] mb-4">Recommandation</p>
              <div className="space-y-3">
                {member.scoreStabilite >= 70 && member.tauxRemboursement >= 90 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700">Profil très stable — excellent candidat pour un prêt</p>
                  </div>
                )}
                {member.estSaisonnier && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700">Revenus saisonniers — utiliser la moyenne sur 12 mois</p>
                  </div>
                )}
                {member.ratioEndettement > 0.35 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700">Taux d'endettement élevé — prudence recommandée</p>
                  </div>
                )}
                {!member.dernierPret && member.scoreStabilite < 70 && !member.estSaisonnier && member.ratioEndettement <= 0.35 && (
                  <p className="text-sm text-gray-500 italic">Aucune recommandation particulière</p>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}