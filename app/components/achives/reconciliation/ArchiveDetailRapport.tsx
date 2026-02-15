'use client';

import React from 'react';
import { FaArrowLeft, FaUser, FaClock, FaCheckCircle, FaExclamationTriangle, FaLock, FaFilePdf, FaPrint, FaChartLine } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface ArchiveDetailRapportProps {
  archiveId?: string;
}

export default function ArchiveDetailRapport({ archiveId = 'ARC_20260201_00002' }: ArchiveDetailRapportProps) {
  const router = useRouter();

  // Données mockées de l'archive rapport
  const archive = {
    id: 'ARC_20260201_00002',
    category: 'Réglementaire',
    type: 'Rapport de liquidité',
    date: new Date('2026-02-01'),
    createdAt: new Date('2026-02-01T09:00:00'),
    
    // Système automatique
    employeeId: 'system',
    employeeName: 'Système',
    employeeRole: 'Génération automatique',
    
    // Statut
    isDeleted: false,
    isLocked: true,
    
    // Résumé
    summary: 'Rapport de liquidité - Janvier 2026 - Statut: Conforme',
    
    // Période
    periode: 'Janvier 2026',
    
    // Données du rapport
    reportData: {
      // Métriques principales
      liquiditeDisponible: 1200000,
      totalDepotsMembres: 6500000,
      ratioLiquidite: 18.5, // %
      
      // Évolution
      evolutionTrimestre: 2.3, // %
      evolutionMensuelle: 0.8, // %
      
      // Seuils
      seuilMinimal: 15, // %
      seuilOptimal: 20, // %
      
      // Statut
      status: 'Conforme',
      
      // Détail liquidité
      liquiditeDetail: {
        cashEnCaisse: 450000,
        comptesBancaires: 750000,
        placements3Mois: 0
      },
      
      // Recommandations
      recommendations: [
        'Maintenir le niveau actuel de liquidité',
        'Surveiller l\'évolution des dépôts dans les 30 prochains jours',
        'Pas d\'action corrective nécessaire'
      ],
      
      // Métriques historiques (3 derniers mois)
      historique: [
        { mois: 'Novembre 2025', ratio: 16.8, status: 'Conforme' },
        { mois: 'Décembre 2025', ratio: 17.2, status: 'Conforme' },
        { mois: 'Janvier 2026', ratio: 18.5, status: 'Conforme' }
      ]
    },
    
    // Métadonnées réglementaires
    regulatoryMetadata: {
      reportingAuthority: 'Banque de la République d\'Haïti (BRH)',
      regulatoryFramework: 'Directive microfinance 2024-03',
      submissionDeadline: new Date('2026-02-15'),
      submittedAt: new Date('2026-02-01T09:00:00'),
      submittedBy: 'Système automatique',
      validatedBy: 'Marie Tremblay',
      validatedAt: new Date('2026-02-01T14:30:00')
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-HT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' G';
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1) + ' %';
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('fr-CA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExportPDF = () => {
    console.log('Export PDF du rapport:', archive.id);
    alert('📄 Export PDF du rapport réglementaire\n\nGénération du document officiel avec:\n• Toutes les métriques\n• Graphiques d\'évolution\n• Statut de conformité\n• Pour transmission à la BRH');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Conforme':
        return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', icon: <FaCheckCircle className="text-green-600" /> };
      case 'À surveiller':
        return { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', icon: <FaExclamationTriangle className="text-orange-600" /> };
      case 'Critique':
        return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', icon: <FaExclamationTriangle className="text-red-600" /> };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-500', text: 'text-gray-700', icon: <FaClock className="text-gray-600" /> };
    }
  };

  const statusStyle = getStatusColor(archive.reportData.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <FaArrowLeft />
            Retour aux archives
          </button>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📋</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{archive.type}</h1>
                    <p className="text-sm text-gray-600">Archive #{archive.id} · {archive.periode}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {archive.isLocked && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <FaLock className="text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Archive verrouillée</span>
                  </div>
                )}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  <FaPrint />
                  Imprimer
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  <FaFilePdf />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t-2 border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Catégorie</p>
                <p className="font-semibold text-gray-900">{archive.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Période</p>
                <p className="font-semibold text-gray-900">{archive.periode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Généré le</p>
                <p className="font-semibold text-gray-900">
                  {archive.date.toLocaleDateString('fr-CA')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Archive créée le</p>
                <p className="font-semibold text-gray-900">
                  {formatDateTime(archive.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statut de conformité */}
        <div className={`rounded-xl border-2 p-6 mb-6 ${statusStyle.bg} ${statusStyle.border}`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{statusStyle.icon}</div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${statusStyle.text}`}>
                Statut: {archive.reportData.status}
              </h2>
              <p className="text-gray-700 mt-1">
                Le ratio de liquidité est {archive.reportData.status === 'Conforme' ? 'conforme' : 'non conforme'} aux exigences réglementaires
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Ratio actuel</p>
              <p className={`text-4xl font-bold ${statusStyle.text}`}>
                {formatPercentage(archive.reportData.ratioLiquidite)}
              </p>
            </div>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-blue-700 font-medium">Liquidité disponible</p>
                <p className="text-xs text-gray-500 mt-1">Cash + Banque</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {formatCurrency(archive.reportData.liquiditeDisponible)}
            </p>
            
            {/* Détail */}
            <div className="mt-4 pt-4 border-t border-blue-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cash en caisse:</span>
                <span className="font-semibold">{formatCurrency(archive.reportData.liquiditeDetail.cashEnCaisse)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Comptes bancaires:</span>
                <span className="font-semibold">{formatCurrency(archive.reportData.liquiditeDetail.comptesBancaires)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-purple-700 font-medium">Total dépôts membres</p>
                <p className="text-xs text-gray-500 mt-1">Engagements</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
            <p className="text-3xl font-bold text-purple-900">
              {formatCurrency(archive.reportData.totalDepotsMembres)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-green-700 font-medium">Ratio de liquidité</p>
                <p className="text-xs text-gray-500 mt-1">Seuil min: {formatPercentage(archive.reportData.seuilMinimal)}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
            <p className="text-3xl font-bold text-green-900">
              {formatPercentage(archive.reportData.ratioLiquidite)}
            </p>
            
            {/* Évolution */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-center gap-2">
                <FaChartLine className="text-green-600" />
                <span className="text-sm text-gray-600">Évolution 3 mois:</span>
                <span className="font-bold text-green-700">+{formatPercentage(archive.reportData.evolutionTrimestre)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Historique 3 mois */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Évolution Historique (3 derniers mois)</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Mois</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Ratio de liquidité</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Statut</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Tendance</th>
                </tr>
              </thead>
              <tbody>
                {archive.reportData.historique.map((row, index) => {
                  const previousRatio = index > 0 ? archive.reportData.historique[index - 1].ratio : null;
                  const evolution = previousRatio ? row.ratio - previousRatio : null;
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{row.mois}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-xl font-bold text-blue-900">{formatPercentage(row.ratio)}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                          <FaCheckCircle />
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {evolution !== null && (
                          <span className={`font-bold ${evolution > 0 ? 'text-green-600' : evolution < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {evolution > 0 ? '↗' : evolution < 0 ? '↘' : '→'} {evolution !== 0 && formatPercentage(Math.abs(evolution))}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommandations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Recommandations</h2>
          
          <ul className="space-y-3">
            {archive.reportData.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Métadonnées réglementaires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informations Réglementaires</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Autorité de contrôle</p>
                <p className="font-semibold text-gray-900">{archive.regulatoryMetadata.reportingAuthority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Cadre réglementaire</p>
                <p className="font-semibold text-gray-900">{archive.regulatoryMetadata.regulatoryFramework}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Date limite soumission</p>
                <p className="font-semibold text-gray-900">
                  {archive.regulatoryMetadata.submissionDeadline.toLocaleDateString('fr-CA')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Soumis le</p>
                <p className="font-semibold text-gray-900">{formatDateTime(archive.regulatoryMetadata.submittedAt)}</p>
                <p className="text-xs text-gray-500">Par: {archive.regulatoryMetadata.submittedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Validé le</p>
                <p className="font-semibold text-gray-900">{formatDateTime(archive.regulatoryMetadata.validatedAt)}</p>
                <p className="text-xs text-gray-500">Par: {archive.regulatoryMetadata.validatedBy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Traçabilité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaClock className="text-blue-600" />
            Traçabilité Complète
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                🤖
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Génération automatique</p>
                <p className="text-sm text-gray-600">Le {formatDateTime(archive.createdAt)} par le système</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {archive.regulatoryMetadata.validatedBy.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Validation: {archive.regulatoryMetadata.validatedBy}</p>
                <p className="text-sm text-gray-600">Le {formatDateTime(archive.regulatoryMetadata.validatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Avertissement immuabilité */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <FaLock className="text-red-600 text-xl mt-1 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-bold mb-2">🔒 Rapport Réglementaire Officiel - Archive Immuable</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Ce rapport a été généré automatiquement et validé par un superviseur</li>
                <li>Il fait partie des obligations réglementaires vis-à-vis de la BRH</li>
                <li>Aucune modification n'est possible - l'archive est définitivement verrouillée</li>
                <li>Ce document fait foi en cas d'inspection ou d'audit externe</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}