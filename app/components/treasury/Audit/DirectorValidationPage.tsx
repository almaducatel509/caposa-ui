'use client';
import React, { useState } from 'react';
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaUndo, FaFileExport, FaClock, FaUser } from 'react-icons/fa';

interface DailyReport {
  id: string;
  date: string;
  status: 'open' | 'submitted' | 'reviewed' | 'approved' | 'locked';
  openingCash: number;
  theoreticalCash: number;
  actualCash: number;
  totalDiscrepancy: number;
  openedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  reviewedAt?: string;
  approvedAt?: string;
  pendingDiscrepancies: number;
  explainedDiscrepancies: number;
  resolvedDiscrepancies: number;
}

interface ValidationAction {
  type: 'approve' | 'reject';
  reason?: string;
}

const DirectorValidationPage: React.FC = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [action, setAction] = useState<ValidationAction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Données mockées
  const report: DailyReport = {
    id: 'rpt_20260213',
    date: '2026-02-13',
    status: 'reviewed',
    openingCash: 2000.00,
    theoreticalCash: 7130.00,
    actualCash: 7100.00,
    totalDiscrepancy: -30.00,
    openedBy: 'Jean Dupont',
    reviewedBy: 'Marie Tremblay',
    reviewedAt: '2026-02-13T17:45:00',
    pendingDiscrepancies: 0,
    explainedDiscrepancies: 3,
    resolvedDiscrepancies: 1
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-CA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = () => {
    setAction({ type: 'approve' });
    setShowConfirmModal(true);
  };

  const handleReject = () => {
    setAction({ type: 'reject' });
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (action?.type === 'approve') {
      console.log('✅ Approuver et verrouiller la journée');
      // TODO: API call to approve and lock
    } else if (action?.type === 'reject') {
      console.log('❌ Demander correction:', rejectionReason);
      // TODO: API call to reject with reason
    }
    setShowConfirmModal(false);
    setAction(null);
    setRejectionReason('');
  };

  const canApprove = report.pendingDiscrepancies === 0;

  return (
    <div className="w-full p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Validation Directeur</h1>
            <p className="text-indigo-100 text-lg">
              Réconciliation du {new Date(report.date).toLocaleDateString('fr-CA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
            <p className="text-sm text-indigo-100 mb-1">Statut</p>
            <p className="text-xl font-bold">En attente de validation</p>
          </div>
        </div>
      </div>

      {/* Workflow visuel */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">📋 Progression de la réconciliation</h3>
        <div className="relative">
          {/* Timeline */}
          <div className="flex items-center justify-between mb-8">
            {/* Étape 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <p className="text-xs font-medium text-gray-900">Ouverture</p>
              <p className="text-xs text-gray-500">{report.openedBy}</p>
            </div>
            <div className="flex-1 h-1 bg-green-500 -mx-2"></div>
            
            {/* Étape 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <p className="text-xs font-medium text-gray-900">Réconciliation</p>
              <p className="text-xs text-gray-500">{report.reviewedBy}</p>
            </div>
            <div className="flex-1 h-1 bg-orange-300 -mx-2"></div>
            
            {/* Étape 3 - En cours */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-2 animate-pulse">
                <FaClock className="text-white text-xl" />
              </div>
              <p className="text-xs font-medium text-gray-900">Validation</p>
              <p className="text-xs text-orange-600 font-semibold">En cours</p>
            </div>
            <div className="flex-1 h-1 bg-gray-300 -mx-2"></div>
            
            {/* Étape 4 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                <FaLock className="text-gray-500 text-xl" />
              </div>
              <p className="text-xs font-medium text-gray-500">Verrouillage</p>
              <p className="text-xs text-gray-400">En attente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Cash d'ouverture</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.openingCash)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Cash théorique</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.theoreticalCash)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Cash réel</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.actualCash)}</p>
        </div>
        <div className={`rounded-xl p-5 border-2 shadow-sm ${
          report.totalDiscrepancy === 0 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <p className="text-sm font-medium mb-2">Écart total</p>
          <p className={`text-2xl font-bold ${
            report.totalDiscrepancy === 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatCurrency(Math.abs(report.totalDiscrepancy))}
          </p>
          <p className="text-xs mt-1">
            {report.totalDiscrepancy > 0 ? '↗️ Surplus' : report.totalDiscrepancy < 0 ? '↘️ Manque' : '✅ Parfait'}
          </p>
        </div>
      </div>

      {/* Statut des écarts */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-orange-500" />
          État des Écarts
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-orange-600">{report.pendingDiscrepancies}</p>
              </div>
              <FaClock className="text-4xl text-orange-300" />
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expliqués</p>
                <p className="text-3xl font-bold text-blue-600">{report.explainedDiscrepancies}</p>
              </div>
              <FaCheckCircle className="text-4xl text-blue-300" />
            </div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Résolus</p>
                <p className="text-3xl font-bold text-green-600">{report.resolvedDiscrepancies}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-300" />
            </div>
          </div>
        </div>

        {/* Alertes */}
        {!canApprove && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-600 text-xl mt-1" />
              <div>
                <p className="font-semibold text-red-900 mb-1">
                  ⚠️ Impossible d'approuver - Écarts en attente
                </p>
                <p className="text-sm text-red-800">
                  {report.pendingDiscrepancies} écart(s) n'ont pas encore été expliqués par le superviseur. 
                  Demandez une correction ou contactez {report.reviewedBy}.
                </p>
              </div>
            </div>
          </div>
        )}

        {canApprove && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-600 text-xl mt-1" />
              <div>
                <p className="font-semibold text-green-900 mb-1">
                  ✅ Prêt pour validation
                </p>
                <p className="text-sm text-green-800">
                  Tous les écarts ont été expliqués. Vous pouvez approuver et verrouiller cette journée.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Informations de réconciliation */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">📝 Informations de réconciliation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FaUser className="text-gray-600" />
              <p className="text-sm font-medium text-gray-700">Caissier responsable</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">{report.openedBy}</p>
            <p className="text-xs text-gray-500 mt-1">A ouvert la caisse</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FaCheckCircle className="text-gray-600" />
              <p className="text-sm font-medium text-gray-700">Superviseur</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">{report.reviewedBy}</p>
            <p className="text-xs text-gray-500 mt-1">
              Révisé le {report.reviewedAt && formatDateTime(report.reviewedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-300 shadow-lg">
        <h3 className="font-semibold text-gray-900 mb-4">🎯 Actions du Directeur</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Voir le rapport complet */}
          <button
            onClick={() => console.log('Voir rapport')}
            className="p-6 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <FaFileExport className="text-3xl text-gray-400 group-hover:text-blue-600 mb-3" />
            <p className="font-semibold text-gray-900 mb-1">Voir le rapport</p>
            <p className="text-sm text-gray-600">Détails complets et notes</p>
          </button>

          {/* Demander correction */}
          <button
            onClick={handleReject}
            className="p-6 border-2 border-red-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
          >
            <FaUndo className="text-3xl text-red-400 group-hover:text-red-600 mb-3" />
            <p className="font-semibold text-gray-900 mb-1">Demander correction</p>
            <p className="text-sm text-gray-600">Retourner au superviseur</p>
          </button>

          {/* Approuver et verrouiller */}
          <button
            onClick={handleApprove}
            disabled={!canApprove}
            className={`p-6 border-2 rounded-xl transition-all group ${
              canApprove
                ? 'border-green-300 hover:border-green-500 hover:bg-green-50'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
            }`}
          >
            <FaLock className={`text-3xl mb-3 ${
              canApprove ? 'text-green-400 group-hover:text-green-600' : 'text-gray-400'
            }`} />
            <p className="font-semibold text-gray-900 mb-1">Approuver et Verrouiller</p>
            <p className="text-sm text-gray-600">Fermeture définitive</p>
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className={`p-6 rounded-t-2xl ${
              action?.type === 'approve' 
                ? 'bg-gradient-to-r from-green-600 to-green-700' 
                : 'bg-gradient-to-r from-red-600 to-red-700'
            }`}>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {action?.type === 'approve' ? (
                  <>
                    <FaLock /> Confirmer l'approbation
                  </>
                ) : (
                  <>
                    <FaUndo /> Demander une correction
                  </>
                )}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {action?.type === 'approve' ? (
                <>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      ⚠️ ATTENTION - Action irréversible
                    </p>
                    <p className="text-sm text-yellow-700">
                      Une fois approuvée et verrouillée, cette journée ne pourra plus être modifiée. 
                      Toutes les données seront figées dans le journal d'audit permanent.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">Résumé :</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Date: {new Date(report.date).toLocaleDateString('fr-CA')}</li>
                      <li>• Écart total: {formatCurrency(Math.abs(report.totalDiscrepancy))}</li>
                      <li>• Écarts expliqués: {report.explainedDiscrepancies + report.resolvedDiscrepancies}</li>
                      <li>• Révisé par: {report.reviewedBy}</li>
                    </ul>
                  </div>

                  <p className="text-sm text-gray-600">
                    Confirmez-vous l'approbation et le verrouillage définitif de cette journée ?
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700">
                    Indiquez la raison pour laquelle vous demandez une correction au superviseur :
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Exemple: L'écart de 50$ sur l'agent Julie Leblanc n'est pas suffisamment expliqué. Veuillez obtenir plus de détails..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                  />
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setAction(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmAction}
                disabled={action?.type === 'reject' && !rejectionReason.trim()}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                  action?.type === 'approve'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {action?.type === 'approve' ? (
                  <>🔒 Confirmer et Verrouiller</>
                ) : (
                  <>Demander correction</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorValidationPage;