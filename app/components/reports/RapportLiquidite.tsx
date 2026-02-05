// components/rapports/RapportLiquidite.tsx
'use client';

import React from 'react';
import { Droplet, TrendingUp, TrendingDown } from 'lucide-react';
import ReportDocument, { ReportRow, ReportDivider, ReportStatusBox } from './ReportDocument';
import { formatCurrency, formatPercentage, KpiData } from '@/types/kpis';

interface Props {
  data: KpiData;
}

export default function RapportLiquidite({ data }: Props) {
  // Calculs
  const ratio = (data.liquiditeDisponible / data.totalDepotsMembres) * 100;
  
  // Évolution 3 mois (mock - en production, comparer avec données historiques)
  const evolutionTrimestre = 2.3; // +2.3%
  
  // Déterminer le statut
  let statut: 'Conforme' | 'À surveiller' | 'Critique';
  let message: string;
  let messageType: 'success' | 'warning' | 'error';

  if (ratio >= 15) {
    statut = 'Conforme';
    message = 'La caisse dispose d\'une liquidité suffisante pour honorer les retraits immédiats. Les réserves dépassent le seuil minimal réglementaire de 15%.';
    messageType = 'success';
  } else if (ratio >= 10) {
    statut = 'À surveiller';
    message = 'La liquidité est sous le seuil optimal de 15%. Il est recommandé de renforcer les réserves liquides pour assurer une meilleure capacité de réponse aux retraits.';
    messageType = 'warning';
  } else {
    statut = 'Critique';
    message = 'ATTENTION : La liquidité est dangereusement basse. Des actions immédiates sont nécessaires pour éviter une incapacité à honorer les retraits. Limitez les décaissements et mobilisez des fonds d\'urgence.';
    messageType = 'error';
  }

  const handleExportPDF = () => {
    console.log('Export PDF - Rapport de Liquidité');
    alert('Export PDF en cours de développement...');
  };

  const handleExportExcel = () => {
    console.log('Export Excel - Rapport de Liquidité');
    alert('Export Excel en cours de développement...');
  };

  return (
    <ReportDocument
      periode={data.periode}
      status={statut}
      onExportPDF={handleExportPDF}
      onExportExcel={handleExportExcel}
    >
      {/* Section 1 : Données de base */}
      <div className="space-y-2">
        <ReportRow 
          label="Liquidité disponible" 
          value={formatCurrency(data.liquiditeDisponible)}
          description="Somme des disponibilités en caisse et en banque"
        />
        
        <ReportRow
          label="Total dépôts membres"
          value={formatCurrency(data.totalDepotsMembres)}
          description="Montant total des dépôts à vue et à terme"
          href="/dashboard/treasury/deposits" // futur vrai lien
        />

        
        <ReportDivider />
        
        <ReportRow 
          label="Ratio de liquidité" 
          value={formatPercentage(ratio)}
          highlight
        />
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Évolution 3 mois</p>
            <div className="flex items-center gap-2">
              {evolutionTrimestre > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <p className={`text-xl font-bold ${evolutionTrimestre > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {evolutionTrimestre > 0 ? '+' : ''}{formatPercentage(evolutionTrimestre)}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Seuil minimal</p>
            <p className="text-xl font-bold text-gray-900">{formatPercentage(15, 1)}</p>
            <p className="text-xs text-gray-500 mt-1">Réglementation microfinance</p>
          </div>
        </div>
      </div>

      {/* Section 2 : Interprétation */}
      <ReportStatusBox status={messageType} message={message} />

      {/* Section 3 : Recommandations (si nécessaire) */}
      {statut !== 'Conforme' && (
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <h4 className="text-base font-bold text-blue-900 mb-3">📋 Actions recommandées</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            {statut === 'Critique' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">•</span>
                  <span>Suspendre temporairement les nouveaux décaissements de prêts importants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">•</span>
                  <span>Mobiliser des lignes de crédit d'urgence ou vendre des actifs liquides</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">•</span>
                  <span>Intensifier le recouvrement des prêts en cours</span>
                </li>
              </>
            )}
            {statut === 'À surveiller' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">•</span>
                  <span>Augmenter progressivement les réserves liquides via l'épargne</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">•</span>
                  <span>Limiter les décaissements aux prêts prioritaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">•</span>
                  <span>Surveiller quotidiennement l'évolution de la trésorerie</span>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </ReportDocument>
  );
}