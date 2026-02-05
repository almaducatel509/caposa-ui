// app/rapports/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { FileText, DollarSign, Shield, Search } from 'lucide-react';
import RapportLiquidite from './RapportLiquidite';
import RapportConformite from './RapportConformite';
import { KpiData } from '@/types/kpis';
import RapportSolvabilite from './RaportSolvabilite';
import RapportPretsSouffrance from './RapportPretsSouffrance';

// Génération de données mock ÉTENDUES
const generateExtendedKpiData = (): KpiData => {
  return {
    // KPIs Financiers (existants)
    ratioEndettement: 28 + Math.random() * 15, // 28-43%
    tauxRecouvrement: 92 + Math.random() * 7, // 92-99%
    capaciteRemboursementMoyenne: 12000 + Math.random() * 8000,
    ratioCreancesDouteuses: 2 + Math.random() * 6, // 2-8%
    
    // KPIs Liquidité (existants)
    ratioLiquidite: 1.2 + Math.random() * 0.8, // 1.2-2.0
    reservesObligatoires: 8 + Math.random() * 4, // 8-12%
    couvertureRisques: 85 + Math.random() * 12, // 85-97%
    
    // KPIs Membres (existants)
    scoreStabiliteMoyen: 65 + Math.random() * 25, // 65-90
    tauxActiviteMembres: 75 + Math.random() * 20, // 75-95%
    ratioNouveauxMembres: 5 + Math.random() * 10, // 5-15%
    
    // NOUVEAUX CHAMPS pour rapports réglementaires
    liquiditeDisponible: 800000 + Math.random() * 700000, // 800k-1.5M G
    totalDepotsMembres: 4000000 + Math.random() * 3000000, // 4M-7M G
    capitalPropre: 600000 + Math.random() * 400000, // 600k-1M G
    actifsponderes: 5000000 + Math.random() * 3000000, // 5M-8M G
    portefeuilleTotalPrets: 4500000 + Math.random() * 2500000, // 4.5M-7M G
    montantEnSouffrance: 150000 + Math.random() * 350000, // 150k-500k G
    repartitionSouffrance: {
      jours30: 100000 + Math.random() * 150000,
      jours60: 50000 + Math.random() * 100000,
      jours90Plus: 30000 + Math.random() * 70000,
    },
    
    // Meta
    periode: 'Janvier 2026',
    lastUpdate: new Date()
  };
};

type TabType = 'reglementaires' | 'financiers' | 'audit';

export default function RapportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('reglementaires');
  const [kpiData] = useState<KpiData>(generateExtendedKpiData());
  const [searchTerm, setSearchTerm] = useState('');

  // Tabs configuration
  const tabs = [
    { id: 'reglementaires' as TabType, label: 'Réglementaires', icon: Shield, count: 4 },
    { id: 'financiers' as TabType, label: 'Financiers', icon: DollarSign, count: 4 },
    { id: 'audit' as TabType, label: 'Audit', icon: Search, count: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Titre */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                📊 Rapports de Gestion
              </h1>
              <p className="text-gray-600">
                Rapports réglementaires, financiers et d'audit pour la caisse
              </p>
            </div>
            
            {/* Période et date */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Période</p>
              <p className="text-xl font-bold text-indigo-600">{kpiData.periode}</p>
              <p className="text-xs text-gray-500 mt-1">
                Généré le {kpiData.lastUpdate.toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-t-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg -mb-0.5'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu selon onglet */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'reglementaires' && (
          <div className="space-y-8">
            {/* Intro */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                📋 Rapports Réglementaires Obligatoires
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Ces rapports sont requis par la réglementation haïtienne de la microfinance. 
                Ils doivent être présentés mensuellement au comité de gestion et transmis 
                à la BRH (Banque de la République d'Haïti) selon les échéances réglementaires.
              </p>
            </div>

            {/* Les 4 rapports réglementaires */}
            <RapportLiquidite data={kpiData} />
            <RapportSolvabilite data={kpiData} />
            <RapportConformite data={kpiData} />
            <RapportPretsSouffrance data={kpiData} />
          </div>
        )}

        {activeTab === 'financiers' && (
          <div className="space-y-8">
            {/* Placeholder - Rapports Financiers */}
            <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Rapports Financiers
              </h2>
              <p className="text-gray-600 mb-6">
                Section en cours de développement. Contiendra :
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="font-semibold text-blue-900">📊 Résumé financier mensuel</p>
                  <p className="text-xs text-blue-700 mt-1">Revenus, dépenses, résultat net</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="font-semibold text-blue-900">📈 Évolution des dépôts</p>
                  <p className="text-xs text-blue-700 mt-1">Graphiques et tendances</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="font-semibold text-blue-900">💰 Évolution des prêts</p>
                  <p className="text-xs text-blue-700 mt-1">Volume et croissance</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="font-semibold text-blue-900">🎯 Performance globale</p>
                  <p className="text-xs text-blue-700 mt-1">Score + KPI clés</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-8">
            {/* Placeholder - Audit */}
            <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Rapports d'Audit
              </h2>
              <p className="text-gray-600 mb-6">
                Section en cours de développement. Contiendra :
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="font-semibold text-purple-900">⚠️ Historique des alertes</p>
                  <p className="text-xs text-purple-700 mt-1">Toutes les alertes critiques</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="font-semibold text-purple-900">📝 Décisions du comité</p>
                  <p className="text-xs text-purple-700 mt-1">Procès-verbaux et résolutions</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="font-semibold text-purple-900">🔍 Traçabilité</p>
                  <p className="text-xs text-purple-700 mt-1">Qui a fait quoi, quand</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}