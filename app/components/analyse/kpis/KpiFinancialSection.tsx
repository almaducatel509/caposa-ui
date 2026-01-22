// app/components/analyse/kpis/KpiFinancialSection.tsx
'use client';

import React from 'react';
import { TrendingDown, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

interface KpiData {
  ratioEndettement: number;
  tauxRecouvrement: number;
  capaciteRemboursementMoyenne: number;
  ratioCreancesDouteuses: number;
}

interface Props {
  data: KpiData;
}

// Composant Jauge Circulaire
const CircularGauge = ({ 
  value, 
  max = 100, 
  label, 
  subtitle,
  threshold,
  reverse = false,
  unit = '%'
}: { 
  value: number; 
  max?: number; 
  label: string;
  subtitle: string;
  threshold: { good: number; warning: number };
  reverse?: boolean;
  unit?: string;
}) => {
  const percentage = (value / max) * 100;
  const strokeDasharray = 2 * Math.PI * 45; // rayon = 45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  // Déterminer la couleur selon le seuil
  let color = '#10b981'; // Vert par défaut
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let textColor = 'text-green-700';

  if (reverse) {
    // Pour les indicateurs où plus bas = meilleur (ex: endettement, créances douteuses)
    if (value >= threshold.warning) {
      color = '#ef4444';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      textColor = 'text-red-700';
    } else if (value >= threshold.good) {
      color = '#f59e0b';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
      textColor = 'text-yellow-700';
    }
  } else {
    // Pour les indicateurs où plus haut = meilleur (ex: recouvrement)
    if (value < threshold.warning) {
      color = '#ef4444';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      textColor = 'text-red-700';
    } else if (value < threshold.good) {
      color = '#f59e0b';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
      textColor = 'text-yellow-700';
    }
  }

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-2xl p-6 transition-all hover:shadow-lg`}>
      <div className="flex flex-col items-center">
        {/* SVG Jauge */}
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Cercle de fond */}
            <circle
              cx="80"
              cy="80"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="10"
              fill="none"
            />
            {/* Cercle de progression */}
            <circle
              cx="80"
              cy="80"
              r="45"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Valeur au centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${textColor}`}>
              {value.toFixed(1)}
            </span>
            <span className={`text-sm font-semibold ${textColor}`}>{unit}</span>
          </div>
        </div>

        {/* Label et description */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
          {label}
        </h3>
        <p className="text-sm text-gray-600 text-center mb-3">
          {subtitle}
        </p>

        {/* Seuils */}
        <div className="w-full space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Objectif:</span>
            <span className="font-semibold text-green-600">
              {reverse ? `< ${threshold.good}${unit}` : `> ${threshold.good}${unit}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Alerte:</span>
            <span className="font-semibold text-yellow-600">
              {reverse ? `${threshold.good}-${threshold.warning}${unit}` : `${threshold.warning}-${threshold.good}${unit}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KpiFinancialSection({ data }: Props) {
  const formatCurrency = (value: number) => 
    `${Math.round(value).toLocaleString('fr-FR')} HTG`;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            KPIs Financiers
          </h2>
          <p className="text-gray-600 mt-1">Indicateurs de santé financière de la caisse</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-700">Mise à jour en temps réel</span>
          </div>
        </div>
      </div>

      {/* Grille des KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ratio d'endettement */}
        <CircularGauge
          value={data.ratioEndettement}
          max={50}
          label="Ratio d'Endettement"
          subtitle="Mensualités / Revenus"
          threshold={{ good: 35, warning: 40 }}
          reverse={true}
          unit="%"
        />

        {/* Taux de recouvrement */}
        <CircularGauge
          value={data.tauxRecouvrement}
          max={100}
          label="Taux de Recouvrement"
          subtitle="Remboursements à temps"
          threshold={{ good: 95, warning: 90 }}
          reverse={false}
          unit="%"
        />

        {/* Capacité de remboursement */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 transition-all hover:shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              Capacité Moyenne
            </h3>
            <p className="text-sm text-gray-600 text-center mb-3">
              Disponibilité mensuelle
            </p>
            <p className="text-3xl font-bold text-green-700 mb-2">
              {formatCurrency(data.capaciteRemboursementMoyenne)}
            </p>
            <div className="w-full mt-4 pt-4 border-t border-green-300">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Tendance:</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +5.2%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ratio créances douteuses */}
        <CircularGauge
          value={data.ratioCreancesDouteuses}
          max={20}
          label="Créances Douteuses"
          subtitle="Prêts à risque / Total"
          threshold={{ good: 5, warning: 8 }}
          reverse={true}
          unit="%"
        />
      </div>

      {/* Alertes contextuelles */}
      <div className="mt-6 space-y-3">
        {data.ratioEndettement > 35 && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">Ratio d'endettement élevé</p>
              <p className="text-sm text-yellow-700 mt-1">
                Le ratio d'endettement de {data.ratioEndettement.toFixed(1)}% dépasse le seuil recommandé de 35%. 
                Envisagez une révision des politiques de crédit.
              </p>
            </div>
          </div>
        )}

        {data.tauxRecouvrement < 95 && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Taux de recouvrement sous l'objectif</p>
              <p className="text-sm text-red-700 mt-1">
                Le taux de recouvrement de {data.tauxRecouvrement.toFixed(1)}% est en dessous de l'objectif de 95%. 
                Renforcez le suivi des remboursements.
              </p>
            </div>
          </div>
        )}

        {data.ratioCreancesDouteuses > 5 && (
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900">Créances douteuses en hausse</p>
              <p className="text-sm text-orange-700 mt-1">
                Le ratio de créances douteuses de {data.ratioCreancesDouteuses.toFixed(1)}% nécessite une attention particulière.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}