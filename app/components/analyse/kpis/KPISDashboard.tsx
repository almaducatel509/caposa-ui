// app/analyse/kpis/page.tsx
// Directeur + Trésorier — indicateurs institutionnels
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Filter, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import KpiAlertsSection from './KpiAlertsSection';
import KpiFinancialSection from './KpiFinancialSection';
import KpiLiquiditySection from './KpiLiquiditySection';
import KpiMembersSection from './KpiMembersSection';
import KpiRadarChart from './KpiRadarChart';
import { KpiData } from '@/types/kpis';
import PerformanceSummaryCard from '../performance/PerformanceSummaryCard';

export type PeriodFilter     = 'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee';
export type RegionFilter     = 'all' | 'nord' | 'sud' | 'est' | 'ouest' | 'centre';
export type MemberTypeFilter = 'all' | 'particulier' | 'agriculteur' | 'commercant' | 'artisan';

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
  page:      '#F9F9F6',
};

// ─── Mock data ────────────────────────────────────────────────────────────────
function generateKpiData(): KpiData {
  return {
    periode:   'Décembre 2024',
    lastUpdate: new Date(),
    // Financiers
    ratioEndettement:              28  + Math.random() * 15,
    tauxRecouvrement:              92  + Math.random() * 7,
    capaciteRemboursementMoyenne:  12000 + Math.random() * 8000,
    ratioCreancesDouteuses:        2   + Math.random() * 6,
    // Liquidité
    ratioLiquidite:      1.2 + Math.random() * 0.8,
    reservesObligatoires: 8  + Math.random() * 4,
    couvertureRisques:   85  + Math.random() * 12,
    // Membres
    scoreStabiliteMoyen:  65 + Math.random() * 25,
    tauxActiviteMembres:  75 + Math.random() * 20,
    ratioNouveauxMembres:  5 + Math.random() * 10,
    // Performance
    performanceScore: 50 + Math.random() * 40,
    // Rapports liquidité
    liquiditeDisponible:  500000  + Math.random() * 300000,
    totalDepotsMembres:   2000000 + Math.random() * 1000000,
    // Rapports solvabilité
    capitalPropre:   800000  + Math.random() * 400000,
    actifsPonderes:  3000000 + Math.random() * 1500000,
    // Prêts en souffrance
    portefeuilleTotalPrets: 2500000 + Math.random() * 1500000,
    montantEnSouffrance:     100000 + Math.random() * 200000,
    repartitionSouffrance: {
      jours30:    20000 + Math.random() * 20000,
      jours60:    15000 + Math.random() * 15000,
      jours90Plus:30000 + Math.random() * 30000,
    },
  };
}

// ─── Seuils explicitement nommés ──────────────────────────────────────────────
// Un KPI est "bon" s'il respecte son objectif, "alerte" sinon.
// Les critères qualifiés de critiques sont ceux dont la dégradation
// met en danger la solvabilité ou la conformité réglementaire.
function evaluerKpis(d: KpiData) {
  const criteres = [
    { id: 'endettement',  ok: d.ratioEndettement < 35,        critique: true  },
    { id: 'recouvrement', ok: d.tauxRecouvrement >= 95,        critique: false },
    { id: 'creances',     ok: d.ratioCreancesDouteuses < 5,    critique: true  },
    { id: 'liquidite',    ok: d.ratioLiquidite >= 1.5,         critique: false },
    { id: 'reserves',     ok: d.reservesObligatoires >= 10,    critique: true  },
    { id: 'couverture',   ok: d.couvertureRisques >= 90,       critique: true  },
    { id: 'stabilite',    ok: d.scoreStabiliteMoyen >= 75,     critique: false },
    { id: 'activite',     ok: d.tauxActiviteMembres >= 85,     critique: false },
  ];
  const bon     = criteres.filter(c => c.ok).length;
  const critique = criteres.filter(c => !c.ok && c.critique).length;
  const alerte   = criteres.filter(c => !c.ok && !c.critique).length;
  return { bon, alerte, critique, total: criteres.length };
}

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}

// ─── Composant ────────────────────────────────────────────────────────────────
export default function KpisPage() {
  const [kpiData]          = useState<KpiData>(generateKpiData);
  const [periodFilter,     setPeriodFilter]     = useState<PeriodFilter>('mois');
  const [regionFilter,     setRegionFilter]     = useState<RegionFilter>('all');
  const [memberTypeFilter, setMemberTypeFilter] = useState<MemberTypeFilter>('all');

  const statusCounts = useMemo(() => evaluerKpis(kpiData), [kpiData]);

  const selectCls = "px-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]";

  return (
    <div className="min-h-screen bg-[#F9F9F6]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Titre */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Indicateurs Clés de Performance</h1>
                <p className="text-sm text-gray-500 mt-0.5">Vue instantanée de la santé financière de la caisse</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Dernière mise à jour</p>
              <p className="text-sm font-bold text-[#2E7D32] mt-0.5">
                {kpiData.lastUpdate.toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Période */}
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Période
              </p>
              <div className="flex gap-2 flex-wrap">
                {(['jour', 'semaine', 'mois', 'trimestre', 'annee'] as PeriodFilter[]).map(p => (
                  <button key={p} onClick={() => setPeriodFilter(p)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      periodFilter === p
                        ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#81C784] hover:bg-[#DDEAD5]/20'
                    }`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Région */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Région
              </p>
              <select value={regionFilter} onChange={e => setRegionFilter(e.target.value as RegionFilter)} className={selectCls}>
                <option value="all">Toutes les régions</option>
                <option value="nord">Nord</option>
                <option value="sud">Sud</option>
                <option value="est">Est</option>
                <option value="ouest">Ouest</option>
                <option value="centre">Centre</option>
              </select>
            </div>

            {/* Type membre */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Type de membre</p>
              <select value={memberTypeFilter} onChange={e => setMemberTypeFilter(e.target.value as MemberTypeFilter)} className={selectCls}>
                <option value="all">Tous les types</option>
                <option value="particulier">Particulier</option>
                <option value="agriculteur">Agriculteur</option>
                <option value="commercant">Commerçant</option>
                <option value="artisan">Artisan</option>
              </select>
            </div>
          </div>

          {/* Aperçu statuts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'KPIs total',          value: statusCounts.total,    accent: C.blue,  icon: TrendingUp,   bg: '#EBF2F8', text: C.blue      },
              { label: 'Seuils respectés',    value: statusCounts.bon,      accent: C.green, icon: CheckCircle2, bg: C.greenPale, text: C.greenDark },
              { label: 'En alerte',           value: statusCounts.alerte,   accent: C.gold,  icon: AlertTriangle,bg: '#FEF9EC', text: '#B45309'   },
              { label: 'Critiques',           value: statusCounts.critique, accent: '#EF4444',icon: XCircle,     bg: '#FEF2F2', text: '#B91C1C'   },
            ].map(({ label, value, accent, icon: Icon, bg, text }) => (
              <div key={label} className="rounded-2xl border p-4 flex items-center gap-3"
                style={{ backgroundColor: bg, borderColor: accent + '40' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: accent + '22' }}>
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: text }}>{value}</p>
                  <p className="text-xs font-semibold uppercase tracking-widest mt-0.5" style={{ color: text + 'cc' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenu ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
        <PerformanceSummaryCard  data={kpiData} />
        <KpiFinancialSection  data={kpiData} />
        <KpiLiquiditySection  data={kpiData} />
        <KpiMembersSection    data={kpiData} />
        <KpiAlertsSection     data={kpiData} statusCounts={statusCounts} />
        <KpiRadarChart        data={kpiData} />
      </div>
    </div>
  );
}