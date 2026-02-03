// app/components/analyse/kpis/KpiMembersSection.tsx
'use client';

import React from 'react';
import { Users, UserPlus, Activity, TrendingUp, Award } from 'lucide-react';
import { KpiData } from '@/types/kpis';


interface Props {
  data: KpiData;
}

// Composant Carte KPI Membre
const MemberKpiCard = ({
  icon: Icon,
  label,
  value,
  unit,
  description,
  trend,
  color,
  threshold
}: {
  icon: any;
  label: string;
  value: number;
  unit: string;
  description: string;
  trend: number;
  color: string;
  threshold: { min: number; target: number };
}) => {
  const isGood = value >= threshold.target;
  const isWarning = value >= threshold.min && value < threshold.target;
  const isCritical = value < threshold.min;

  const statusColor = isGood 
    ? 'border-green-200 bg-green-50' 
    : isWarning 
    ? 'border-yellow-200 bg-yellow-50' 
    : 'border-red-200 bg-red-50';

  const valueColor = isGood 
    ? 'text-green-700' 
    : isWarning 
    ? 'text-yellow-700' 
    : 'text-red-700';

  return (
    <div className={`border-2 ${statusColor} rounded-2xl p-6 transition-all hover:shadow-xl`}>
      {/* Icon et Label */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center`} style={{ background: color }}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
          trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
        </div>
      </div>

      {/* Label */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{label}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {/* Valeur principale */}
      <div className="mb-4">
        <span className={`text-5xl font-bold ${valueColor}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-xl font-semibold text-gray-600 ml-2">{unit}</span>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progression</span>
          <span className="font-semibold">{value.toFixed(0)}/{threshold.target}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              isGood ? 'bg-gradient-to-r from-green-400 to-green-600' :
              isWarning ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
              'bg-gradient-to-r from-red-400 to-red-600'
            }`}
            style={{ width: `${Math.min((value / threshold.target) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Min: {threshold.min}</span>
          <span className="text-gray-500">Cible: {threshold.target}</span>
        </div>
      </div>

      {/* Badge de statut */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
          isGood ? 'text-green-700' :
          isWarning ? 'text-yellow-700' :
          'text-red-700'
        }`}>
          {isGood ? '✅ Objectif atteint' :
           isWarning ? '⚠️ À améliorer' :
           '🔴 Action requise'}
        </span>
      </div>
    </div>
  );
};

export default function KpiMembersSection({ data }: Props) {
  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            KPIs Membres
          </h2>
          <p className="text-gray-600 mt-1">Indicateurs d'engagement et qualité du portefeuille membres</p>
        </div>
      </div>

      {/* Grille des KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Score de stabilité moyen */}
        <MemberKpiCard
          icon={Award}
          label="Score de Stabilité Moyen"
          value={data.scoreStabiliteMoyen}
          unit="/100"
          description="Fiabilité financière moyenne des membres"
          trend={2.3}
          color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          threshold={{ min: 60, target: 75 }}
        />

        {/* Taux d'activité */}
        <MemberKpiCard
          icon={Activity}
          label="Taux d'Activité"
          value={data.tauxActiviteMembres}
          unit="%"
          description="Membres actifs / Total membres"
          trend={1.8}
          color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          threshold={{ min: 70, target: 85 }}
        />

        {/* Ratio nouveaux membres */}
        <MemberKpiCard
          icon={UserPlus}
          label="Nouveaux Membres"
          value={data.ratioNouveauxMembres}
          unit="%"
          description="Nouveaux / Total (croissance)"
          trend={0.5}
          color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          threshold={{ min: 5, target: 10 }}
        />
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Membres premium */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-700 font-semibold">Score &gt; 85</p>
              <p className="text-2xl font-bold text-amber-900">34%</p>
            </div>
          </div>
          <p className="text-xs text-amber-700">Membres à score premium</p>
        </div>

        {/* Membres actifs ce mois */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-semibold">Actifs ce mois</p>
              <p className="text-2xl font-bold text-blue-900">892</p>
            </div>
          </div>
          <p className="text-xs text-blue-700">Sur 1,050 membres totaux</p>
        </div>

        {/* Nouveaux inscrits */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-semibold">Ce mois</p>
              <p className="text-2xl font-bold text-green-900">47</p>
            </div>
          </div>
          <p className="text-xs text-green-700">Nouveaux membres inscrits</p>
        </div>

        {/* Tendance globale */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700 font-semibold">Tendance</p>
              <p className="text-2xl font-bold text-purple-900">+1.5%</p>
            </div>
          </div>
          <p className="text-xs text-purple-700">Évolution sur 3 mois</p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-purple-900 mb-2">📈 Analyse du portefeuille membres</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-700">
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <p>Le score de stabilité moyen de <strong>{data.scoreStabiliteMoyen.toFixed(1)}/100</strong> indique un portefeuille {data.scoreStabiliteMoyen >= 75 ? 'solide' : 'à consolider'}.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <p>Taux d'activité à <strong>{data.tauxActiviteMembres.toFixed(1)}%</strong> {data.tauxActiviteMembres >= 85 ? '- Excellent engagement !' : '- Relancer les membres inactifs.'}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <p>Croissance de <strong>{data.ratioNouveauxMembres.toFixed(1)}%</strong> {data.ratioNouveauxMembres >= 10 ? '- Objectif de croissance atteint !' : '- Intensifier le recrutement.'}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <p>34% des membres ont un score premium (&gt;85), ce qui représente une base solide pour les prêts importants.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}