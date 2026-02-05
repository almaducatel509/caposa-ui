// components/rapports/RapportConformite.tsx
'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import ReportDocument, { ReportRow, ReportSection, ReportStatusBox } from './ReportDocument';
import {  KpiData } from '@/types/kpis';

interface Props {
  data: KpiData;
}

// Fonction pour générer les alertes (réutilise la logique existante)
interface Alert {
  type: 'critique' | 'alerte';
  title: string;
  description: string;
  action: string;
}

function generateAlertes(data: KpiData): Alert[] {
  const alertes: Alert[] = [];

  if (data.tauxRecouvrement < 95) {
    alertes.push({
      type: data.tauxRecouvrement < 90 ? 'critique' : 'alerte',
      title: 'Taux de remboursement < 95 %',
      description: `Taux actuel : ${data.tauxRecouvrement.toFixed(1)}%`,
      action: 'Intensifier le suivi des remboursements et contacter les retardataires'
    });
  }

  if (data.ratioLiquidite < 1.5) {
    alertes.push({
      type: data.ratioLiquidite < 1.2 ? 'critique' : 'alerte',
      title: 'Ratio de liquidité < 1.5',
      description: `Ratio actuel : ${data.ratioLiquidite.toFixed(2)}`,
      action: 'Augmenter les réserves liquides et limiter les décaissements'
    });
  }

  if (data.ratioCreancesDouteuses > 5) {
    alertes.push({
      type: data.ratioCreancesDouteuses > 8 ? 'critique' : 'alerte',
      title: 'Prêts en souffrance > 5 %',
      description: `Taux actuel : ${data.ratioCreancesDouteuses.toFixed(1)}%`,
      action: 'Analyser les prêts à risque et mettre en place des plans de recouvrement'
    });
  }

  if (data.ratioEndettement > 35) {
    alertes.push({
      type: data.ratioEndettement > 40 ? 'critique' : 'alerte',
      title: 'Endettement membres > 35 %',
      description: `Ratio actuel : ${data.ratioEndettement.toFixed(1)}%`,
      action: 'Réviser les critères d\'octroi et limiter les prêts aux membres à risque'
    });
  }

  if (data.reservesObligatoires < 10) {
    alertes.push({
      type: data.reservesObligatoires < 8 ? 'critique' : 'alerte',
      title: 'Réserves obligatoires < 10 %',
      description: `Taux actuel : ${data.reservesObligatoires.toFixed(1)}%`,
      action: 'Constituer les réserves conformément à la réglementation'
    });
  }

  if (data.couvertureRisques < 90) {
    alertes.push({
      type: data.couvertureRisques < 80 ? 'critique' : 'alerte',
      title: 'Couverture des risques < 90 %',
      description: `Taux actuel : ${data.couvertureRisques.toFixed(1)}%`,
      action: 'Augmenter les provisions pour risques'
    });
  }

  if (data.tauxActiviteMembres < 85) {
    alertes.push({
      type: data.tauxActiviteMembres < 75 ? 'critique' : 'alerte',
      title: 'Activité des membres < 85 %',
      description: `Taux actuel : ${data.tauxActiviteMembres.toFixed(1)}%`,
      action: 'Campagne de réactivation des membres inactifs'
    });
  }

  return alertes;
}

export default function RapportConformite({ data }: Props) {
  const alertes = generateAlertes(data);
  const alertesCritiques = alertes.filter(a => a.type === 'critique');
  const seuilsDepasses = alertes.map(a => a.title);
  const actionsRecommandees = alertes.map(a => a.action);

  // Déterminer le statut global
  let statut: 'Conforme' | 'À surveiller' | 'Critique';
  let messageType: 'success' | 'warning' | 'error';
  let message: string;

  if (alertesCritiques.length > 0) {
    statut = 'Critique';
    messageType = 'error';
    message = `${alertesCritiques.length} indicateur(s) critique(s) détecté(s). Des actions immédiates sont nécessaires pour ramener la caisse en conformité réglementaire.`;
  } else if (alertes.length > 0) {
    statut = 'À surveiller';
    messageType = 'warning';
    message = `${alertes.length} indicateur(s) nécessite(nt) une surveillance. Bien que la situation ne soit pas critique, des améliorations sont recommandées.`;
  } else {
    statut = 'Conforme';
    messageType = 'success';
    message = 'Tous les indicateurs sont dans les seuils réglementaires. La caisse démontre une gestion saine et conforme aux exigences.';
  }

  const handleExportPDF = () => {
    console.log('Export PDF - Rapport de Conformité');
    alert('Export PDF en cours de développement...');
  };

  const handleExportExcel = () => {
    console.log('Export Excel - Rapport de Conformité');
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
      <ReportSection title="Vue d'ensemble">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
            <p className="text-sm text-gray-600 mb-1">Total alertes</p>
            <p className="text-3xl font-bold text-gray-900">{alertes.length}</p>
          </div>
          
          <div className={`rounded-lg p-4 border-2 ${
            alertesCritiques.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <p className="text-sm text-gray-600 mb-1">Alertes critiques</p>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold ${
                alertesCritiques.length > 0 ? 'text-red-900' : 'text-green-900'
              }`}>
                {alertesCritiques.length}
              </p>
              {alertesCritiques.length > 0 ? (
                <XCircle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Alertes modérées</p>
            <p className="text-3xl font-bold text-blue-900">
              {alertes.length - alertesCritiques.length}
            </p>
          </div>
        </div>
      </ReportSection>

      {/* Section 2 : Statut global */}
      <ReportStatusBox status={messageType} message={message} />

      {/* Section 3 : Seuils dépassés */}
      {seuilsDepasses.length > 0 && (
        <ReportSection title="Seuils dépassés">
          <div className="space-y-3">
            {alertes.map((alerte, index) => (
              <div 
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                  alerte.type === 'critique' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="mt-1">
                  {alerte.type === 'critique' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${
                    alerte.type === 'critique' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {alerte.title}
                  </p>
                  <p className={`text-sm mt-1 ${
                    alerte.type === 'critique' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {alerte.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Section 4 : Actions recommandées */}
      {actionsRecommandees.length > 0 && (
        <ReportSection title="Actions recommandées">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <ul className="space-y-3">
              {actionsRecommandees.map((action, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-blue-900">
                  <span className="font-bold text-blue-600 mt-0.5">{index + 1}.</span>
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </ReportSection>
      )}

      {/* Section 5 : Message de félicitations (si tout est conforme) */}
      {alertes.length === 0 && (
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-green-900 mb-2">
            Excellente conformité ! 🎉
          </h4>
          <p className="text-green-800 leading-relaxed">
            Tous les indicateurs respectent les seuils réglementaires. La caisse fait preuve d'une 
            gestion exemplaire et conforme aux meilleures pratiques de la microfinance.
          </p>
        </div>
      )}
    </ReportDocument>
  );
}