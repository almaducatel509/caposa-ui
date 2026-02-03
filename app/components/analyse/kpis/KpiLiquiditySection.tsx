// app/components/analyse/kpis/KpiLiquiditySection.tsx
'use client';

import React from 'react';
import { Droplet, Shield, Wallet, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { KpiData } from '@/types/kpis';


interface Props {
  data: KpiData;
}

// Composant Barre de progression avec seuils
const ProgressBar = ({
  value,
  max,
  label,
  description,
  threshold,
  unit = '%',
  showValue = true
}: {
  value: number;
  max: number;
  label: string;
  description: string;
  threshold: { critical: number; warning: number; good: number };
  unit?: string;
  showValue?: boolean;
}) => {
  const percentage = (value / max) * 100;
  
  // Déterminer le statut
  let status: 'critical' | 'warning' | 'good' | 'excellent' = 'excellent';
  let color = '#10b981';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let barColor = 'bg-gradient-to-r from-green-400 to-green-600';
  
  if (value < threshold.critical) {
    status = 'critical';
    color = '#ef4444';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    barColor = 'bg-gradient-to-r from-red-400 to-red-600';
  } else if (value < threshold.warning) {
    status = 'warning';
    color = '#f59e0b';
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    barColor = 'bg-gradient-to-r from-yellow-400 to-yellow-600';
  } else if (value < threshold.good) {
    status = 'good';
    color = '#3b82f6';
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-200';
    barColor = 'bg-gradient-to-r from-blue-400 to-blue-600';
  }

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-2xl p-6 transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {status === 'excellent' || status === 'good' ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : (
          <AlertCircle className="w-6 h-6 text-red-600" />
        )}
      </div>

      {/* Valeur principale */}
      {showValue && (
        <div className="mb-4">
          <span className="text-4xl font-bold" style={{ color }}>
            {value.toFixed(2)}
          </span>
          <span className="text-xl font-semibold text-gray-600 ml-1">{unit}</span>
        </div>
      )}

      {/* Barre de progression */}
      <div className="relative">
        {/* Barre de fond avec marqueurs */}
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
          {/* Barre de progression */}
          <div 
            className={`h-full ${barColor} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          
          {/* Marqueurs de seuils */}
          <div 
            className="absolute top-0 h-full w-0.5 bg-red-800"
            style={{ left: `${(threshold.critical / max) * 100}%` }}
          />
          <div 
            className="absolute top-0 h-full w-0.5 bg-yellow-800"
            style={{ left: `${(threshold.warning / max) * 100}%` }}
          />
          <div 
            className="absolute top-0 h-full w-0.5 bg-blue-800"
            style={{ left: `${(threshold.good / max) * 100}%` }}
          />
        </div>

        {/* Légende des seuils */}
        <div className="flex justify-between mt-3 text-xs">
          <div className="text-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
            <span className="text-gray-600">Critique</span>
            <p className="font-semibold text-gray-900">&lt; {threshold.critical}</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
            <span className="text-gray-600">Alerte</span>
            <p className="font-semibold text-gray-900">{threshold.critical}-{threshold.warning}</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
            <span className="text-gray-600">Bien</span>
            <p className="font-semibold text-gray-900">{threshold.warning}-{threshold.good}</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
            <span className="text-gray-600">Excellent</span>
            <p className="font-semibold text-gray-900">&gt; {threshold.good}</p>
          </div>
        </div>
      </div>

      {/* Badge de statut */}
      <div className="mt-4 flex justify-end">
        <span className={`
          px-3 py-1 rounded-full text-xs font-semibold
          ${status === 'critical' ? 'bg-red-100 text-red-700' :
            status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
            status === 'good' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'}
        `}>
          {status === 'critical' ? '🔴 Critique' :
           status === 'warning' ? '🟡 Alerte' :
           status === 'good' ? '🔵 Bien' :
           '🟢 Excellent'}
        </span>
      </div>
    </div>
  );
};

export default function KpiLiquiditySection({ data }: Props) {
  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            KPIs de Liquidité
          </h2>
          <p className="text-gray-600 mt-1">Indicateurs de solvabilité et réserves de la caisse</p>
        </div>
      </div>

      {/* Grille des KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Ratio de liquidité */}
        <ProgressBar
          value={data.ratioLiquidite}
          max={3}
          label="Ratio de Liquidité"
          description="Actifs liquides / Passifs court terme"
          threshold={{ critical: 1, warning: 1.2, good: 1.5 }}
          unit=""
          showValue={true}
        />

        {/* Réserves obligatoires */}
        <ProgressBar
          value={data.reservesObligatoires}
          max={20}
          label="Réserves Obligatoires"
          description="% du capital réglementaire"
          threshold={{ critical: 5, warning: 8, good: 10 }}
          unit="%"
          showValue={true}
        />

        {/* Couverture des risques */}
        <ProgressBar
          value={data.couvertureRisques}
          max={100}
          label="Couverture des Risques"
          description="Provisions / Risques identifiés"
          threshold={{ critical: 70, warning: 80, good: 90 }}
          unit="%"
          showValue={true}
        />
      </div>

      {/* Cartes d'information supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Liquidité immédiate */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-cyan-700 font-semibold">Liquidité Immédiate</p>
              <p className="text-2xl font-bold text-cyan-900">
                {(data.ratioLiquidite * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-cyan-700">
            Capacité à honorer les demandes de retrait immédiates
          </p>
        </div>

        {/* Fonds propres */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-semibold">Fonds Propres</p>
              <p className="text-2xl font-bold text-blue-900">
                {data.reservesObligatoires.toFixed(1)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-700">
            Solidité financière et capacité d'absorption des pertes
          </p>
        </div>

        {/* Tendance */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-semibold">Tendance Globale</p>
              <p className="text-2xl font-bold text-green-900">+3.2%</p>
            </div>
          </div>
          <p className="text-xs text-green-700">
            Évolution de la liquidité sur les 3 derniers mois
          </p>
        </div>
      </div>

      {/* Recommandations */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900 mb-2">💡 Recommandations</p>
            <ul className="space-y-1 text-sm text-blue-700">
              {data.ratioLiquidite < 1.5 && (
                <li>• Augmentez les réserves de liquidité pour atteindre le ratio optimal de 1.5</li>
              )}
              {data.reservesObligatoires < 10 && (
                <li>• Renforcez les réserves obligatoires pour respecter la réglementation</li>
              )}
              {data.couvertureRisques < 90 && (
                <li>• Provisionnez davantage pour améliorer la couverture des risques</li>
              )}
              {data.ratioLiquidite >= 1.5 && data.reservesObligatoires >= 10 && data.couvertureRisques >= 90 && (
                <li>✅ Tous les indicateurs de liquidité sont dans les normes. Maintenez cette performance !</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}