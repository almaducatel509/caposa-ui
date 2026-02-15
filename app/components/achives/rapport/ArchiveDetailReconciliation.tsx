'use client';

import React from 'react';
import { FaArrowLeft, FaUser, FaClock, FaCheckCircle, FaExclamationTriangle, FaLock, FaFilePdf, FaPrint } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface ArchiveDetailReconciliationProps {
  archiveId?: string;
}

export default function ArchiveDetailReconciliation({ archiveId = 'ARC_20260215_00001' }: ArchiveDetailReconciliationProps) {
  const router = useRouter();

  // Données mockées de l'archive
  const archive = {
    id: 'ARC_20260215_00001',
    category: 'Opérationnel',
    type: 'Réconciliation de caisse',
    date: new Date('2026-02-15'),
    createdAt: new Date('2026-02-15T17:45:23'),
    
    // Employé
    employeeId: 'emp_001',
    employeeName: 'Jean Dupont',
    employeeRole: 'Caissier',
    employeeEmail: 'jean.dupont@caisse.com',
    
    // Statut
    isDeleted: false,
    isLocked: true,
    
    // Résumé
    summary: 'Réconciliation journalière - Écart de -30.00 G expliqué',
    
    // Données de réconciliation
    reconciliationData: {
      reportId: 'rpt_20260213',
      openingCash: 2000.00,
      theoreticalCash: 7130.00,
      actualCash: 7100.00,
      discrepancy: -30.00,
      status: 'balanced',
      
      // Signatures
      declaredBy: 'Jean Dupont',
      declaredAt: new Date('2026-02-15T17:00:00'),
      reviewedBy: 'Marie Tremblay',
      reviewedAt: new Date('2026-02-15T17:30:00'),
      approvedBy: null,
      approvedAt: null,
      
      // Écarts détaillés
      discrepancies: [
        {
          source: 'Cash en caisse',
          expected: 7130.00,
          actual: 7100.00,
          difference: -30.00,
          status: 'pending',
          explanation: 'En cours de vérification'
        },
        {
          source: 'Bordereau BDP-2026-002',
          expected: 2500.00,
          actual: 2480.00,
          difference: -20.00,
          status: 'explained',
          explanation: 'Frais bancaire de 20$ déduit automatiquement par la banque. Confirmé par email de la Banque Nationale.'
        },
        {
          source: 'Agent Julie Leblanc',
          expected: 2200.00,
          actual: 2150.00,
          difference: -50.00,
          status: 'explained',
          explanation: 'Erreur de frappe sur reçu #478. Montant corrigé dans le système.'
        }
      ],
      
      // Notes du superviseur
      supervisorNotes: [
        {
          author: 'Marie Tremblay',
          timestamp: new Date('2026-02-15T17:30:00'),
          content: 'Transaction tx_003: Membre a payé avec un billet de 100$ déchiré, remplacé par billet neuf. Billet abîmé envoyé à la banque.'
        },
        {
          author: 'Marie Tremblay',
          timestamp: new Date('2026-02-15T17:45:00'),
          content: 'Agent Julie Leblanc: Écart de 50$ expliqué - erreur de frappe sur reçu #478. Montant corrigé.'
        }
      ]
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
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
    console.log('Export PDF de l\'archive:', archive.id);
    alert('📄 Export PDF de l\'archive\n\nGénération du rapport PDF avec:\n• Toutes les données de réconciliation\n• Horodatage complet\n• Signatures électroniques\n• Pour audit externe');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
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
                  <span className="text-3xl">⚙️</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Détails de l'Archive</h1>
                    <p className="text-sm text-gray-600">Archive #{archive.id}</p>
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

            {/* Métadonnées de l'archive */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t-2 border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Catégorie</p>
                <p className="font-semibold text-gray-900">{archive.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Type</p>
                <p className="font-semibold text-gray-900">{archive.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Date opération</p>
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

        {/* Traçabilité employé */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Traçabilité Employé
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {archive.employeeName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{archive.employeeName}</p>
                  <p className="text-sm text-gray-600">{archive.employeeRole}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Employé:</span>
                  <span className="font-mono font-semibold">{archive.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{archive.employeeEmail}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaClock className="text-gray-600" />
                Horodatage Complet
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Archive créée:</span>
                  <span className="font-semibold font-mono">{formatDateTime(archive.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-semibold text-green-700">✓ Verrouillée</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modifiable:</span>
                  <span className="font-semibold text-red-700">✗ Jamais</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">📝 Résumé de l'opération</h2>
          <p className="text-gray-700 leading-relaxed">{archive.summary}</p>
        </div>

        {/* Données de réconciliation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Données de Réconciliation</h2>
          
          {/* Montants */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Cash d'ouverture</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(archive.reconciliationData.openingCash)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700 mb-1">Cash théorique</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(archive.reconciliationData.theoreticalCash)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Cash réel compté</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(archive.reconciliationData.actualCash)}
              </p>
            </div>
          </div>

          {/* Écart total */}
          <div className={`rounded-xl p-5 border-2 mb-6 ${
            archive.reconciliationData.discrepancy === 0 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {archive.reconciliationData.discrepancy === 0 ? (
                  <FaCheckCircle className="text-green-600 text-2xl" />
                ) : (
                  <FaExclamationTriangle className="text-red-600 text-2xl" />
                )}
                <div>
                  <p className="font-bold text-gray-900">Écart Total</p>
                  <p className="text-sm text-gray-600">
                    {archive.reconciliationData.discrepancy === 0 
                      ? 'Aucun écart - Correspondance parfaite' 
                      : 'Écart détecté - Voir détails ci-dessous'}
                  </p>
                </div>
              </div>
              <p className={`text-3xl font-bold ${
                archive.reconciliationData.discrepancy === 0 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>
                {formatCurrency(Math.abs(archive.reconciliationData.discrepancy))}
              </p>
            </div>
          </div>

          {/* Tableau des écarts */}
          {archive.reconciliationData.discrepancy !== 0 && (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Détail des écarts</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Source</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-700">Attendu</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-700">Réel</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-700">Écart</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archive.reconciliationData.discrepancies.map((disc, index) => (
                      <tr key={index} className={`border-b border-gray-100 ${
                        disc.status === 'pending' ? 'bg-orange-50' : 'bg-green-50'
                      }`}>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{disc.source}</p>
                            {disc.explanation && (
                              <p className="text-xs text-gray-600 mt-1">📝 {disc.explanation}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold">{formatCurrency(disc.expected)}</td>
                        <td className="py-4 px-4 text-right font-semibold">{formatCurrency(disc.actual)}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-bold text-lg ${
                            disc.difference === 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(disc.difference)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {disc.status === 'explained' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
                              <FaCheckCircle />
                              Expliqué
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-bold">
                              <FaClock />
                              En attente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Signatures et validation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">✍️ Signatures et Validation</h2>
          
          <div className="space-y-4">
            {/* Déclaré par */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-500">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-blue-600 text-2xl" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Déclaré par: {archive.reconciliationData.declaredBy}</p>
                  <p className="text-sm text-gray-600">
                    Signé le {formatDateTime(archive.reconciliationData.declaredAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Révisé par */}
            {archive.reconciliationData.reviewedBy && (
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-500">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 text-2xl" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Révisé par: {archive.reconciliationData.reviewedBy}</p>
                    <p className="text-sm text-gray-600">
                      Signé le {formatDateTime(archive.reconciliationData.reviewedAt!)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes du superviseur */}
        {archive.reconciliationData.supervisorNotes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Notes du Superviseur</h2>
            
            <div className="space-y-3">
              {archive.reconciliationData.supervisorNotes.map((note, index) => (
                <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                      {note.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-gray-900">{note.author}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(note.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-700">{note.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avertissement immuabilité */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <FaLock className="text-red-600 text-xl mt-1 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-bold mb-2">🔒 Archive Immuable - Garantie d'Intégrité</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cette archive ne peut jamais être modifiée ou supprimée définitivement</li>
                <li>Seule la direction peut la désactiver (soft delete) avec justification</li>
                <li>Toutes les données sont horodatées et traçables pour audit externe</li>
                <li>Ce document fait foi en cas d'inspection réglementaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}