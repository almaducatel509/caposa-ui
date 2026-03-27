'use client';
import React, { useState } from 'react';
import { XCircle, CheckCircle, AlertTriangle, Calculator } from 'lucide-react';
import { FaCheckCircle as FaCheck, FaExclamationTriangle } from 'react-icons/fa';

interface Employee { id: string; name: string; role: string; }

interface VaultDeclarationModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

interface DeclarationData {
  physicalAmount: number;
  declaredBy:     string;
  verifiedBy:     string;
  notes?:         string;
}

interface Signatures { declaredBy: boolean; verifiedBy: boolean; }

type DeclarationStep = 'form' | 'signatures' | 'confirmation';

const VaultDeclarationModal: React.FC<VaultDeclarationModalProps> = ({ isOpen, onClose }) => {
  const [step,                setStep]                = useState<DeclarationStep>('form');
  const [formData,            setFormData]            = useState<DeclarationData>({ physicalAmount: 0, declaredBy: '', verifiedBy: '', notes: '' });
  const [signatures,          setSignatures]          = useState<Signatures>({ declaredBy: false, verifiedBy: false });
  const [error,               setError]               = useState('');
  const [confirmAcknowledged, setConfirmAcknowledged] = useState(false);

  const employees: Employee[] = [
    { id: 'emp_002', name: 'Marie Tremblay', role: 'Superviseur'  },
    { id: 'emp_003', name: 'Paul Martin',    role: 'Gestionnaire' },
    { id: 'emp_005', name: 'Luc Gagnon',     role: 'Trésorier'   },
    { id: 'emp_006', name: 'Claire Bergeron',role: 'Contrôleur'  },
  ];

  const theoreticalAmount = 45000.00;

  if (!isOpen) return null;

  const difference = formData.physicalAmount - theoreticalAmount;
  const hasDifference = difference !== 0;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(v);

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name ?? '';

  const validateForm = () => {
    setError('');
    if (!formData.physicalAmount || formData.physicalAmount < 0) { setError('Le montant doit être ≥ 0'); return false; }
    if (!formData.declaredBy || !formData.verifiedBy) { setError('Les deux rôles doivent être assignés'); return false; }
    if (formData.declaredBy === formData.verifiedBy) { setError('La personne qui déclare et celle qui vérifie doivent être différentes'); return false; }
    if (Math.abs(difference) > 100 && !formData.notes?.trim()) { setError('Un écart de plus de 100$ nécessite une explication'); return false; }
    return true;
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ physicalAmount: 0, declaredBy: '', verifiedBy: '', notes: '' });
    setSignatures({ declaredBy: false, verifiedBy: false });
    setError('');
    setConfirmAcknowledged(false);
    onClose();
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-colors text-sm bg-[#F9F9F6]";
  const btnPrimary = "flex-1 py-2.5 rounded-xl bg-linear-to-r from-[#D4AF37] to-[#C9B27C] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSecondary = "flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors";

  /* ── Progress bar ── */
  const steps = ['form', 'signatures', 'confirmation'];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header blanc CAPOSA ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Déclaration du Coffre</h2>
              <p className="text-xs text-gray-400">Inventaire de fin de journée</p>
            </div>
          </div>
          <button onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 border-b border-gray-50 shrink-0">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= stepIdx ? 'bg-[#D4AF37]' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* ── Étape 1 : Formulaire ── */}
          {step === 'form' && (
            <>
              {/* Solde théorique */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-800">Solde théorique attendu</p>
                  <p className="text-xs text-blue-600 mt-0.5">Calculé par le système</p>
                </div>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(theoreticalAmount)}</p>
              </div>

              {/* Montant physique */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Montant physique compté *</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    value={formData.physicalAmount || ''}
                    onChange={e => setFormData({ ...formData, physicalAmount: parseFloat(e.target.value) || 0 })}
                    className={inputCls + ' pl-8 text-base font-semibold'} />
                </div>
              </div>

              {/* Écart temps réel */}
              {formData.physicalAmount > 0 && (
                <div className={`p-4 rounded-xl border-2 ${difference === 0 ? 'bg-[#DDEAD5] border-[#2E7D32]/30' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Écart détecté</span>
                    <span className={`text-lg font-bold ${difference === 0 ? 'text-[#2E7D32]' : difference > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {difference === 0 ? 'Aucun' : difference > 0 ? `+ ${formatCurrency(difference)}` : formatCurrency(difference)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {difference === 0 ? 'Parfait — le montant correspond.' : difference > 0 ? "Excédent détecté" : "Manque détecté"}
                  </p>
                </div>
              )}

              {/* Sélections */}
              {[
                { label: 'Déclaré par (Trésorier) *',   key: 'declaredBy', roles: ['Trésorier', 'Gestionnaire'] },
                { label: 'Vérifié par (Superviseur) *', key: 'verifiedBy', roles: ['Superviseur', 'Contrôleur', 'Gestionnaire'] },
              ].map(({ label, key, roles }) => (
                <div key={key}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">{label}</p>
                  <select value={formData[key as keyof DeclarationData] as string}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    className={inputCls}>
                    <option value="">Sélectionner un employé</option>
                    {employees.filter(e => roles.includes(e.role)).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Notes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                  Explication {Math.abs(difference) > 100 && <span className="text-red-500">*</span>}
                </p>
                <textarea value={formData.notes} rows={3} placeholder={hasDifference ? "Expliquer la raison de l'écart…" : "Notes éventuelles…"}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className={inputCls + ' resize-none'} />
              </div>

              {/* Avertissement */}
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl text-xs text-yellow-800">
                <p className="font-semibold mb-1">Procédure de comptage</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Comptez tous les billets et pièces</li>
                  <li>Incluez les enveloppes scellées non ouvertes</li>
                  <li>La personne qui compte ≠ celle qui vérifie</li>
                </ul>
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button onClick={handleClose} className={btnSecondary}>Annuler</button>
                <button onClick={() => validateForm() && setStep('signatures')} className={btnPrimary}>Suivant →</button>
              </div>
            </>
          )}

          {/* ── Étape 2 : Signatures ── */}
          {step === 'signatures' && (
            <>
              <div className="p-4 bg-gray-50 rounded-xl grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Montant compté</p>
                  <p className="font-bold text-gray-900">{formatCurrency(formData.physicalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Écart</p>
                  <p className={`font-bold ${difference === 0 ? 'text-[#2E7D32]' : 'text-orange-600'}`}>
                    {difference === 0 ? 'Aucun' : formatCurrency(Math.abs(difference))}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {([
                  { key: 'declaredBy', label: 'Déclaré par' },
                  { key: 'verifiedBy', label: 'Vérifié par' },
                ] as const).map(({ key, label }) => {
                  const signed = signatures[key];
                  return (
                    <div key={key} className={`p-4 rounded-xl border-2 ${signed ? 'bg-[#DDEAD5] border-[#2E7D32]/30' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {signed && <FaCheck className="text-[#2E7D32] text-xs" />}
                            <p className="text-sm font-semibold text-gray-900">{label} : {getEmployeeName(formData[key])}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {signed ? `Signé le ${new Date().toLocaleString('fr-CA')}` : 'En attente de signature'}
                          </p>
                        </div>
                        {!signed && (
                          <button onClick={() => setSignatures(s => ({ ...s, [key]: true }))}
                            className="px-3 py-1.5 rounded-xl bg-linear-to-r from-[#D4AF37] to-[#C9B27C] text-white text-xs font-semibold">
                            Signer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep('form')} className={btnSecondary}>← Retour</button>
                <button onClick={() => setStep('confirmation')} disabled={!(signatures.declaredBy && signatures.verifiedBy)}
                  className={btnPrimary}>Confirmer →</button>
              </div>
            </>
          )}

          {/* ── Étape 3 : Confirmation ── */}
          {step === 'confirmation' && (
            <>
              <div className="p-5 bg-gray-50 rounded-xl space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Montant théorique</p>
                    <p className="font-semibold text-gray-700">{formatCurrency(theoreticalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Montant compté</p>
                    <p className="font-bold text-gray-900">{formatCurrency(formData.physicalAmount)}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-xl flex items-center justify-between ${difference === 0 ? 'bg-[#DDEAD5]' : 'bg-orange-50'}`}>
                  <span className="font-medium text-gray-800">Écart</span>
                  <span className={`font-bold ${difference === 0 ? 'text-[#2E7D32]' : 'text-orange-600'}`}>
                    {difference === 0 ? 'Aucun écart' : difference > 0 ? `+ ${formatCurrency(difference)}` : formatCurrency(difference)}
                  </span>
                </div>
                {[
                  { label: 'Déclaré par', value: getEmployeeName(formData.declaredBy) },
                  { label: 'Vérifié par', value: getEmployeeName(formData.verifiedBy) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <FaCheck className="text-[#2E7D32] text-xs shrink-0" />
                    <span className="text-gray-700"><span className="font-medium">{label} :</span> {value}</span>
                  </div>
                ))}
                {formData.notes && (
                  <p className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                    <span className="font-semibold">Explication :</span> {formData.notes}
                  </p>
                )}
              </div>

              <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-xl text-xs text-red-800">
                <p className="font-semibold mb-1">ATTENTION</p>
                <p>Une fois confirmée, cette déclaration ne pourra plus être modifiée.</p>
              </div>

              <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#D4AF37] transition-colors">
                <input type="checkbox" checked={confirmAcknowledged}
                  onChange={e => setConfirmAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#D4AF37]" />
                <span className="text-xs text-gray-600">
                  Je confirme avoir compté physiquement le contenu du coffre. Cette déclaration sera définitive.
                </span>
              </label>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep('signatures')} className={btnSecondary}>← Retour</button>
                <button onClick={() => { if (!confirmAcknowledged) { setError("Veuillez confirmer l'exactitude"); return; } handleClose(); }}
                  disabled={!confirmAcknowledged} className={btnPrimary}>
                  Confirmer et Verrouiller
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultDeclarationModal;