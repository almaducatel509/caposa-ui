// app/components/analyse/kpis/PerformanceSummaryCard.tsx
// Carte de synthèse "santé de la caisse" — langage simplifié pour directeurs non-techniciens
'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { KpiData } from '@/types/kpis';

interface Props { data: KpiData; }

const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Calcul du score de performance ──────────────────────────────────────────
// Score composite sur 100 pondéré par importance métier :
//   - Remboursement (40 pts) : indicateur principal de risque crédit
//   - Liquidité      (30 pts) : capacité à honorer les retraits
//   - Membres actifs (30 pts) : vitalité et croissance de la caisse
function calculerPerformance(d: KpiData) {
  const scoreRemboursement = (d.tauxRecouvrement / 100) * 40;
  const scoreLiquidite     = Math.min((d.ratioLiquidite / 2.0) * 30, 30); // plafond ratio 2.0
  const scoreCroissance    = ((d.scoreStabiliteMoyen / 100) * 15) + ((d.tauxActiviteMembres / 100) * 15);
  const total              = Math.round(scoreRemboursement + scoreLiquidite + scoreCroissance);

  const niveau: 'Faible' | 'Moyen' | 'Bon' = total >= 75 ? 'Bon' : total >= 50 ? 'Moyen' : 'Faible';
  const tendance = total >= 70 ? 'amélioration' : total >= 60 ? 'stable' : 'détérioration';

  const croissancePct = Math.round((d.scoreStabiliteMoyen + d.tauxActiviteMembres) / 2);

  const justification = {
    remboursement: {
      poids: 40,
      texte: d.tauxRecouvrement >= 95
        ? `${d.tauxRecouvrement.toFixed(1)}% des prêts sont remboursés à temps. Excellent.`
        : d.tauxRecouvrement >= 90
        ? `${d.tauxRecouvrement.toFixed(1)}% des prêts sont remboursés. Bien, mais on peut mieux faire.`
        : `Seulement ${d.tauxRecouvrement.toFixed(1)}% des prêts sont remboursés à temps. Risque élevé.`,
    },
    liquidite: {
      poids: 30,
      texte: d.ratioLiquidite >= 1.5
        ? 'La caisse a suffisamment d\'argent pour honorer tous les retraits. Très rassurant.'
        : d.ratioLiquidite >= 1.2
        ? 'La caisse a de l\'argent disponible, mais il faut rester vigilant.'
        : 'Attention : la caisse manque de liquidités pour les retraits urgents.',
    },
    croissance: {
      poids: 30,
      texte: croissancePct >= 80
        ? `${croissancePct}% des membres sont actifs et stables. La caisse grandit bien.`
        : croissancePct >= 70
        ? `${croissancePct}% des membres sont actifs. Croissance modérée.`
        : `${croissancePct}% des membres sont actifs. Beaucoup de membres sont inactifs.`,
    },
  };

  const alertes: string[] = [];
  if (d.tauxRecouvrement    < 95) alertes.push('Certains membres ne remboursent pas leurs prêts à temps.');
  if (d.ratioLiquidite      < 1.5) alertes.push('La caisse a peu d\'argent disponible pour les retraits urgents.');
  if (d.ratioCreancesDouteuses > 5) alertes.push('Trop de prêts risquent de ne jamais être remboursés.');
  if (d.tauxActiviteMembres < 85) alertes.push('Beaucoup de membres n\'utilisent plus la caisse.');

  return { total, niveau, tendance, justification, alertes: alertes.slice(0, 3) };
}

// ─── Composant ────────────────────────────────────────────────────────────────
export default function PerformanceSummaryCard({ data }: Props) {
  const perf = useMemo(() => calculerPerformance(data), [data]);

  const niveauPalette = {
    Bon:    { bg: C.greenPale,  border: '#DDEAD5', text: C.greenDark, bar: C.green,  dot: C.green  },
    Moyen:  { bg: '#FEF9EC',    border: '#FDE68A', text: '#92400E',   bar: C.gold,   dot: C.gold   },
    Faible: { bg: '#FEF2F2',    border: '#FCA5A5', text: '#B91C1C',   bar: '#EF4444',dot: '#EF4444'},
  }[perf.niveau];

  const TendanceIcon = perf.tendance === 'amélioration' ? TrendingUp
    : perf.tendance === 'détérioration' ? TrendingDown : Minus;
  const tendanceColor = perf.tendance === 'amélioration' ? C.green
    : perf.tendance === 'détérioration' ? '#EF4444' : '#6B7280';
  const tendanceLabel = perf.tendance === 'amélioration' ? 'En amélioration'
    : perf.tendance === 'détérioration' ? 'En dégradation' : 'Stable';
  const tendanceSub   = perf.tendance === 'amélioration' ? 'Continuez comme ça.'
    : perf.tendance === 'détérioration' ? 'Il faut agir rapidement.' : 'Maintenez les efforts.';

  return (
    <div className="rounded-2xl border-2 p-6 shadow-sm"
      style={{ backgroundColor: niveauPalette.bg, borderColor: niveauPalette.border }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: niveauPalette.bar + '22' }}>
            <TrendingUp className="w-5 h-5" style={{ color: niveauPalette.bar }} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Santé de la caisse</p>
            <p className="text-xs text-gray-500">Note globale — comment va notre caisse ?</p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-xl text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: niveauPalette.bar }}>
          {perf.niveau}
        </span>
      </div>

      {/* Score + Tendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        {/* Score */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Note globale</p>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-5xl font-bold" style={{ color: niveauPalette.text }}>{perf.total}</span>
            <span className="text-xl font-semibold text-gray-400">/100</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${perf.total}%`, backgroundColor: niveauPalette.bar }} />
          </div>
          <p className="text-xs text-gray-600">
            {perf.total >= 75 ? 'La caisse est en bonne santé.'
              : perf.total >= 50 ? 'La caisse va moyennement bien.'
              : 'La caisse a des problèmes à résoudre.'}
          </p>
        </div>

        {/* Tendance */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Évolution</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: tendanceColor + '18' }}>
              <TendanceIcon className="w-6 h-6" style={{ color: tendanceColor }} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: tendanceColor }}>{tendanceLabel}</p>
              <p className="text-xs text-gray-500 mt-0.5">{tendanceSub}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Justification du score */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-[#355C7D] shrink-0" />
          <p className="text-xs font-bold text-gray-700">Pourquoi cette note de {perf.total}/100 ?</p>
        </div>
        <div className="flex flex-col gap-4">
          {([
            { key: 'remboursement', label: 'Remboursement des prêts', dot: C.green },
            { key: 'liquidite',     label: 'Argent disponible',       dot: C.blue  },
            { key: 'croissance',    label: 'Membres actifs',          dot: C.gold  },
          ] as const).map(({ key, label, dot }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                  <p className="text-xs font-bold text-gray-700">{label}</p>
                </div>
                <span className="text-xs font-bold" style={{ color: dot }}>
                  {perf.justification[key].poids} pts
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-4">{perf.justification[key].texte}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alertes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          {perf.alertes.length === 0
            ? <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
            : <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
          }
          <p className="text-xs font-bold text-gray-700">Ce qu'il faut surveiller</p>
        </div>

        {perf.alertes.length === 0 ? (
          <p className="text-xs text-[#1B5E20] font-semibold pl-6">
            Tout va bien — tous les indicateurs sont dans les normes.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {perf.alertes.map((alerte, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: niveauPalette.bar + '0D', borderLeft: `3px solid ${niveauPalette.bar}` }}>
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: niveauPalette.bar }} />
                <p className="text-xs text-gray-700 leading-relaxed">{alerte}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explication de la méthode */}
      <div className="mt-4 pt-4 border-t border-gray-200/60">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold">Comment on calcule : </span>
          Remboursements (40 pts) + Argent disponible (30 pts) + Membres actifs (30 pts) = Total sur 100
        </p>
      </div>
    </div>
  );
}