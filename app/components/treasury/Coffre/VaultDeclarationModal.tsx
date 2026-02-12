'use client';
import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaCalculator } from 'react-icons/fa';

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface VaultDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeclarationData {
  physicalAmount: number;
  declaredBy: string;
  verifiedBy: string;
  notes?: string;
}

interface Signatures {
  declaredBy: boolean;
  verifiedBy: boolean;
}

type DeclarationStep = 'form' | 'signatures' | 'confirmation';

const VaultDeclarationModal: React.FC<VaultDeclarationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<DeclarationStep>('form');
  const [formData, setFormData] = useState<DeclarationData>({
    physicalAmount: 0,
    declaredBy: '',
    verifiedBy: '',
    notes: ''
  });
  const [signatures, setSignatures] = useState<Signatures>({
    declaredBy: false,
    verifiedBy: false
  });
  const [error, setError] = useState<string>('');
  const [confirmAcknowledged, setConfirmAcknowledged] = useState(false);

  // Données mockées - à remplacer par fetch API
  const employees: Employee[] = [
    { id: 'emp_002', name: 'Marie Tremblay', role: 'Superviseur' },
    { id: 'emp_003', name: 'Paul Martin', role: 'Gestionnaire' },
    { id: 'emp_005', name: 'Luc Gagnon', role: 'Trésorier' },
    { id: 'emp_006', name: 'Claire Bergeron', role: 'Contrôleur' }
  ];

  // Solde théorique calculé (à remplacer par API)
  const theoreticalAmount = 45000.00;

  if (!isOpen) return null;

  const calculateDifference = () => {
    return formData.physicalAmount - theoreticalAmount;
  };

  const validateForm = (): boolean => {
    setError('');

    if (!formData.physicalAmount || formData.physicalAmount < 0) {
      setError('Le montant doit être supérieur ou égal à 0');
      return false;
    }

    if (!formData.declaredBy || !formData.verifiedBy) {
      setError('Les deux rôles doivent être assignés');
      return false;
    }

    // Règle métier: declaredBy et verifiedBy doivent être différents
    if (formData.declaredBy === formData.verifiedBy) {
      setError('❌ La personne qui déclare et celle qui vérifie doivent être différentes');
      return false;
    }

    // Si écart important, exiger une note
    const difference = Math.abs(calculateDifference());
    if (difference > 100 && !formData.notes?.trim()) {
      setError('⚠️ Un écart de plus de 100$ nécessite une explication dans les notes');
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
    return signatures.declaredBy && signatures.verifiedBy;
  };

  const handleConfirm = () => {
    if (!confirmAcknowledged) {
      setError('Veuillez confirmer l\'exactitude des informations');
      return;
    }

    const difference = calculateDifference();

    // TODO: Appel API pour enregistrer la déclaration
    console.log('💾 Déclaration coffre enregistrée:', {
      ...formData,
      theoreticalAmount,
      difference,
      signatures,
      timestamp: new Date().toISOString(),
      status: difference === 0 ? 'validated' : 'pending'
    });

    // Réinitialiser et fermer
    handleClose();
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      physicalAmount: 0,
      declaredBy: '',
      verifiedBy: '',
      notes: ''
    });
    setSignatures({
      declaredBy: false,
      verifiedBy: false
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

  const difference = calculateDifference();
  const hasDifference = difference !== 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#D4AF37] to-[#C9B27C] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FaCalculator className="text-3xl" />
                Déclaration du Coffre
              </h2>
              <p className="text-white/90 mt-1">
                Inventaire de fin de journée
              </p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Comptage physique du coffre
                </h3>

                {/* Solde théorique (info) */}
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Solde théorique attendu
                      </p>
                      <p className="text-xs text-blue-700">
                        Calculé par le système selon les mouvements du jour
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(theoreticalAmount)}
                    </p>
                  </div>
                </div>
                
                {/* Montant physique compté */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant physique compté <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.physicalAmount || ''}
                      onChange={(e) => setFormData({ ...formData, physicalAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-colors text-lg font-semibold"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Comptez physiquement tout l'argent dans le coffre
                  </p>
                </div>

                {/* Calcul automatique de l'écart */}
                {formData.physicalAmount > 0 && (
                  <div className={`mb-6 p-4 rounded-xl border-2 ${
                    difference === 0 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-orange-50 border-orange-500'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Écart détecté</span>
                      <span className={`text-2xl font-bold ${
                        difference === 0 
                          ? 'text-green-600' 
                          : difference > 0 
                            ? 'text-orange-600'
                            : 'text-red-600'
                      }`}>
                        {difference === 0 
                          ? '✓ 0.00$' 
                          : difference > 0 
                            ? `+ ${formatCurrency(difference)}`
                            : formatCurrency(difference)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {difference === 0 
                        ? 'Parfait ! Le montant correspond exactement.' 
                        : difference > 0
                          ? 'Excédent : il y a plus d\'argent que prévu'
                          : 'Manque : il y a moins d\'argent que prévu'}
                    </p>
                  </div>
                )}

                {/* Déclaré par (Trésorier) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Déclaré par (Trésorier) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.declaredBy}
                    onChange={(e) => setFormData({ ...formData, declaredBy: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-colors"
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.filter(e => e.role === 'Trésorier' || e.role === 'Gestionnaire').map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vérifié par (Superviseur/Contrôleur) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vérifié par (Superviseur) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.verifiedBy}
                    onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-colors"
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.filter(e => e.role === 'Superviseur' || e.role === 'Contrôleur' || e.role === 'Gestionnaire').map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes (obligatoires si écart > 100$) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explication {Math.abs(difference) > 100 && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-colors resize-none"
                    rows={3}
                    placeholder={hasDifference 
                      ? "Expliquer la raison de l'écart..." 
                      : "Notes éventuelles sur le comptage..."}
                  />
                  {Math.abs(difference) > 100 && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Une explication est obligatoire pour un écart supérieur à 100$
                    </p>
                  )}
                </div>

                {/* Avertissement */}
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Procédure de comptage</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Comptez tous les billets et pièces</li>
                        <li>Incluez les enveloppes scellées non ouvertes</li>
                        <li>Vérifiez deux fois avant de valider</li>
                        <li>La personne qui compte ≠ celle qui vérifie</li>
                      </ul>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9B27C] text-white rounded-lg hover:from-[#C9B27C] hover:to-[#D4AF37] font-semibold transition-all shadow-lg"
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
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Montant compté</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(formData.physicalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Écart</p>
                      <p className={`text-lg font-bold ${
                        difference === 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {difference === 0 ? '✓ Aucun' : formatCurrency(Math.abs(difference))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Signature 1: Déclaré par */}
                  <div className={`p-4 rounded-xl border-2 ${signatures.declaredBy ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {signatures.declaredBy && <FaCheckCircle className="text-green-600" />}
                          <p className="font-medium text-gray-900">
                            Déclaré par: {getEmployeeName(formData.declaredBy)}
                          </p>
                        </div>
                        {signatures.declaredBy ? (
                          <p className="text-sm text-green-700">Signé le {new Date().toLocaleString('fr-CA')}</p>
                        ) : (
                          <p className="text-sm text-gray-600">En attente de signature</p>
                        )}
                      </div>
                      {!signatures.declaredBy && (
                        <button
                          onClick={() => handleSign('declaredBy')}
                          className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C9B27C] font-medium transition-colors"
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
                          <p className="font-medium text-gray-900">
                            Vérifié par: {getEmployeeName(formData.verifiedBy)}
                          </p>
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
                          className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C9B27C] font-medium transition-colors"
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
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9B27C] text-white hover:from-[#C9B27C] hover:to-[#D4AF37]'
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🔒 Confirmation de la déclaration
                </h3>
                <p className="text-sm text-gray-600 mb-6">Vérifiez les informations avant validation finale</p>

                <div className="p-6 bg-gray-50 rounded-xl space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Montant théorique</p>
                      <p className="text-lg font-semibold text-gray-700">{formatCurrency(theoreticalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Montant compté</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(formData.physicalAmount)}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    difference === 0 
                      ? 'bg-green-100 border border-green-300' 
                      : 'bg-orange-100 border border-orange-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Écart</span>
                      <span className={`text-xl font-bold ${
                        difference === 0 ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {difference === 0 
                          ? '✓ Aucun écart' 
                          : difference > 0 
                            ? `+ ${formatCurrency(difference)}`
                            : formatCurrency(difference)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-sm">
                        <span className="font-medium">Déclaré par:</span> {getEmployeeName(formData.declaredBy)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-sm">
                        <span className="font-medium">Vérifié par:</span> {getEmployeeName(formData.verifiedBy)}
                      </span>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Explication:</span> {formData.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Avertissement final */}
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-1">⚠️ ATTENTION</p>
                      <p>Une fois confirmée, cette déclaration ne pourra plus être modifiée.</p>
                      {hasDifference && (
                        <p className="mt-2 font-semibold">
                          L'écart sera signalé au comité de gestion pour vérification.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkbox de confirmation */}
                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#D4AF37] transition-colors">
                  <input
                    type="checkbox"
                    checked={confirmAcknowledged}
                    onChange={(e) => setConfirmAcknowledged(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#D4AF37] rounded focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                  <span className="text-sm text-gray-700">
                    Je confirme avoir compté physiquement le contenu du coffre et que les informations sont exactes. 
                    Cette déclaration sera définitive et immuable.
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
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9B27C] text-white hover:from-[#C9B27C] hover:to-[#D4AF37]'
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

export default VaultDeclarationModal;