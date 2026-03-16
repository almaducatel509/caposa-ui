// app/components/analyse/kpis/KpiFinancialSection.tsx
'use client';

import React from 'react';
import { TrendingDown, TrendingUp, Banknote, AlertTriangle } from 'lucide-react';
import { KpiData } from '@/types/kpis';

interface Props { data: KpiData; }

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}

// ─── Jauge circulaire ─────────────────────────────────────────────────────────
function CircularGauge({ value, max = 100, label, subtitle, threshold, reverse = false, unit = '%' }: {
  value: number; max?: number; label: string; subtitle: string;
  threshold: { bon: number; alerte: number }; reverse?: boolean; unit?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const r   = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * pct) / 100;

  // Couleur selon statut
  let color = C.green, bg = C.greenPale, border = '#DDEAD5', textCol = C.greenDark;
  if (reverse) {
    if (value >= threshold.alerte)      { color = '#EF4444'; bg = '#FEF2F2'; border = '#FCA5A5'; textCol = '#B91C1C'; }
    else if (value >= threshold.bon)    { color = C.gold;    bg = '#FEF9EC'; border = '#FDE68A'; textCol = '#92400E'; }
  } else {
    if (value < threshold.alerte)       { color = '#EF4444'; bg = '#FEF2F2'; border = '#FCA5A5'; textCol = '#B91C1C'; }
    else if (value < threshold.bon)     { color = C.gold;    bg = '#FEF9EC'; border = '#FDE68A'; textCol = '#92400E'; }
  }

  return (
    <div className="rounded-2xl border-2 p-5 transition-all hover:shadow-md flex flex-col items-center"
      style={{ backgroundColor: bg, borderColor: border }}>
      <div className="relative w-36 h-36 mb-3">
        <svg className="w-full h-full -rotate-90">
          <circle cx="72" cy="72" r={r} stroke="#E5E7EB" strokeWidth="10" fill="none" />
          <circle cx="72" cy="72" r={r} stroke={color} strokeWidth="10" fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{value.toFixed(1)}</span>
          <span className="text-xs font-semibold" style={{ color }}>{unit}</span>
        </div>
      </div>
      <p className="text-sm font-bold text-gray-800 text-center">{label}</p>
      <p className="text-xs text-gray-500 text-center mt-0.5">{subtitle}</p>
      <div className="mt-3 flex items-center justify-between w-full text-xs text-gray-500">
        <span>Objectif : <b style={{ color: C.green }}>{reverse ? `< ${threshold.bon}${unit}` : `> ${threshold.bon}${unit}`}</b></span>
        <span>Alerte : <b style={{ color: C.gold }}>{reverse ? `${threshold.bon}–${threshold.alerte}${unit}` : `${threshold.alerte}–${threshold.bon}${unit}`}</b></span>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export default function KpiFinancialSection({ data }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">KPIs Financiers</p>
            <p className="text-xs text-gray-500">Indicateurs de santé financière de la caisse</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DDEAD5] rounded-xl">
          <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
          <span className="text-xs font-semibold text-[#1B5E20]">Temps réel</span>
        </div>
      </div>

      {/* Jauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <CircularGauge
          value={data.ratioEndettement} max={50}
          label="Ratio d'endettement" subtitle="Mensualités / Revenus"
          threshold={{ bon: 35, alerte: 40 }} reverse unit="%" />

        <CircularGauge
          value={data.tauxRecouvrement} max={100}
          label="Taux de recouvrement" subtitle="Remboursements à temps"
          threshold={{ bon: 95, alerte: 90 }} unit="%" />

        {/* Capacité de remboursement — valeur monétaire, pas de jauge */}
        <div className="rounded-2xl border-2 p-5 flex flex-col items-center bg-[#DDEAD5]/30 border-[#DDEAD5]">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center mb-3">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <p className="text-lg font-bold text-[#1B5E20] text-center">{formatHTG(data.capaciteRemboursementMoyenne)}</p>
          <p className="text-xs font-bold text-gray-700 text-center mt-1">Capacité moyenne</p>
          <p className="text-xs text-gray-500 text-center mt-0.5">Disponibilité mensuelle</p>
          <div className="mt-3 flex items-center gap-1 px-2 py-1 bg-[#DDEAD5] rounded-lg">
            <TrendingUp className="w-3 h-3 text-[#2E7D32]" />
            <span className="text-xs font-semibold text-[#1B5E20]">+5.2% ce mois</span>
          </div>
        </div>

        <CircularGauge
          value={data.ratioCreancesDouteuses} max={20}
          label="Créances douteuses" subtitle="Prêts à risque / Total"
          threshold={{ bon: 5, alerte: 8 }} reverse unit="%" />
      </div>

      {/* Alertes contextuelles */}
      <div className="flex flex-col gap-3">
        {data.ratioEndettement > 35 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border bg-[#FEF9EC] border-[#FDE68A]">
            <AlertTriangle className="w-4 h-4 text-[#B45309] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#92400E]">Ratio d'endettement élevé</p>
              <p className="text-xs text-[#B45309] mt-0.5">
                Le ratio de {data.ratioEndettement.toFixed(1)}% dépasse le seuil de 35%. Envisagez une révision des politiques de crédit.
              </p>
            </div>
          </div>
        )}
        {data.tauxRecouvrement < 95 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border bg-[#FEF2F2] border-[#FCA5A5]">
            <AlertTriangle className="w-4 h-4 text-[#B91C1C] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#B91C1C]">Taux de recouvrement sous l'objectif</p>
              <p className="text-xs text-[#DC2626] mt-0.5">
                {data.tauxRecouvrement.toFixed(1)}% — objectif 95%. Renforcez le suivi des remboursements.
              </p>
            </div>
          </div>
        )}
        {data.ratioCreancesDouteuses > 5 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border bg-[#FEF2F2] border-[#FCA5A5]">
            <TrendingDown className="w-4 h-4 text-[#B91C1C] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#B91C1C]">Créances douteuses en hausse</p>
              <p className="text-xs text-[#DC2626] mt-0.5">
                {data.ratioCreancesDouteuses.toFixed(1)}% — seuil 5%. Analysez les prêts à risque et mettez en place des plans de recouvrement.
              </p>
            </div>
          </div>
        )}
        {data.ratioEndettement <= 35 && data.tauxRecouvrement >= 95 && data.ratioCreancesDouteuses <= 5 && (
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-[#DDEAD5]/40 border-[#DDEAD5]">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] shrink-0" />
            <p className="text-xs font-semibold text-[#1B5E20]">Tous les indicateurs financiers sont dans les normes.</p>
          </div>
        )}
      </div>
    </section>
  );
}