// app/analyse/kpis/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Filter, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import KpiAlertsSection from './KpiAlertsSection';
import KpiFinancialSection from './KpiFinancialSection';
import KpiLiquiditySection from './KpiLiquiditySection';
import KpiMembersSection from './KpiMembersSection';
import KpiRadarChart from './KpiRadarChart';

// Types
export type PeriodFilter = 'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee';
export type RegionFilter = 'all' | 'nord' | 'sud' | 'est' | 'ouest' | 'centre';
export type MemberTypeFilter = 'all' | 'particulier' | 'agriculteur' | 'commercant' | 'artisan';

export interface KpiData {
  // KPIs Financiers
  ratioEndettement: number; // %
  tauxRecouvrement: number; // %
  capaciteRemboursementMoyenne: number; // HTG
  ratioCreancesDouteuses: number; // %
  
  // KPIs Liquidité
  ratioLiquidite: number; // ratio
  reservesObligatoires: number; // %
  couvertureRisques: number; // %
  
  // KPIs Membres
  scoreStabiliteMoyen: number; // 0-100
  tauxActiviteMembres: number; // %
  ratioNouveauxMembres: number; // %
  
  // Meta
  periode: string;
  lastUpdate: Date;
}

// Génération de données mock
const generateKpiData = (): KpiData => {
  return {
    // Financiers
    ratioEndettement: 28 + Math.random() * 15, // 28-43%
    tauxRecouvrement: 92 + Math.random() * 7, // 92-99%
    capaciteRemboursementMoyenne: 12000 + Math.random() * 8000,
    ratioCreancesDouteuses: 2 + Math.random() * 6, // 2-8%
    
    // Liquidité
    ratioLiquidite: 1.2 + Math.random() * 0.8, // 1.2-2.0
    reservesObligatoires: 8 + Math.random() * 4, // 8-12%
    couvertureRisques: 85 + Math.random() * 12, // 85-97%
    
    // Membres
    scoreStabiliteMoyen: 65 + Math.random() * 25, // 65-90
    tauxActiviteMembres: 75 + Math.random() * 20, // 75-95%
    ratioNouveauxMembres: 5 + Math.random() * 10, // 5-15%
    
    periode: 'Décembre 2024',
    lastUpdate: new Date()
  };
};

export default function KpisPage() {
  const [kpiData] = useState<KpiData>(generateKpiData());
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('mois');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');
  const [memberTypeFilter, setMemberTypeFilter] = useState<MemberTypeFilter>('all');

  // Calcul des statuts (Bon/Alerte/Critique)
  const statusCounts = useMemo(() => {
    const checks = [
      kpiData.ratioEndettement < 35, // Bon si < 35%
      kpiData.tauxRecouvrement >= 95, // Bon si >= 95%
      kpiData.ratioCreancesDouteuses < 5, // Bon si < 5%
      kpiData.ratioLiquidite >= 1.5, // Bon si >= 1.5
      kpiData.reservesObligatoires >= 10, // Bon si >= 10%
      kpiData.couvertureRisques >= 90, // Bon si >= 90%
      kpiData.scoreStabiliteMoyen >= 75, // Bon si >= 75
      kpiData.tauxActiviteMembres >= 85, // Bon si >= 85%
    ];

    const bon = checks.filter(c => c).length;
    const total = checks.length;
    const critique = checks.filter((c, i) => !c && [0, 2, 5].includes(i)).length; // Critères critiques
    const alerte = total - bon - critique;

    return { bon, alerte, critique, total };
  }, [kpiData]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 ">
          {/* Titre et description */}
          <div className="flex items-center justify-between mb-6 ">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 ">
                📊 Indicateurs Clés de Performance
              </h1>
              <p className="text-gray-600">
                Vue instantanée de la santé financière de la caisse
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Dernière mise à jour</p>
              <p className="text-lg font-semibold text-indigo-600">
                {kpiData.lastUpdate.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Période */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Période
              </label>
              <div className="flex gap-2">
                {(['jour', 'semaine', 'mois', 'trimestre', 'annee'] as PeriodFilter[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setPeriodFilter(period)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      periodFilter === period
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Région */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Région
              </label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as RegionFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Toutes les régions</option>
                <option value="nord">Nord</option>
                <option value="sud">Sud</option>
                <option value="est">Est</option>
                <option value="ouest">Ouest</option>
                <option value="centre">Centre</option>
              </select>
            </div>

            {/* Type de membre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type de membre
              </label>
              <select
                value={memberTypeFilter}
                onChange={(e) => setMemberTypeFilter(e.target.value as MemberTypeFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="particulier">Particulier</option>
                <option value="agriculteur">Agriculteur</option>
                <option value="commercant">Commerçant</option>
                <option value="artisan">Artisan</option>
              </select>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total KPIs</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Seuils Respectés</p>
                  <p className="text-2xl font-bold text-green-900">{statusCounts.bon}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-yellow-700">En Alerte</p>
                  <p className="text-2xl font-bold text-yellow-900">{statusCounts.alerte}</p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-700">Critiques</p>
                  <p className="text-2xl font-bold text-red-900">{statusCounts.critique}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPIs Financiers */}
        <KpiFinancialSection data={kpiData} />

        {/* KPIs Liquidité */}
        <KpiLiquiditySection data={kpiData} />

        {/* KPIs Membres */}
        <KpiMembersSection data={kpiData} />

        {/* Alertes & Seuils */}
        <KpiAlertsSection data={kpiData} statusCounts={statusCounts} />

        {/* Graphique Radar comparatif */}
        <KpiRadarChart data={kpiData} />
      </div>
    </div>
  );
}