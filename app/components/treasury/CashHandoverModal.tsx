'use client';
import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface CashHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HandoverStep = 'form' | 'signatures' | 'confirmation';

interface HandoverData {
  amount: number;
  handedBy: string;
  verifiedBy: string;
  receivedBy: string;
  notes?: string;
}

interface Signatures {
  handedBy: boolean;
  verifiedBy: boolean;
  receivedBy: boolean;
}

const CashHandoverModal: React.FC<CashHandoverModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<HandoverStep>('form');
  const [formData, setFormData] = useState<HandoverData>({
    amount: 0,
    handedBy: '',
    verifiedBy: '',
    receivedBy: '',
    notes: ''
  });
  const [signatures, setSignatures] = useState<Signatures>({
    handedBy: false,
    verifiedBy: false,
    receivedBy: false
  });
  const [error, setError] = useState<string>('');
  const [confirmAcknowledged, setConfirmAcknowledged] = useState(false);

  // Données mockées - à remplacer par fetch API
  const employees: Employee[] = [
    { id: 'emp_001', name: 'Jean Dupont', role: 'Caissier' },
    { id: 'emp_002', name: 'Marie Tremblay', role: 'Superviseur' },
    { id: 'emp_003', name: 'Paul Martin', role: 'Gestionnaire' },
    { id: 'emp_004', name: 'Sophie Lavoie', role: 'Caissier' },
    { id: 'emp_005', name: 'Luc Gagnon', role: 'Contrôleur' }
  ];

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    setError('');

    if (!formData.amount || formData.amount <= 0) {
      setError('Le montant doit être supérieur à 0');
      return false;
    }

    if (!formData.handedBy || !formData.verifiedBy || !formData.receivedBy) {
      setError('Tous les rôles doivent être assignés');
      return false;
    }

    // Règle métier critique: les 3 personnes doivent être différentes
    const actors = [formData.handedBy, formData.verifiedBy, formData.receivedBy];
    const unique = new Set(actors);
    
    if (unique.size !== 3) {
      setError('❌ Les trois rôles doivent être assumés par des personnes différentes');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep('signatures');
    }
  };

  const handleSign = (role: keyof Signatures) => {
    setSignatures(prev => ({ ...prev, [role]: true }));
  };

  const canProceedToConfirmation = () => {
    return signatures.handedBy && signatures.verifiedBy && signatures.receivedBy;
  };

  const handleConfirm = () => {
    if (!confirmAcknowledged) {
      setError('Veuillez confirmer l\'exactitude des informations');
      return;
    }

    // TODO: Appel API pour enregistrer la remise
    console.log('💾 Remise de caisse enregistrée:', {
      ...formData,
      signatures,
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    });

    // Réinitialiser et fermer
    handleClose();
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      amount: 0,
      handedBy: '',
      verifiedBy: '',
      receivedBy: '',
      notes: ''
    });
    setSignatures({
      handedBy: false,
      verifiedBy: false,
      receivedBy: false
    });
    setError('');
    setConfirmAcknowledged(false);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Remise de Caisse du Matin</h2>
              <p className="text-green-100 mt-1">Création d'une preuve numérique immuable</p>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-white text-xl" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${step === 'form' || step === 'signatures' || step === 'confirmation' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-2 rounded-full ${step === 'signatures' || step === 'confirmation' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-2 rounded-full ${step === 'confirmation' ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Étape 1: Formulaire */}
          {step === 'form' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la remise</h3>
                
                {/* Montant */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant remis <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition-colors text-lg font-semibold"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Remis par */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remis par <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.handedBy}
                    onChange={(e) => setFormData({ ...formData, handedBy: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition-colors"
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vérifié par */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vérifié par <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.verifiedBy}
                    onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition-colors"
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reçu par */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reçu par <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.receivedBy}
                    onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition-colors"
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes optionnelles */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition-colors resize-none"
                    rows={3}
                    placeholder="Informations supplémentaires..."
                  />
                </div>

                {/* Avertissement */}
                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-orange-500 mt-1 flex-shrink-0" />
                    <div className="text-sm text-orange-800">
                      <p className="font-semibold mb-1">Règle importante</p>
                      <p>Les trois personnes (remis par, vérifié par, reçu par) doivent être différentes.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-lg hover:from-[#1B5E20] hover:to-[#2E7D32] font-semibold transition-all shadow-lg"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Signatures */}
          {step === 'signatures' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Signatures requises</h3>
                <p className="text-sm text-gray-600 mb-6">Montant: <span className="font-bold text-[#2E7D32]">{formatCurrency(formData.amount)}</span></p>

                <div className="space-y-4">
                  {/* Signature 1: Remis par */}
                  <div className={`p-4 rounded-xl border-2 ${signatures.handedBy ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {signatures.handedBy && <FaCheckCircle className="text-green-600" />}
                          <p className="font-medium text-gray-900">Remis par: {getEmployeeName(formData.handedBy)}</p>
                        </div>
                        {signatures.handedBy ? (
                          <p className="text-sm text-green-700">Signé le {new Date().toLocaleString('fr-CA')}</p>
                        ) : (
                          <p className="text-sm text-gray-600">En attente de signature</p>
                        )}
                      </div>
                      {!signatures.handedBy && (
                        <button
                          onClick={() => handleSign('handedBy')}
                          className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] font-medium transition-colors"
                        >
                          Signer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Signature 2: Vérifié par */}
                  <div className={`p-4 rounded-xl border-2 ${signatures.verifiedBy ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {signatures.verifiedBy && <FaCheckCircle className="text-green-600" />}
                          <p className="font-medium text-gray-900">Vérifié par: {getEmployeeName(formData.verifiedBy)}</p>
                        </div>
                        {signatures.verifiedBy ? (
                          <p className="text-sm text-green-700">Signé le {new Date().toLocaleString('fr-CA')}</p>
                        ) : (
                          <p className="text-sm text-gray-600">En attente de signature</p>
                        )}
                      </div>
                      {!signatures.verifiedBy && (
                        <button
                          onClick={() => handleSign('verifiedBy')}
                          className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] font-medium transition-colors"
                        >
                          Signer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Signature 3: Reçu par */}
                  <div className={`p-4 rounded-xl border-2 ${signatures.receivedBy ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {signatures.receivedBy && <FaCheckCircle className="text-green-600" />}
                          <p className="font-medium text-gray-900">Reçu par: {getEmployeeName(formData.receivedBy)}</p>
                        </div>
                        {signatures.receivedBy ? (
                          <p className="text-sm text-green-700">Signé le {new Date().toLocaleString('fr-CA')}</p>
                        ) : (
                          <p className="text-sm text-gray-600">En attente de signature</p>
                        )}
                      </div>
                      {!signatures.receivedBy && (
                        <button
                          onClick={() => handleSign('receivedBy')}
                          className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] font-medium transition-colors"
                        >
                          Signer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => setStep('confirmation')}
                  disabled={!canProceedToConfirmation()}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                    canProceedToConfirmation()
                      ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white hover:from-[#1B5E20] hover:to-[#2E7D32]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Confirmer →
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔒 Confirmation de remise</h3>
                <p className="text-sm text-gray-600 mb-6">Vérifiez les informations avant validation finale</p>

                <div className="p-6 bg-gray-50 rounded-xl space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Montant</span>
                    <span className="text-2xl font-bold text-[#2E7D32]">{formatCurrency(formData.amount)}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-sm"><span className="font-medium">Remis par:</span> {getEmployeeName(formData.handedBy)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-sm"><span className="font-medium">Vérifié par:</span> {getEmployeeName(formData.verifiedBy)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-sm"><span className="font-medium">Reçu par:</span> {getEmployeeName(formData.receivedBy)}</span>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {formData.notes}</p>
                    </div>
                  )}
                </div>

                {/* Avertissement final */}
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-1">⚠️ ATTENTION</p>
                      <p>Une fois confirmée, cette opération ne pourra plus être modifiée.</p>
                      <p>Elle sera verrouillée et ajoutée au journal d'audit permanent.</p>
                    </div>
                  </div>
                </div>

                {/* Checkbox de confirmation */}
                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#2E7D32] transition-colors">
                  <input
                    type="checkbox"
                    checked={confirmAcknowledged}
                    onChange={(e) => setConfirmAcknowledged(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#2E7D32] rounded focus:ring-2 focus:ring-[#2E7D32]/20"
                  />
                  <span className="text-sm text-gray-700">
                    Je confirme l'exactitude des informations et comprends que cette opération sera définitive et immuable.
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('signatures')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!confirmAcknowledged}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                    confirmAcknowledged
                      ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white hover:from-[#1B5E20] hover:to-[#2E7D32]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🔒 Confirmer et Verrouiller
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashHandoverModal;