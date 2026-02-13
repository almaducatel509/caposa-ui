'use client';
import React, { useState } from 'react';
import { FaLock, FaTimes, FaMoneyBillWave, FaUser } from 'react-icons/fa';

interface CashOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashOpeningModal: React.FC<CashOpeningModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    cashierName: '',
    initialAmount: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation API call
    setTimeout(() => {
      console.log('Ouverture de caisse:', formData);
      // TODO: Implémenter l'appel API
      setLoading(false);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setFormData({
      cashierName: '',
      initialAmount: '',
      notes: ''
    });
    onClose();
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(num);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setFormData({ ...formData, initialAmount: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header - Fixe */}
        <div className="bg-linear-to-r from-[#2E7D32] to-[#1B5E20] p-6 rounded-t-2xl shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaLock className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Ouvrir la Caisse</h2>
                <p className="text-green-100 text-sm">Démarrer une nouvelle session</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-white text-lg" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">ℹ️</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Prérequis d'ouverture
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Vérifier le montant du fond de caisse</li>
                  <li>• Compter l'argent physiquement</li>
                  <li>• S'assurer que la caisse précédente est clôturée</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Caissier */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUser className="inline mr-2 text-gray-500" />
              Nom du caissier
            </label>
            <input
              type="text"
              required
              value={formData.cashierName}
              onChange={(e) => setFormData({ ...formData, cashierName: e.target.value })}
              placeholder="Ex: Jean Dupont"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all"
            />
          </div>

          {/* Montant initial */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaMoneyBillWave className="inline mr-2 text-gray-500" />
              Montant initial (Fond de caisse)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.initialAmount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all text-lg font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                CAD
              </span>
            </div>
            {formData.initialAmount && (
              <p className="mt-2 text-sm text-gray-600">
                Montant: <span className="font-semibold text-[#2E7D32]">
                  {formatCurrency(formData.initialAmount)}
                </span>
              </p>
            )}
          </div>

          {/* Détails du décompte */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Détails du décompte (optionnel)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Billets</p>
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Pièces</p>
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes / Observations
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Remarques particulières..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all resize-none"
            />
          </div>

          {/* Résumé */}
          <div className="bg-gradient-to-br from-[#DDEAD5] to-[#F0F7ED] rounded-xl p-4 border border-[#2E7D32]/20">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📋</span> Résumé de l'ouverture
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Caissier:</span>
                <span className="font-medium text-gray-900">
                  {formData.cashierName || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant initial:</span>
                <span className="font-bold text-[#2E7D32]">
                  {formData.initialAmount ? formatCurrency(formData.initialAmount) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date d'ouverture:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleString('fr-CA', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.cashierName || !formData.initialAmount}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl hover:from-[#1B5E20] hover:to-[#2E7D32] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ouverture...
                </span>
              ) : (
                '🔓 Ouvrir la Caisse'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashOpeningModal;