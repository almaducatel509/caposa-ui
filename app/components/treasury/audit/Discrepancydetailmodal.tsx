'use client';
import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaSave } from 'react-icons/fa';

interface Discrepancy {
  id: string;
  source: 'cash' | 'bank_deposit' | 'agent' | 'transaction';
  sourceId: string;
  sourceName: string;
  expectedAmount: number;
  actualAmount: number;
  discrepancyAmount: number;
  status: 'pending' | 'explained' | 'resolved';
  note?: string;
  createdBy?: string;
  createdAt?: string;
}

interface DiscrepancyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  discrepancy?: Discrepancy;
  onSave: (id: string, note: string, status: string) => void;
}

const DiscrepancyDetailModal: React.FC<DiscrepancyDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  discrepancy,
  onSave 
}) => {
  const [note, setNote] = useState(discrepancy?.note || '');
  const [status, setStatus] = useState(discrepancy?.status || 'pending');
  const [error, setError] = useState('');

  if (!isOpen || !discrepancy) return null;

  const handleSave = () => {
    if (!note.trim()) {
      setError('Une note explicative est obligatoire pour chaque écart');
      return;
    }

    if (note.trim().length < 10) {
      setError('La note doit contenir au moins 10 caractères');
      return;
    }

    onSave(discrepancy.id, note, status);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getSourceLabel = (source: string) => {
    const labels = {
      cash: 'Cash en caisse',
      bank_deposit: 'Dépôt bancaire',
      agent: 'Agent de crédit',
      transaction: 'Transaction'
    };
    return labels[source as keyof typeof labels];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixe */}
        <div className="bg-linear-to-r from-red-600 to-red-700 p-6 rounded-t-2xl shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Détail de l'Écart</h2>
                <p className="text-red-100 text-sm">{getSourceLabel(discrepancy.source)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-white text-lg" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Informations de base */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Source de l'écart</p>
              <p className="text-lg font-semibold text-gray-900">{discrepancy.sourceName}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Montant attendu</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(discrepancy.expectedAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Montant réel</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(discrepancy.actualAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Écart</p>
                <p className={`text-xl font-bold ${discrepancy.discrepancyAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(discrepancy.discrepancyAmount))}
                  <span className="text-sm ml-1">
                    {discrepancy.discrepancyAmount > 0 ? '(surplus)' : '(manque)'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Calcul de l'écart */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">📊 Calcul automatique</p>
            <p className="text-sm text-blue-800">
              {formatCurrency(discrepancy.actualAmount)} (réel) - {formatCurrency(discrepancy.expectedAmount)} (attendu) = <span className="font-bold">{formatCurrency(discrepancy.discrepancyAmount)}</span>
            </p>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Statut de l'écart <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setStatus('pending')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  status === 'pending'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-orange-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-sm">⏳ En attente</p>
                  <p className="text-xs mt-1">À investiguer</p>
                </div>
              </button>
              <button
                onClick={() => setStatus('explained')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  status === 'explained'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-sm">📝 Expliqué</p>
                  <p className="text-xs mt-1">Note ajoutée</p>
                </div>
              </button>
              <button
                onClick={() => setStatus('resolved')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  status === 'resolved'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-sm">✅ Résolu</p>
                  <p className="text-xs mt-1">Corrigé</p>
                </div>
              </button>
            </div>
          </div>

          {/* Note explicative OBLIGATOIRE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note explicative <span className="text-red-500">* OBLIGATOIRE</span>
            </label>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg mb-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Une explication détaillée est obligatoire pour chaque écart. Cette note sera visible dans le rapport d'audit.
              </p>
            </div>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setError('');
              }}
              placeholder="Expliquez l'origine de cet écart de façon détaillée...

Exemples:
- Membre a donné un billet de 100$ déchiré, remplacé par billet neuf. Billet abîmé envoyé à la banque pour échange. Voir reçu #478.
- Erreur de frappe lors de la saisie de la transaction. Montant corrigé dans le système.
- Frais bancaire automatique non prévu. Confirmation reçue de la banque par email."
              rows={6}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 outline-none transition-all resize-none ${
                error 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:border-[#2E7D32] focus:ring-[#2E7D32]/20'
              }`}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Minimum 10 caractères • {note.length} caractères saisis
              </p>
              {note.length >= 10 && (
                <p className="text-xs text-green-600 font-medium">✓ Note suffisante</p>
              )}
            </div>
          </div>

          {/* Historique si existe */}
          {discrepancy.note && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">📜 Note précédente</p>
              <p className="text-sm text-gray-600 mb-2">{discrepancy.note}</p>
              {discrepancy.createdBy && (
                <p className="text-xs text-gray-500">
                  Par {discrepancy.createdBy} • {new Date(discrepancy.createdAt!).toLocaleString('fr-CA')}
                </p>
              )}
            </div>
          )}

          {/* Exemples de bonnes notes */}
          <details className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <summary className="text-sm font-semibold text-blue-900 cursor-pointer">
              💡 Exemples de notes complètes
            </summary>
            <div className="mt-3 space-y-2 text-sm text-blue-800">
              <div className="p-2 bg-white rounded">
                <p className="font-medium">✅ Bonne note:</p>
                <p className="text-xs mt-1">"Membre Pierre Martin a payé 1500$ avec un billet de 100$ déchiré. Billet remplacé par un neuf du fond de caisse. Billet abîmé envoyé à la Banque Nationale pour échange le 13/02/2026. Reçu d'échange #BN-478 archivé."</p>
              </div>
              <div className="p-2 bg-white rounded">
                <p className="font-medium">✅ Bonne note:</p>
                <p className="text-xs mt-1">"Erreur de saisie sur transaction #TX-1234. Caissier a entré 2000$ au lieu de 200$. Erreur détectée lors du comptage de fin de journée. Transaction corrigée dans le système. Vérifiée par superviseur Marie Tremblay."</p>
              </div>
              <div className="p-2 bg-white rounded">
                <p className="font-medium">❌ Mauvaise note:</p>
                <p className="text-xs mt-1 line-through">"Erreur de caisse" (trop vague, pas d'explication)</p>
              </div>
            </div>
          </details>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!note.trim() || note.length < 10}
              className="flex-1 px-6 py-3 bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl hover:from-[#1B5E20] hover:to-[#2E7D32] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <FaSave />
              Enregistrer l'explication
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            💡 Cette note sera visible dans le rapport d'audit et ne pourra plus être modifiée après verrouillage
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscrepancyDetailModal;