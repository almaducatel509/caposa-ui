// components/rapports/RapportPretsSouffrance.tsx
'use client';

import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import ReportDocument, { ReportRow, ReportDivider, ReportSection, ReportStatusBox } from './ReportDocument';
import { formatCurrency, formatPercentage, KpiData } from '@/types/kpis';

interface Props {
  data: KpiData;
}

export default function RapportPretsSouffrance({ data }: Props) {
  // Calculs
  const pourcentagePortefeuille = (data.montantEnSouffrance / data.portefeuilleTotalPrets) * 100;
  
  // Évolution mensuelle (mock - en production, comparer avec mois précédent)
  const evolutionMensuelle = 1.3; // +1.3%
  
  // Calculer les pourcentages pour chaque tranche
  const totalSouffrance = data.repartitionSouffrance.jours30 + 
                          data.repartitionSouffrance.jours60 + 
                          data.repartitionSouffrance.jours90Plus;
  
  const pct30 = (data.repartitionSouffrance.jours30 / totalSouffrance) * 100;
  const pct60 = (data.repartitionSouffrance.jours60 / totalSouffrance) * 100;
  const pct90 = (data.repartitionSouffrance.jours90Plus / totalSouffrance) * 100;
  
  // Déterminer le statut
  let statut: 'Stable' | 'À risque' | 'Critique';
  let message: string;
  let messageType: 'success' | 'warning' | 'error';

  if (pourcentagePortefeuille <= 3) {
    statut = 'Stable';
    message = `Le taux de prêts en souffrance de ${pourcentagePortefeuille.toFixed(1)}% est acceptable et conforme aux standards de la microfinance. La caisse maintient un bon niveau de recouvrement.`;
    messageType = 'success';
  } else if (pourcentagePortefeuille <= 7) {
    statut = 'À risque';
    message = `Le taux de prêts en souffrance de ${pourcentagePortefeuille.toFixed(1)}% nécessite une surveillance accrue. Renforcez les actions de recouvrement pour éviter une détérioration.`;
    messageType = 'warning';
  } else {
    statut = 'Critique';
    message = `ATTENTION : Le taux de prêts en souffrance de ${pourcentagePortefeuille.toFixed(1)}% est ALARMANT. Des mesures correctives urgentes sont nécessaires pour éviter une crise de liquidité et de solvabilité.`;
    messageType = 'error';
  }

  const handleExportPDF = () => {
    console.log('Export PDF - Rapport Prêts en Souffrance');
    alert('Export PDF en cours de développement...');
  };

  const handleExportExcel = () => {
    console.log('Export Excel - Rapport Prêts en Souffrance');
    alert('Export Excel en cours de développement...');
  };

  return (
    <ReportDocument
      periode={data.periode}
      status={statut}
      onExportPDF={handleExportPDF}
      onExportExcel={handleExportExcel}
    >
      {/* Section 1 : Vue d'ensemble */}
      <div className="space-y-2">
        <ReportRow 
          label="Portefeuille total de prêts" 
          value={formatCurrency(data.portefeuilleTotalPrets)}
          description="Montant total des prêts en cours"
        />
        
        <ReportRow 
          label="Montant en souffrance" 
          value={formatCurrency(data.montantEnSouffrance)}
          description="Prêts avec retard de paiement"
        />
        
        <ReportDivider />
        
        <ReportRow 
          label="% du portefeuille" 
          value={formatPercentage(pourcentagePortefeuille)}
          highlight
        />
        
        <div className="mt-4 bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Évolution mensuelle</p>
              <div className="flex items-center gap-2">
                {evolutionMensuelle > 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-600" />
                )}
                <p className={`text-xl font-bold ${evolutionMensuelle > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {evolutionMensuelle > 0 ? '+' : ''}{formatPercentage(evolutionMensuelle)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Seuil acceptable</p>
              <p className="text-xl font-bold text-gray-900">{formatPercentage(5, 1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 : Répartition par ancienneté */}
      <ReportSection title="Répartition par ancienneté du retard">
        <div className="space-y-4">
          {/* 30 jours */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Retard 1-30 jours</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(data.repartitionSouffrance.jours30)}</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-1000"
                style={{ width: `${pct30}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{pct30.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* 60 jours */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Retard 31-60 jours</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(data.repartitionSouffrance.jours60)}</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${pct60}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{pct60.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* 90+ jours */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Retard 90+ jours (créances douteuses)</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(data.repartitionSouffrance.jours90Plus)}</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                style={{ width: `${pct90}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{pct90.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
            <p className="text-xs font-semibold text-yellow-900">1-30 jours</p>
            <p className="text-xs text-yellow-700 mt-1">Recouvrable facilement</p>
          </div>
          <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 text-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-2"></div>
            <p className="text-xs font-semibold text-orange-900">31-60 jours</p>
            <p className="text-xs text-orange-700 mt-1">Nécessite suivi</p>
          </div>
          <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mx-auto mb-2"></div>
            <p className="text-xs font-semibold text-red-900">90+ jours</p>
            <p className="text-xs text-red-700 mt-1">Risque de perte</p>
          </div>
        </div>
      </ReportSection>

      {/* Section 3 : Interprétation */}
      <ReportStatusBox status={messageType} message={message} />

      {/* Section 4 : Actions recommandées */}
      {statut !== 'Stable' && (
        <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
          <h4 className="text-base font-bold text-orange-900 mb-3">📋 Plan d'action recouvrement</h4>
          <ul className="space-y-3 text-sm text-orange-900">
            <li className="flex items-start gap-3">
              <span className="font-bold mt-0.5">1.</span>
              <div>
                <strong>Retards 1-30 jours :</strong>
                <p className="text-orange-800 mt-1">Relance téléphonique immédiate + rappel SMS automatique</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold mt-0.5">2.</span>
              <div>
                <strong>Retards 31-60 jours :</strong>
                <p className="text-orange-800 mt-1">Visite à domicile + plan de remboursement échelonné</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold mt-0.5">3.</span>
              <div>
                <strong>Retards 90+ jours :</strong>
                <p className="text-orange-800 mt-1">Comité de recouvrement + mise en demeure + saisie garanties</p>
              </div>
            </li>
            {statut === 'Critique' && (
              <li className="flex items-start gap-3">
                <span className="font-bold mt-0.5">4.</span>
                <div>
                  <strong>Mesures d'urgence :</strong>
                  <p className="text-orange-800 mt-1">Suspendre les nouveaux prêts + mobiliser une équipe dédiée au recouvrement + provisionner 50% des créances douteuses</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}
    </ReportDocument>
  );
}