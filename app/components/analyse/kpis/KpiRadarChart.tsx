// app/components/analyse/kpis/KpiRadarChart.tsx
'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';
import { KpiData } from '@/types/kpis';


interface Props {
  data: KpiData;
}

export default function KpiRadarChart({ data }: Props) {
  // Normaliser les données sur une échelle 0-100 pour le radar
  const normalizeData = () => {
    return [
      {
        kpi: 'Endettement',
        valeur: Math.max(0, 100 - (data.ratioEndettement / 50) * 100), // Inversé: moins = mieux
        cible: 100 - (35 / 50) * 100,
        fullMark: 100
      },
      {
        kpi: 'Recouvrement',
        valeur: data.tauxRecouvrement,
        cible: 95,
        fullMark: 100
      },
      {
        kpi: 'Créances',
        valeur: Math.max(0, 100 - (data.ratioCreancesDouteuses / 20) * 100), // Inversé: moins = mieux
        cible: 100 - (5 / 20) * 100,
        fullMark: 100
      },
      {
        kpi: 'Liquidité',
        valeur: (data.ratioLiquidite / 3) * 100,
        cible: (1.5 / 3) * 100,
        fullMark: 100
      },
      {
        kpi: 'Réserves',
        valeur: (data.reservesObligatoires / 20) * 100,
        cible: (10 / 20) * 100,
        fullMark: 100
      },
      {
        kpi: 'Risques',
        valeur: data.couvertureRisques,
        cible: 90,
        fullMark: 100
      },
      {
        kpi: 'Stabilité',
        valeur: data.scoreStabiliteMoyen,
        cible: 75,
        fullMark: 100
      },
      {
        kpi: 'Activité',
        valeur: data.tauxActiviteMembres,
        cible: 85,
        fullMark: 100
      }
    ];
  };

  const radarData = normalizeData();

  // Calculer le score global
  const scoreGlobal = radarData.reduce((sum, item) => sum + item.valeur, 0) / radarData.length;
  const scoreCible = radarData.reduce((sum, item) => sum + item.cible, 0) / radarData.length;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Vue d'ensemble des KPIs
          </h2>
          <p className="text-gray-600 mt-1">Comparaison visuelle entre valeurs actuelles et objectifs</p>
        </div>

        {/* Score global */}
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Score Global</p>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-4xl font-bold text-indigo-600">{scoreGlobal.toFixed(0)}</p>
              <p className="text-xs text-gray-500">sur 100</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              scoreGlobal >= scoreCible ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {scoreGlobal >= scoreCible ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <Target className="w-6 h-6 text-yellow-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique Radar */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0e7ff" />
                <PolarAngleAxis 
                  dataKey="kpi" 
                  tick={{ fill: '#4f46e5', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Radar
                  name="Objectif"
                  dataKey="cible"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="Valeur actuelle"
                  dataKey="valeur"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                  strokeWidth={3}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    padding: '8px 12px'
                  }}
                  formatter={(value?: number) => 
                    value !== undefined ? `${value.toFixed(1)}/100` : '—'
                  }
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau récapitulatif */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Détail par KPI
          </h3>
          
          {radarData.map((item, index) => {
            const isAboveTarget = item.valeur >= item.cible;
            const gap = item.valeur - item.cible;
            
            return (
              <div 
                key={index}
                className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                  isAboveTarget 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{item.kpi}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    isAboveTarget 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {isAboveTarget ? '✓' : '△'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Actuel:</span>
                  <span className="font-bold text-gray-900">{item.valeur.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-600">Cible:</span>
                  <span className="font-bold text-gray-900">{item.cible.toFixed(1)}</span>
                </div>
                
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      isAboveTarget 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    }`}
                    style={{ width: `${Math.min(item.valeur, 100)}%` }}
                  />
                </div>
                
                <p className={`text-xs mt-1 font-semibold ${
                  isAboveTarget ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {isAboveTarget ? `+${gap.toFixed(1)} pts` : `${gap.toFixed(1)} pts`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Points forts */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            Points Forts
          </h4>
          <ul className="space-y-2 text-sm text-green-800">
            {radarData
              .filter(item => item.valeur >= item.cible)
              .slice(0, 3)
              .map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>{item.kpi}: {item.valeur.toFixed(0)}/100</span>
                </li>
              ))}
          </ul>
        </div>

        {/* À améliorer */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center">
              <span className="text-white text-xs">△</span>
            </div>
            À Améliorer
          </h4>
          <ul className="space-y-2 text-sm text-yellow-800">
            {radarData
              .filter(item => item.valeur < item.cible)
              .slice(0, 3)
              .map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>{item.kpi}: {item.valeur.toFixed(0)}/100</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Statistiques */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4">
          <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            Statistiques
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-indigo-700">KPIs au-dessus cible:</span>
              <span className="font-bold text-indigo-900">
                {radarData.filter(item => item.valeur >= item.cible).length}/{radarData.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700">Score moyen:</span>
              <span className="font-bold text-indigo-900">{scoreGlobal.toFixed(1)}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700">Performance vs cible:</span>
              <span className={`font-bold ${
                scoreGlobal >= scoreCible ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {scoreGlobal >= scoreCible ? '✓ Atteint' : '△ En cours'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}