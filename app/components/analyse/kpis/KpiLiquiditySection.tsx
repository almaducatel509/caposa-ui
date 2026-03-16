// app/components/analyse/kpis/KpiLiquiditySection.tsx
'use client';

import React from 'react';
import { Droplet, Shield, Wallet, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { KpiData } from '@/types/kpis';

interface Props { data: KpiData; }

const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Barre de progression avec seuils ────────────────────────────────────────
function ProgressBar({ value, max, label, description, threshold, unit = '%' }: {
  value: number; max: number; label: string; description: string;
  threshold: { critique: number; alerte: number; bon: number }; unit?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);

  // Statut
  let status: 'critique' | 'alerte' | 'bon' | 'excellent' = 'excellent';
  if      (value < threshold.critique) status = 'critique';
  else if (value < threshold.alerte)   status = 'alerte';
  else if (value < threshold.bon)      status = 'bon';

  const palette = {
    critique: { bg: '#FEF2F2', border: '#FCA5A5', bar: '#EF4444', text: '#B91C1C', label: 'Critique'  },
    alerte:   { bg: '#FEF9EC', border: '#FDE68A', bar: C.gold,    text: '#B45309', label: 'Alerte'    },
    bon:      { bg: '#EBF2F8', border: '#BFDBFE', bar: C.blue,    text: C.blue,    label: 'Bien'      },
    excellent:{ bg: C.greenPale, border: '#DDEAD5', bar: C.green,  text: C.greenDark,label: 'Excellent' },
  }[status];

  return (
    <div className="rounded-2xl border-2 p-5 transition-all hover:shadow-md"
      style={{ backgroundColor: palette.bg, borderColor: palette.border }}>

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-800">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        {status === 'excellent' || status === 'bon'
          ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: palette.bar }} />
          : <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: palette.bar }} />
        }
      </div>

      {/* Valeur */}
      <p className="text-3xl font-bold mb-3" style={{ color: palette.text }}>
        {value.toFixed(2)}<span className="text-base font-semibold ml-1 text-gray-500">{unit}</span>
      </p>

      {/* Barre */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-visible mb-3">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: palette.bar }} />
        {/* Marqueurs seuils */}
        {[threshold.critique, threshold.alerte, threshold.bon].map((t, i) => (
          <div key={i} className="absolute top-0 h-full w-0.5 opacity-60"
            style={{ left: `${(t / max) * 100}%`, backgroundColor: ['#EF4444', C.gold, C.blue][i] }} />
        ))}
      </div>

      {/* Légende seuils */}
      <div className="grid grid-cols-4 gap-1 text-center">
        {[
          { dot: '#EF4444', label: 'Critique',  val: `< ${threshold.critique}` },
          { dot: C.gold,    label: 'Alerte',    val: `${threshold.critique}–${threshold.alerte}` },
          { dot: C.blue,    label: 'Bien',      val: `${threshold.alerte}–${threshold.bon}` },
          { dot: C.green,   label: 'Excellent', val: `> ${threshold.bon}` },
        ].map((s, i) => (
          <div key={i}>
            <div className="w-2.5 h-2.5 rounded-full mx-auto mb-0.5" style={{ backgroundColor: s.dot }} />
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-xs font-semibold text-gray-600">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Badge */}
      <div className="mt-3 flex justify-end">
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
          style={{ backgroundColor: palette.bar + '22', color: palette.text }}>
          {palette.label}
        </span>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export default function KpiLiquiditySection({ data }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.blue}, #1E3A5F)` }}>
          <Droplet className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">KPIs de Liquidité</p>
          <p className="text-xs text-gray-500">Solvabilité et réserves de la caisse</p>
        </div>
      </div>

      {/* Barres */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <ProgressBar
          value={data.ratioLiquidite} max={3}
          label="Ratio de liquidité" description="Actifs liquides / Passifs court terme"
          threshold={{ critique: 1, alerte: 1.2, bon: 1.5 }} unit="" />
        <ProgressBar
          value={data.reservesObligatoires} max={20}
          label="Réserves obligatoires" description="% du capital réglementaire"
          threshold={{ critique: 5, alerte: 8, bon: 10 }} unit="%" />
        <ProgressBar
          value={data.couvertureRisques} max={100}
          label="Couverture des risques" description="Provisions / Risques identifiés"
          threshold={{ critique: 70, alerte: 80, bon: 90 }} unit="%" />
      </div>

      {/* Cartes info complémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {[
          { icon: Wallet,    label: 'Liquidité immédiate', value: `${(data.ratioLiquidite * 100).toFixed(0)}%`,  sub: 'Capacité à honorer les retraits',        accent: C.blue  },
          { icon: Shield,    label: 'Fonds propres',       value: `${data.reservesObligatoires.toFixed(1)}%`,   sub: 'Solidité et absorption des pertes',       accent: C.blue  },
          { icon: TrendingUp,label: 'Tendance globale',    value: '+3.2%',                                       sub: 'Évolution sur les 3 derniers mois',       accent: C.green },
        ].map(({ icon: Icon, label, value, sub, accent }) => (
          <div key={label} className="rounded-xl border p-4 flex items-start gap-3"
            style={{ backgroundColor: accent + '0D', borderColor: accent + '33' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: accent + '22' }}>
              <Icon className="w-4 h-4" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: accent }}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommandations */}
      <div className="p-4 rounded-xl border bg-[#EBF2F8] border-[#BFDBFE]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#1E3A5F] mb-2">Recommandations</p>
            <ul className="flex flex-col gap-1 text-xs text-[#355C7D]">
              {data.ratioLiquidite    < 1.5 && <li>• Augmentez les réserves de liquidité pour atteindre le ratio optimal de 1.5.</li>}
              {data.reservesObligatoires < 10  && <li>• Renforcez les réserves obligatoires pour respecter la réglementation.</li>}
              {data.couvertureRisques < 90   && <li>• Provisionnez davantage pour améliorer la couverture des risques.</li>}
              {data.ratioLiquidite >= 1.5 && data.reservesObligatoires >= 10 && data.couvertureRisques >= 90 && (
                <li>Tous les indicateurs de liquidité sont dans les normes. Maintenez cette performance.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}