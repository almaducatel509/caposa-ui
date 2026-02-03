// app/components/analyse/kpis/KpiAlertsSection.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, XCircle, CheckCircle, Bell, ChevronRight, Clock, User, FileText } from 'lucide-react';
import { KpiData } from '@/types/kpis';


interface StatusCounts {
  bon: number;
  alerte: number;
  critique: number;
  total: number;
}

interface Props {
  data: KpiData;
  statusCounts: StatusCounts;
}

interface Alert {
  id: string;
  type: 'critique' | 'alerte' | 'info';
  category: 'financier' | 'liquidite' | 'membres';
  title: string;
  description: string;
  value: number;
  threshold: number;
  metric: string;
  action: string;
  assignedTo?: string;
  deadline?: Date;
}

export default function KpiAlertsSection({ data, statusCounts }: Props) {
  const [filter, setFilter] = useState<'all' | 'critique' | 'alerte'>('all');

  // Générer les alertes basées sur les données
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    // Financier - Ratio endettement
    if (data.ratioEndettement > 35) {
      alerts.push({
        id: 'alert-1',
        type: data.ratioEndettement > 40 ? 'critique' : 'alerte',
        category: 'financier',
        title: 'Ratio d\'endettement élevé',
        description: 'Le ratio d\'endettement dépasse le seuil recommandé et nécessite une action immédiate.',
        value: data.ratioEndettement,
        threshold: 35,
        metric: '%',
        action: 'Réviser les politiques de crédit et limiter les nouveaux prêts aux membres à risque',
        assignedTo: 'Direction Financière',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    // Financier - Taux recouvrement
    if (data.tauxRecouvrement < 95) {
      alerts.push({
        id: 'alert-2',
        type: data.tauxRecouvrement < 90 ? 'critique' : 'alerte',
        category: 'financier',
        title: 'Taux de recouvrement sous l\'objectif',
        description: 'Le taux de remboursement à temps est inférieur à l\'objectif de 95%.',
        value: data.tauxRecouvrement,
        threshold: 95,
        metric: '%',
        action: 'Intensifier le suivi des remboursements et contacter les retardataires',
        assignedTo: 'Service Recouvrement',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      });
    }

    // Financier - Créances douteuses
    if (data.ratioCreancesDouteuses > 5) {
      alerts.push({
        id: 'alert-3',
        type: data.ratioCreancesDouteuses > 8 ? 'critique' : 'alerte',
        category: 'financier',
        title: 'Créances douteuses en hausse',
        description: 'Le ratio de créances à risque nécessite une attention particulière.',
        value: data.ratioCreancesDouteuses,
        threshold: 5,
        metric: '%',
        action: 'Analyser les prêts à risque et mettre en place des plans de recouvrement',
        assignedTo: 'Comité de Crédit',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      });
    }

    // Liquidité - Ratio de liquidité
    if (data.ratioLiquidite < 1.5) {
      alerts.push({
        id: 'alert-4',
        type: data.ratioLiquidite < 1.2 ? 'critique' : 'alerte',
        category: 'liquidite',
        title: 'Ratio de liquidité faible',
        description: 'Les réserves de liquidité sont sous le seuil prudentiel.',
        value: data.ratioLiquidite,
        threshold: 1.5,
        metric: '',
        action: 'Augmenter les réserves liquides et limiter les décaissements importants',
        assignedTo: 'Trésorier',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      });
    }

    // Liquidité - Réserves obligatoires
    if (data.reservesObligatoires < 10) {
      alerts.push({
        id: 'alert-5',
        type: data.reservesObligatoires < 8 ? 'critique' : 'alerte',
        category: 'liquidite',
        title: 'Réserves obligatoires insuffisantes',
        description: 'Les réserves réglementaires sont en dessous du minimum requis.',
        value: data.reservesObligatoires,
        threshold: 10,
        metric: '%',
        action: 'Constituer les réserves obligatoires conformément à la réglementation',
        assignedTo: 'Direction Générale',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
    }

    // Liquidité - Couverture risques
    if (data.couvertureRisques < 90) {
      alerts.push({
        id: 'alert-6',
        type: data.couvertureRisques < 80 ? 'critique' : 'alerte',
        category: 'liquidite',
        title: 'Couverture des risques insuffisante',
        description: 'Les provisions ne couvrent pas suffisamment les risques identifiés.',
        value: data.couvertureRisques,
        threshold: 90,
        metric: '%',
        action: 'Augmenter les provisions pour risques et créances douteuses',
        assignedTo: 'Comité des Risques',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      });
    }

    // Membres - Score stabilité
    if (data.scoreStabiliteMoyen < 75) {
      alerts.push({
        id: 'alert-7',
        type: data.scoreStabiliteMoyen < 65 ? 'critique' : 'alerte',
        category: 'membres',
        title: 'Score de stabilité moyen faible',
        description: 'La qualité moyenne du portefeuille membres nécessite amélioration.',
        value: data.scoreStabiliteMoyen,
        threshold: 75,
        metric: '/100',
        action: 'Renforcer les critères d\'admission et former les membres à la gestion',
        assignedTo: 'Service Membres',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Membres - Taux activité
    if (data.tauxActiviteMembres < 85) {
      alerts.push({
        id: 'alert-8',
        type: data.tauxActiviteMembres < 75 ? 'critique' : 'alerte',
        category: 'membres',
        title: 'Taux d\'activité des membres faible',
        description: 'Trop de membres sont inactifs, affectant la dynamique de la caisse.',
        value: data.tauxActiviteMembres,
        threshold: 85,
        metric: '%',
        action: 'Campagne de réactivation et communication avec les membres inactifs',
        assignedTo: 'Service Communication',
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filter);

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            Alertes & Seuils
          </h2>
          <p className="text-gray-600 mt-1">Actions prioritaires sur les KPIs nécessitant une attention</p>
        </div>

        {/* Badge de notification */}
        <div className="flex items-center gap-2">
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold">
            {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Toutes ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('critique')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'critique'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Critiques ({alerts.filter(a => a.type === 'critique').length})
        </button>
        <button
          onClick={() => setFilter('alerte')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'alerte'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Alertes ({alerts.filter(a => a.type === 'alerte').length})
        </button>
      </div>

      {/* Liste des alertes */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune alerte active !</h3>
          <p className="text-gray-600">Tous les KPIs sont dans les normes. Continuez ce bon travail !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-2 rounded-2xl p-6 transition-all hover:shadow-lg ${
                alert.type === 'critique'
                  ? 'bg-red-50 border-red-200'
                  : alert.type === 'alerte'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {/* Header de l'alerte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    alert.type === 'critique'
                      ? 'bg-red-600'
                      : alert.type === 'alerte'
                      ? 'bg-yellow-600'
                      : 'bg-blue-600'
                  }`}>
                    {alert.type === 'critique' ? (
                      <XCircle className="w-7 h-7 text-white" />
                    ) : (
                      <AlertTriangle className="w-7 h-7 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        alert.category === 'financier'
                          ? 'bg-blue-100 text-blue-700'
                          : alert.category === 'liquidite'
                          ? 'bg-cyan-100 text-cyan-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {alert.category === 'financier' ? '💰 Financier' :
                         alert.category === 'liquidite' ? '💧 Liquidité' :
                         '👥 Membres'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{alert.description}</p>

                    {/* Valeur actuelle vs seuil */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                        <span className="text-xs text-gray-600">Valeur actuelle:</span>
                        <p className={`text-lg font-bold ${
                          alert.type === 'critique' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {alert.value.toFixed(1)}{alert.metric}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                      <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                        <span className="text-xs text-gray-600">Seuil cible:</span>
                        <p className="text-lg font-bold text-green-700">
                          {alert.threshold.toFixed(1)}{alert.metric}
                        </p>
                      </div>
                    </div>

                    {/* Action recommandée */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">Action recommandée:</p>
                          <p className="text-sm text-gray-700">{alert.action}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Assignation et deadline */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {alert.assignedTo && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Assigné à:</span>
                      <span className="font-semibold text-gray-900">{alert.assignedTo}</span>
                    </div>
                  )}
                  {alert.deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Échéance:</span>
                      <span className="font-semibold text-gray-900">
                        {alert.deadline.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bouton conditionnel selon la catégorie */}
                {alert.category === 'financier' ? (
                <Link href="/dashboard/analysis/kpis/alerts">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm">
                      Prendre en charge
                    </button>
                  </Link>
                ) : (
                  <button 
                    onClick={() => console.log('Alerte prise en charge:', alert.id, alert.category)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                  >
                    Prendre en charge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}