// app/analyse/performance/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Download, Share2, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

// Composants à créer après
// import PerformanceOverviewCards from '@/app/components/analyse/performance/PerformanceOverviewCards';
// import PerformanceFinancialChart from '@/app/components/analyse/performance/PerformanceFinancialChart';
// import PerformanceCategoryChart from '@/app/components/analyse/performance/PerformanceCategoryChart';
// import PerformanceTimeline from '@/app/components/analyse/performance/PerformanceTimeline';
// import PerformanceTable from '@/app/components/analyse/performance/PerformanceTable';
// import PerformanceExportSection from '@/app/components/analyse/performance/PerformanceExportSection';

// // Types
export type PeriodType = 'mois' | 'trimestre' | 'semestre' | 'annee';
export type ComparisonType = 'none' | 'previous' | 'year';

export interface PerformanceMetrics {
  pretsAccordes: {
    nombre: number;
    montant: number;
    variation: number; // %
  };
  remboursements: {
    nombre: number;
    montant: number;
    tauxTemps: number; // %
    variation: number; // %
  };
  retards: {
    nombre: number;
    montant: number;
    variation: number; // %
  };
  nouveauxMembres: {
    nombre: number;
    variation: number; // %
  };
}

export interface HistoricalData {
  mois: string;
  pretsAccordes: number;
  remboursements: number;
  retards: number;
  nouveauxMembres: number;
}

export interface PerformanceByCategory {
  typePret: { [key: string]: number };
  agent: { [key: string]: number };
  region: { [key: string]: number };
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'pret' | 'remboursement' | 'retard' | 'membre';
  description: string;
  montant?: number;
  agent?: string;
}

export interface AgentPerformance {
  id: string;
  nom: string;
  pretsAccordes: number;
  montantTotal: number;
  tauxRemboursement: number;
  score: number;
}

export interface PerformanceData {
  metrics: PerformanceMetrics;
  historical: HistoricalData[];
  byCategory: PerformanceByCategory;
  timeline: TimelineEvent[];
  agents: AgentPerformance[];
  periode: string;
  lastUpdate: Date;
}

// Génération de données mock
const generatePerformanceData = (): PerformanceData => {
  // Métriques principales
  const metrics: PerformanceMetrics = {
    pretsAccordes: {
      nombre: 145,
      montant: 12500000,
      variation: 12
    },
    remboursements: {
      nombre: 132,
      montant: 9800000,
      tauxTemps: 89,
      variation: 3
    },
    retards: {
      nombre: 18,
      montant: 850000,
      variation: -5 // Négatif = amélioration
    },
    nouveauxMembres: {
      nombre: 47,
      variation: 8
    }
  };

  // Historique 12 mois
  const historical: HistoricalData[] = [];
  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  for (let i = 0; i < 12; i++) {
    historical.push({
      mois: mois[i],
      pretsAccordes: 8000000 + Math.random() * 6000000,
      remboursements: 6000000 + Math.random() * 5000000,
      retards: 500000 + Math.random() * 800000,
      nouveauxMembres: 30 + Math.floor(Math.random() * 30)
    });
  }

  // Par catégorie
  const byCategory: PerformanceByCategory = {
    typePret: {
      'Agricole': 4500000,
      'Commerce': 3200000,
      'Artisanat': 2800000,
      'Personnel': 2000000
    },
    agent: {
      'Marie Dupont': 3200000,
      'Jean Martin': 2900000,
      'Pierre Roy': 2600000,
      'Sophie Côté': 2400000,
      'Autres': 1400000
    },
    region: {
      'Nord': 3500000,
      'Sud': 3000000,
      'Centre': 2800000,
      'Est': 1800000,
      'Ouest': 1400000
    }
  };

  // Timeline des 10 derniers événements
  const timeline: TimelineEvent[] = [
    {
      id: '1',
      date: new Date(2024, 11, 20),
      type: 'pret',
      description: 'Prêt agricole accordé à Jean Baptiste',
      montant: 250000,
      agent: 'Marie Dupont'
    },
    {
      id: '2',
      date: new Date(2024, 11, 19),
      type: 'remboursement',
      description: 'Remboursement complet du prêt #1234',
      montant: 180000,
      agent: 'Jean Martin'
    },
    {
      id: '3',
      date: new Date(2024, 11, 18),
      type: 'membre',
      description: 'Nouveau membre: Rose François',
      agent: 'Sophie Côté'
    },
    {
      id: '4',
      date: new Date(2024, 11, 17),
      type: 'retard',
      description: 'Retard de paiement détecté - Prêt #1156',
      montant: 45000,
      agent: 'Pierre Roy'
    },
    {
      id: '5',
      date: new Date(2024, 11, 16),
      type: 'pret',
      description: 'Prêt commercial accordé à Paul Estimé',
      montant: 350000,
      agent: 'Marie Dupont'
    }
  ];

  // Performance par agent
  const agents: AgentPerformance[] = [
    { id: 'A1', nom: 'Marie Dupont', pretsAccordes: 42, montantTotal: 3200000, tauxRemboursement: 94, score: 92 },
    { id: 'A2', nom: 'Jean Martin', pretsAccordes: 38, montantTotal: 2900000, tauxRemboursement: 91, score: 89 },
    { id: 'A3', nom: 'Pierre Roy', pretsAccordes: 35, montantTotal: 2600000, tauxRemboursement: 88, score: 85 },
    { id: 'A4', nom: 'Sophie Côté', pretsAccordes: 30, montantTotal: 2400000, tauxRemboursement: 92, score: 88 }
  ];

  return {
    metrics,
    historical,
    byCategory,
    timeline,
    agents,
    periode: 'Décembre 2024',
    lastUpdate: new Date()
  };
};

export default function PerformancePage() {
  const [performanceData] = useState<PerformanceData>(generatePerformanceData());
  const [periodType, setPeriodType] = useState<PeriodType>('mois');
  const [comparison, setComparison] = useState<ComparisonType>('previous');

  const formatCurrency = (value: number) => 
    `${Math.round(value).toLocaleString('fr-FR')} HTG`;

  const formatVariation = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Titre et description */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🏆 Performance & Résultats
              </h1>
              <p className="text-gray-600">
                Analyse des réalisations et tendances de la période
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Période analysée</p>
              <p className="text-lg font-semibold text-purple-600">
                {performanceData.periode}
              </p>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Type de période */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Type de période
              </label>
              <div className="flex gap-2">
                {(['mois', 'trimestre', 'semestre', 'annee'] as PeriodType[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setPeriodType(period)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      periodType === period
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparaison */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comparer avec
              </label>
              <select
                value={comparison}
                onChange={(e) => setComparison(e.target.value as ComparisonType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="none">Aucune comparaison</option>
                <option value="previous">Période précédente</option>
                <option value="year">Année précédente</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Partager
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Vue d'ensemble - 4 cartes principales */}
        <PerformanceOverviewCards 
          metrics={performanceData.metrics}
          formatCurrency={formatCurrency}
          formatVariation={formatVariation}
        />

        {/* Graphique d'évolution financière */}
        <PerformanceFinancialChart 
          historical={performanceData.historical}
          formatCurrency={formatCurrency}
        />

        {/* Répartition par catégorie */}
        <PerformanceCategoryChart 
          byCategory={performanceData.byCategory}
          formatCurrency={formatCurrency}
        />

        {/* Timeline des événements */}
        <PerformanceTimeline 
          timeline={performanceData.timeline}
          formatCurrency={formatCurrency}
        />

        {/* Tableau de performance par agent */}
        <PerformanceTable 
          agents={performanceData.agents}
          formatCurrency={formatCurrency}
        />

        {/* Section Export */}
        <PerformanceExportSection 
          data={performanceData}
        />
      </div>
    </div>
  );
}