// components/rapports/RapportSolvabilite.tsx
'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import ReportDocument, { ReportRow, ReportDivider, ReportStatusBox } from './ReportDocument';
import { formatCurrency, formatPercentage, KpiData } from '@/types/kpis';

interface Props {
  data: KpiData;
}

export default function RapportSolvabilite({ data }: Props) {
  // Calculs
  const ratioSolvabilite = (data.capitalPropre / data.actifsponderes) * 100;
  const seuilReglementaire = 10; // 10%
  
  // Déterminer le statut
  const statut: 'Conforme' | 'Non conforme' = ratioSolvabilite >= seuilReglementaire ? 'Conforme' : 'Non conforme';
  
  let message: string;
  let messageType: 'success' | 'error';

  if (statut === 'Conforme') {
    message = `Le ratio de solvabilité de ${ratioSolvabilite.toFixed(1)}% dépasse le seuil réglementaire minimal de ${seuilReglementaire}%. La caisse dispose d'un coussin de capital suffisant pour absorber les pertes potentielles et garantir sa stabilité financière.`;
    messageType = 'success';
  } else {
    message = `ATTENTION : Le ratio de solvabilité de ${ratioSolvabilite.toFixed(1)}% est INFÉRIEUR au seuil réglementaire de ${seuilReglementaire}%. La caisse doit immédiatement renforcer ses fonds propres pour se conformer à la réglementation et assurer sa pérennité.`;
    messageType = 'error';
  }

  const handleExportPDF = () => {
    console.log('Export PDF - Rapport de Solvabilité');
    alert('Export PDF en cours de développement...');
  };

  const handleExportExcel = () => {
    console.log('Export Excel - Rapport de Solvabilité');
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
          label="Capital propre" 
          value={formatCurrency(data.capitalPropre)}
          description="Fonds propres de la caisse (capital + réserves + résultats)"
        />
        
        <ReportRow 
          label="Actifs pondérés" 
          value={formatCurrency(data.actifsponderes)}
          description="Total du portefeuille de prêts et investissements"
        />
        
        <ReportDivider />
        
        <ReportRow 
          label="Ratio de solvabilité" 
          value={formatPercentage(ratioSolvabilite)}
          highlight
        />
        
        <div className="mt-4 bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Seuil réglementaire minimal</p>
              <p className="text-xl font-bold text-gray-900">{formatPercentage(seuilReglementaire, 1)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Écart vs seuil</p>
              <p className={`text-xl font-bold ${ratioSolvabilite >= seuilReglementaire ? 'text-green-700' : 'text-red-700'}`}>
                {ratioSolvabilite >= seuilReglementaire ? '+' : ''}{formatPercentage(ratioSolvabilite - seuilReglementaire, 1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 : Interprétation */}
      <ReportStatusBox status={messageType} message={message} />

      {/* Section 3 : Explications */}
      <div className="mt-6 bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
        <h4 className="text-base font-bold text-slate-900 mb-3">📖 Qu'est-ce que le ratio de solvabilité ?</h4>
        <p className="text-sm text-slate-700 leading-relaxed mb-3">
          Le ratio de solvabilité mesure la capacité de la caisse à absorber les pertes avec ses fonds propres. 
          Un ratio de {formatPercentage(ratioSolvabilite)} signifie que pour chaque 100 G de prêts accordés, 
          la caisse dispose de {ratioSolvabilite.toFixed(1)} G de capital propre pour couvrir les pertes éventuelles.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          La réglementation haïtienne impose un minimum de {seuilReglementaire}% pour garantir la solidité 
          des institutions de microfinance et protéger les épargnants.
        </p>
      </div>

      {/* Section 4 : Recommandations (si non conforme) */}
      {statut === 'Non conforme' && (
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-5">
          <h4 className="text-base font-bold text-red-900 mb-3">🚨 Actions correctives URGENTES</h4>
          <ul className="space-y-2 text-sm text-red-800">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">1.</span>
              <span><strong>Augmenter le capital :</strong> Solliciter des apports des membres ou des investisseurs externes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">2.</span>
              <span><strong>Réduire les actifs pondérés :</strong> Limiter l'octroi de nouveaux prêts jusqu'à conformité</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">3.</span>
              <span><strong>Constituer des réserves :</strong> Affecter une part plus importante des bénéfices aux réserves statutaires</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">4.</span>
              <span><strong>Informer l'autorité :</strong> Notifier la BRH et soumettre un plan de redressement sous 30 jours</span>
            </li>
          </ul>
        </div>
      )}

      {/* Section 5 : Bonnes pratiques (si conforme) */}
      {statut === 'Conforme' && ratioSolvabilite >= 15 && (
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-5">
          <h4 className="text-base font-bold text-green-900 mb-3">✅ Excellente performance !</h4>
          <p className="text-sm text-green-800 leading-relaxed">
            Votre ratio de solvabilité dépasse largement le minimum réglementaire. Cette marge de sécurité 
            vous permet d'absorber des chocs financiers et de poursuivre votre développement en toute sérénité. 
            Continuez à maintenir ce niveau de capitalisation.
          </p>
        </div>
      )}
    </ReportDocument>
  );
}