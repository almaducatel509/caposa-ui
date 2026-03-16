// app/components/analyse/kpis/KpiRadarChart.tsx
'use client';

import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';
import { KpiData } from '@/types/kpis';

interface Props { data: KpiData; }

const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Normalisation sur 0–100 ──────────────────────────────────────────────────
// Chaque KPI est ramené à une échelle commune 0–100 :
//   - KPIs "plus haut = mieux" : score = (valeur / plafondRéaliste) * 100
//   - KPIs "plus bas = mieux"  : score = (1 - valeur / plafondRéaliste) * 100  (inversé)
// Les plafonds réalistes sont documentés ci-dessous.
function normaliser(d: KpiData) {
  return [
    {
      kpi:      'Endettement',
      // Inversé — plafond 50% (max observé dans le secteur)
      valeur:   Math.max(0, (1 - d.ratioEndettement / 50) * 100),
      cible:    (1 - 35 / 50) * 100,   // objectif < 35%
      fullMark: 100,
    },
    {
      kpi:    'Recouvrement',
      // Plafond 100%
      valeur: d.tauxRecouvrement,
      cible:  95,
      fullMark: 100,
    },
    {
      kpi:    'Créances douteuses',
      // Inversé — plafond 20%
      valeur: Math.max(0, (1 - d.ratioCreancesDouteuses / 20) * 100),
      cible:  (1 - 5 / 20) * 100,      // objectif < 5%
      fullMark: 100,
    },
    {
      kpi:    'Liquidité',
      // Plafond 3 (ratio > 3 = excellent dans une caisse populaire)
      valeur: Math.min((d.ratioLiquidite / 3) * 100, 100),
      cible:  (1.5 / 3) * 100,          // objectif ≥ 1.5
      fullMark: 100,
    },
    {
      kpi:    'Réserves',
      // Plafond 20%
      valeur: Math.min((d.reservesObligatoires / 20) * 100, 100),
      cible:  (10 / 20) * 100,           // objectif ≥ 10%
      fullMark: 100,
    },
    {
      kpi:    'Couverture risques',
      // Plafond 100%
      valeur: d.couvertureRisques,
      cible:  90,
      fullMark: 100,
    },
    {
      kpi:    'Stabilité membres',
      // Score sur 100
      valeur: d.scoreStabiliteMoyen,
      cible:  75,
      fullMark: 100,
    },
    {
      kpi:    'Activité membres',
      // Plafond 100%
      valeur: d.tauxActiviteMembres,
      cible:  85,
      fullMark: 100,
    },
  ];
}

// ─── Composant ────────────────────────────────────────────────────────────────
export default function KpiRadarChart({ data }: Props) {
  const radarData = normaliser(data);
  const scoreGlobal = radarData.reduce((s, i) => s + i.valeur, 0) / radarData.length;
  const scoreCible  = radarData.reduce((s, i) => s + i.cible,  0) / radarData.length;
  const atteint = scoreGlobal >= scoreCible;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Vue d'ensemble des KPIs</p>
            <p className="text-xs text-gray-500">Comparaison valeurs actuelles / objectifs (échelle normalisée 0–100)</p>
          </div>
        </div>

        {/* Score global */}
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Score global</p>
          <div className="flex items-center gap-2 justify-end">
            <div>
              <p className="text-3xl font-bold" style={{ color: atteint ? C.green : C.gold }}>
                {scoreGlobal.toFixed(0)}
              </p>
              <p className="text-xs text-gray-400">sur 100</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: (atteint ? C.green : C.gold) + '22' }}>
              {atteint
                ? <TrendingUp className="w-5 h-5" style={{ color: C.green }} />
                : <Target     className="w-5 h-5" style={{ color: C.gold  }} />
              }
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Graphique */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-[#F9F9F6] p-4">
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={C.greenPale} />
                <PolarAngleAxis dataKey="kpi"
                  tick={{ fill: C.greenDark, fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]}
                  tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                <Radar name="Objectif" dataKey="cible"
                  stroke={C.gold} fill={C.gold} fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Valeur actuelle" dataKey="valeur"
                  stroke={C.green} fill={C.green} fillOpacity={0.35} strokeWidth={2.5} />
                <Legend wrapperStyle={{ paddingTop: '16px' }} iconType="circle" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: `1px solid ${C.greenPale}`, borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v: number | undefined) => v !== undefined ? `${v.toFixed(1)}/100` : '—'} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau récapitulatif */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" /> Détail par KPI
          </p>
          {radarData.map((item, i) => {
            const ok  = item.valeur >= item.cible;
            const gap = item.valeur - item.cible;
            return (
              <div key={i} className="rounded-xl border-2 p-3 transition-all hover:shadow-sm"
                style={{ backgroundColor: ok ? C.greenPale + '60' : '#FEF9EC', borderColor: ok ? C.greenPale : '#FDE68A' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-800">{item.kpi}</span>
                  <span className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                    style={{ backgroundColor: ok ? C.green + '22' : C.gold + '22', color: ok ? C.greenDark : '#B45309' }}>
                    {ok ? '+' : ''}{gap.toFixed(1)} pts
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Actuel : <b style={{ color: ok ? C.green : C.gold }}>{item.valeur.toFixed(1)}</b></span>
                  <span>Cible : <b className="text-gray-700">{item.cible.toFixed(1)}</b></span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(item.valeur, 100)}%`, backgroundColor: ok ? C.green : C.gold }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Points forts',
            items: radarData.filter(i => i.valeur >= i.cible).slice(0, 3),
            accent: C.green, bg: C.greenPale, border: '#DDEAD5',
          },
          {
            title: 'À améliorer',
            items: radarData.filter(i => i.valeur < i.cible).slice(0, 3),
            accent: C.gold, bg: '#FEF9EC', border: '#FDE68A',
          },
          {
            title: 'Statistiques',
            items: [],
            accent: C.blue, bg: '#EBF2F8', border: '#BFDBFE',
          },
        ].map(({ title, items, accent, bg, border }, gi) => (
          <div key={gi} className="rounded-xl border p-4" style={{ backgroundColor: bg, borderColor: border }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: accent }}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: accent }}>
                {gi === 0 ? '✓' : gi === 1 ? '△' : ''}
                {gi === 2 && <BarChart3 className="w-2.5 h-2.5" />}
              </span>
              {title}
            </p>
            {gi < 2 ? (
              <ul className="flex flex-col gap-1.5">
                {items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-1.5 text-xs" style={{ color: accent }}>
                    <span>•</span>
                    <span>{item.kpi} : {item.valeur.toFixed(0)}/100</span>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="text-xs text-gray-400">—</li>
                )}
              </ul>
            ) : (
              <div className="flex flex-col gap-2 text-xs">
                {[
                  { label: 'KPIs au-dessus cible',  val: `${radarData.filter(i=>i.valeur>=i.cible).length}/${radarData.length}` },
                  { label: 'Score moyen',            val: `${scoreGlobal.toFixed(1)}/100` },
                  { label: 'Performance vs cible',   val: atteint ? 'Atteint' : 'En cours' },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-600">{label} :</span>
                    <span className="font-bold" style={{ color: accent }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}