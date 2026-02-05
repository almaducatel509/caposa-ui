// components/rapports/RapportEndettement.tsx
'use client';

import React from 'react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import ReportDocument, { ReportRow, ReportDivider, ReportSection, ReportStatusBox } from './ReportDocument';
import { formatCurrency, formatPercentage, KpiData } from '@/types/kpis';

interface Props {
  data: KpiData;
}

export default function RapportEndettementMembre({ data }: Props) {
  // Calculs
  const ratioEndettementMoyen = data.ratioEndettement; // %
  
  // Mock data pour la répartition (en production, ces données viendraient de la base)
  const repartitionEndettement = {
    tranche0_25: 45, // % de membres
    tranche25_35: 30,
    tranche35_50: 18,
    tranche50Plus: 7,
  };
  
  // Évolution mensuelle (mock) 'Conforme' | 'À surveiller' | 'Critique' | 'Non conforme' | 'Stable' | 'À risque';
  const evolutionMensuelle = -0.8; // -0.8% (amélioration)
  
  // Déterminer le statut
  let statut: 'Conforme' | 'À surveiller' | 'Critique';
  let message: string;
  let messageType: 'success' | 'warning' | 'error';

  if (ratioEndettementMoyen <= 30) {
    statut = 'Conforme';
    message = `Le ratio d'endettement moyen de ${ratioEndettementMoyen.toFixed(1)}% est excellent. Les membres disposent d'une capacité de remboursement confortable et le risque de surendettement est faible.`;
    messageType = 'success';
  } else if (ratioEndettementMoyen <= 40) {
    statut = 'À surveiller';
    message = `Le ratio d'endettement moyen de ${ratioEndettementMoyen.toFixed(1)}% nécessite une vigilance accrue. Certains membres approchent leur limite d'endettement. Renforcez l'analyse de capacité de remboursement avant tout nouveau prêt.`;
    messageType = 'warning';
  } else {
    statut = 'Critique';
    message = `ATTENTION : Le ratio d'endettement moyen de ${ratioEndettementMoyen.toFixed(1)}% est ALARMANT. Un taux élevé de membres sont surendettés, ce qui augmente considérablement le risque de défaut de paiement. Des mesures correctives immédiates sont nécessaires.`;
    messageType = 'error';
  }

  const handleExportPDF = () => {
    console.log('Export PDF - Rapport Endettement des Membres');
    alert('Export PDF en cours de développement...');
  };

  const handleExportExcel = () => {
    console.log('Export Excel - Rapport Endettement des Membres');
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
          label="Ratio d'endettement moyen" 
          value={formatPercentage(ratioEndettementMoyen)}
          description="Moyenne des dettes/revenus de tous les membres actifs"
          highlight
        />
        
        <ReportDivider />
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
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
          
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Seuil recommandé</p>
            <p className="text-xl font-bold text-gray-900">{formatPercentage(35, 1)}</p>
            <p className="text-xs text-gray-500 mt-1">Bonnes pratiques microfinance</p>
          </div>
        </div>
      </div>

      {/* Section 2 : Répartition des membres par tranche d'endettement */}
      <ReportSection title="Répartition des membres par niveau d'endettement">
        <div className="space-y-4">
          {/* 0-25% - Sain */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">0-25% (Sain)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{repartitionEndettement.tranche0_25}% des membres</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${repartitionEndettement.tranche0_25}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{repartitionEndettement.tranche0_25}%</span>
              </div>
            </div>
          </div>

          {/* 25-35% - Acceptable */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">25-35% (Acceptable)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{repartitionEndettement.tranche25_35}% des membres</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${repartitionEndettement.tranche25_35}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{repartitionEndettement.tranche25_35}%</span>
              </div>
            </div>
          </div>

          {/* 35-50% - À risque */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">35-50% (À risque)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{repartitionEndettement.tranche35_50}% des membres</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${repartitionEndettement.tranche35_50}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{repartitionEndettement.tranche35_50}%</span>
              </div>
            </div>
          </div>

          {/* 50%+ - Surendetté */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">&gt;50% (Surendetté)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{repartitionEndettement.tranche50Plus}% des membres</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                style={{ width: `${repartitionEndettement.tranche50Plus}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{repartitionEndettement.tranche50Plus}%</span>
              </div>
            </div>
          </div>
        </div>
      </ReportSection>

      {/* Section 3 : Interprétation */}
      <ReportStatusBox status={messageType} message={message} />

      {/* Section 4 : Explications */}
      <div className="mt-6 bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
        <h4 className="text-base font-bold text-slate-900 mb-3">📖 Qu'est-ce que le ratio d'endettement ?</h4>
        <p className="text-sm text-slate-700 leading-relaxed mb-3">
          Le ratio d'endettement mesure le poids des remboursements de prêts dans les revenus mensuels d'un membre. 
          Un ratio de {ratioEndettementMoyen.toFixed(1)}% signifie qu'en moyenne, les membres consacrent 
          {ratioEndettementMoyen.toFixed(1)}% de leurs revenus au remboursement de leurs dettes.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong>Seuils recommandés :</strong> Un ratio inférieur à 35% est considéré comme sain. 
          Au-delà de 40%, le risque de défaut de paiement augmente significativement, car les membres 
          ont peu de marge pour faire face aux imprévus.
        </p>
      </div>

      {/* Section 5 : Actions recommandées */}
      {statut !== 'Conforme' && (
        <div className={`mt-6 rounded-xl p-5 border-2 ${
          statut === 'Critique' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <h4 className={`text-base font-bold mb-3 ${
            statut === 'Critique' ? 'text-red-900' : 'text-orange-900'
          }`}>
            {statut === 'Critique' ? '🚨 Actions correctives URGENTES' : '⚠️ Actions recommandées'}
          </h4>
          <ul className={`space-y-3 text-sm ${
            statut === 'Critique' ? 'text-red-900' : 'text-orange-900'
          }`}>
            <li className="flex items-start gap-3">
              <span className="font-bold mt-0.5">1.</span>
              <div>
                <strong>Réviser les critères d'octroi :</strong>
                <p className={`mt-1 ${statut === 'Critique' ? 'text-red-800' : 'text-orange-800'}`}>
                  Ne plus accorder de prêts aux membres dont le ratio dépasse 35%, sauf cas exceptionnels validés par le comité
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold mt-0.5">2.</span>
              <div>
                <strong>Analyse approfondie de capacité :</strong>
                <p className={`mt-1 ${statut === 'Critique' ? 'text-red-800' : 'text-orange-800'}`}>
                  Vérifier systématiquement les revenus réels (pas seulement déclarés) avant tout nouveau prêt
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold mt-0.5">3.</span>
              <div>
                <strong>Étalement des remboursements :</strong>
                <p className={`mt-1 ${statut === 'Critique' ? 'text-red-800' : 'text-orange-800'}`}>
                  Proposer des restructurations de prêts pour alléger les mensualités des membres surendettés (ratio &gt;40%)
                </p>
              </div>
            </li>
            {statut === 'Critique' && (
              <>
                <li className="flex items-start gap-3">
                  <span className="font-bold mt-0.5">4.</span>
                  <div>
                    <strong>Formation des membres :</strong>
                    <p className="mt-1 text-red-800">
                      Organiser des ateliers sur la gestion budgétaire et les dangers du surendettement
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold mt-0.5">5.</span>
                  <div>
                    <strong>Audit des dossiers à risque :</strong>
                    <p className="mt-1 text-red-800">
                      Identifier les membres avec ratio &gt;50% et mettre en place des plans de désendettement personnalisés
                    </p>
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Section 6 : Message de félicitations (si sain) */}
      {statut === 'Conforme' && (
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
          <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-green-900 mb-2">
            Excellente gestion de l'endettement ! 🎉
          </h4>
          <p className="text-green-800 leading-relaxed">
            Le niveau d'endettement des membres est sain et maîtrisé. Vos politiques de crédit protègent efficacement 
            vos membres du surendettement tout en leur permettant d'accéder au financement. Continuez ce travail rigoureux !
          </p>
        </div>
      )}
    </ReportDocument>
  );
}