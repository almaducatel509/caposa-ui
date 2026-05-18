'use client';

import React, { useState } from 'react';
import { User, Wallet, CheckCircle, Loader2 } from 'lucide-react';
import CompteAutocomplete from './CompteAutocomplete';
import { BANK_RULES, getRulesForAccountType } from '@/app/lib/bankRules';
import { checkMemberEligibility } from '@/app/lib/api/accounts';
import { AccountData } from './validationsaccount';

// ============= TYPES =============
// interface CompteFormData {
//   id_membre: string;
//   typeCompte: 'epargne' | 'cheques' | 'terme' | '';
//   statutCompte: 'actif' | 'ferme' | 'suspendu';
//   dateOuverture: string;
//   tauxInteret: number | null;
//   limiteTrait: number | null;
//   fraisServiceMensuel: number | null;
//   member_details?: {
//     full_name?: string;
//     first_name: string;
//     last_name: string;
//     id_number: string;
//     phone_number: string;
//     email?: string;
//   };
// }

type FormMode = 'create' | 'edit' | 'view';

interface CompteFormFieldsProps {
  formData: AccountData;
  setFormData: (data: Partial<AccountData>) => void;
  errors: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mode?: FormMode;
}

// ─── Section wrapper (style CAPOSA) ───────────────────────────────────────────
function Section({ number, icon: Icon, title, children }: {
  number: number; icon: any; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-[#DDEAD5]/40 to-transparent">
        <div className="w-6 h-6 rounded-full bg-[#2E7D32] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{number}</span>
        </div>
        <Icon className="w-4 h-4 text-[#2E7D32]" />
        <p className="text-sm font-semibold text-gray-800">{title}</p>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

// ─── Progress bar (style CAPOSA) ──────────────────────────────────────────────
function ProgressBar({ currentStep }: { currentStep: number }) {
  const pct = Math.round(((currentStep - 1) / 2) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Progression
        </span>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-[#2E7D32]' : 'text-gray-700'}`}>
          {pct}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Step indicators */}
      <div className="flex items-center justify-between mt-3">
        {[
          { step: 1, label: 'Membre' },
          { step: 2, label: 'Type' },
          { step: 3, label: 'Confirmation' },
        ].map(({ step, label }) => (
          <div key={step} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep >= step
                ? 'bg-[#2E7D32] text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > step ? '✓' : step}
            </div>
            <span className={`text-xs font-medium ${
              currentStep >= step ? 'text-[#2E7D32]' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Label (style CAPOSA) ─────────────────────────────────────────────────────
function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ============= COMPONENT =============
const CompteFormFields: React.FC<CompteFormFieldsProps> = ({
  formData, setFormData, errors, setErrors, mode = 'create',
}) => {

  const [currentStep, setCurrentStep] = useState(1);
  const [eligibilityChecking, setEligibilityChecking] = useState(false);
  const isCreateMode = mode === 'create';

  const clearError = (field: string) => {
    if (setErrors) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleAccountTypeSelection = (type: 'epargne' | 'cheques' | 'terme') => {
    const rules = getRulesForAccountType(type);
    setFormData({
      typeCompte: type,
      tauxInteret: rules.interestRate,
      fraisServiceMensuel: rules.monthlyFees,
      limiteTrait: rules.withdrawalLimit || null,
    });
    clearError('typeCompte');
    setCurrentStep(3);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PRÉ-CYCLE D'OUVERTURE — Vérification d'éligibilité du membre
  //
  // Avant de laisser passer le wizard à l'étape 2 (choix du type de compte),
  // on demande au backend si ce membre a le droit d'ouvrir un compte
  // (statut KYC, ancienneté, blocages, limite de comptes, etc.).
  //
  // Pourquoi ici et pas ailleurs ?
  //   - Pas dans l'UI / les validations Zod : ce sont des règles métier
  //     côté serveur, le front ne doit pas les connaître.
  //   - Pas dans createAccount : trop tard, l'utilisateur aurait déjà
  //     rempli tout le wizard pour rien.
  //
  // ⚠ Ceci est un SOFT CHECK. Le HARD CHECK reste obligatoire côté backend
  //   dans POST /accounts/ (on ne fait jamais confiance au front).
  //
  // Endpoint attendu : GET /members/{id}/eligibility/
  //   → { eligible: boolean, reasons: string[] }
  //
  // ⚠ Tant que le backend n'a pas livré l'endpoint, checkMemberEligibility
  //   bypasse le check (feature flag ELIGIBILITY_CHECK_ENABLED dans accounts.ts).
  // ─────────────────────────────────────────────────────────────────────────
  const handleMemberSelection = async (id: string) => {
    setFormData({ id_membre: id });
    clearError('id_membre');
    if (!id) return;

    setEligibilityChecking(true);
    try {
      const { eligible, reasons } = await checkMemberEligibility(id);
      if (eligible) {
        setCurrentStep(2);
      } else {
        setErrors?.(prev => ({
          ...prev,
          id_membre: reasons.join('. ') || "Membre non éligible à l'ouverture d'un compte.",
        }));
      }
    } catch (e: any) {
      setErrors?.(prev => ({
        ...prev,
        id_membre: e?.message || "Vérification d'éligibilité échouée.",
      }));
    } finally {
      setEligibilityChecking(false);
    }
  };

  // ── Mode edit non supporté ──
  if (!isCreateMode) {
    return (
      <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-sm font-semibold text-yellow-800">Mode {mode} non disponible</p>
        <p className="text-xs text-yellow-700 mt-1">Ce formulaire est optimisé pour la création uniquement.</p>
      </div>
    );
  }

  // ── Create mode ──
  return (
    <div className="flex flex-col gap-5">

      <ProgressBar currentStep={currentStep} />

      {/* ── STEP 1 : Membre ── */}
      {currentStep === 1 && (
        <Section number={1} icon={User} title="Sélection du membre">
          <FieldLabel label="Membre titulaire" required />
          <CompteAutocomplete
            selectedKey={formData.id_membre}
            onSelectionChange={handleMemberSelection}
            errorMessage={errors.id_membre}
            isRequired
            placeholder="Rechercher par nom ou numéro…"
          />

          {/* Indicateur de vérification d'éligibilité en cours */}
          {eligibilityChecking && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E7D32]" />
              <span>Vérification de l'éligibilité…</span>
            </div>
          )}

          {errors.id_membre && !eligibilityChecking && (
            <p className="text-xs text-red-500 mt-1">{errors.id_membre}</p>
          )}

          {formData.id_membre && !eligibilityChecking && !errors.id_membre && (
            <div className="mt-3 p-3 bg-[#DDEAD5]/50 border border-[#2E7D32]/20 rounded-xl">
              <p className="text-xs font-semibold text-[#1B5E20]">Membre sélectionné</p>
              <p className="text-xs text-[#2E7D32] mt-0.5 font-mono">{formData.id_membre.slice(0, 16)}…</p>
            </div>
          )}
        </Section>
      )}

      {/* ── STEP 2 : Type de compte ── */}
      {currentStep === 2 && (
        <div className="space-y-3">
          <button
            onClick={() => setCurrentStep(1)}
            className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 transition-colors"
          >
            ← Retour à l'étape 1
          </button>

          <Section number={2} icon={Wallet} title="Type de compte">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['epargne', 'cheques', 'terme'] as const).map((type) => {
                const rule = BANK_RULES[type];
                const isSelected = formData.typeCompte === type;

                return (
                  <div
                    key={type}
                    onClick={() => handleAccountTypeSelection(type)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#2E7D32] bg-[#DDEAD5]/40 shadow-md'
                        : 'border-gray-200 hover:border-[#2E7D32]/40 hover:bg-[#DDEAD5]/10'
                    }`}
                  >
                    <div className="text-3xl mb-2">{rule.icon}</div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{rule.title}</h4>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{rule.description}</p>

                    <div className="space-y-1.5">
                      {[
                        { label: 'Dépôt min.', value: `${rule.minDeposit} HTG`, color: 'text-[#2E7D32]' },
                        { label: 'Taux',       value: `${rule.interestRate}%`,   color: 'text-blue-700'   },
                        { label: 'Frais/mois', value: rule.monthlyFees > 0 ? `${rule.monthlyFees} HTG` : 'Gratuit', color: 'text-purple-700' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border border-gray-100">
                          <span className="text-xs text-gray-500">{label}</span>
                          <span className={`text-xs font-bold ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-2 border-t border-[#2E7D32]/20">
                        <span className="text-xs font-bold text-[#2E7D32]">✓ Sélectionné</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {errors.typeCompte && (
              <p className="text-xs text-red-500 mt-3">{errors.typeCompte}</p>
            )}
          </Section>
        </div>
      )}

      {/* ── STEP 3 : Confirmation ── */}
      {currentStep === 3 && formData.typeCompte && (() => {
        const rules = getRulesForAccountType(formData.typeCompte);
        return (
          <div className="space-y-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 transition-colors"
            >
              ← Modifier le type
            </button>

            <Section number={3} icon={CheckCircle} title="Confirmation">

              {/* Type sélectionné */}
              <div className="flex items-center gap-3 p-4 bg-[#DDEAD5]/30 border border-[#2E7D32]/20 rounded-xl mb-4">
                <span className="text-3xl">{rules.icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{rules.title}</p>
                  <p className="text-xs text-gray-500">{rules.description}</p>
                </div>
              </div>

              {/* Grille de règles */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Dépôt minimum',   value: `${rules.minDeposit} HTG`,    color: 'text-[#2E7D32]'  },
                  { label: "Taux d'intérêt",  value: `${rules.interestRate}%`,      color: 'text-blue-700'   },
                  { label: 'Frais mensuels',  value: rules.monthlyFees > 0 ? `${rules.monthlyFees} HTG` : 'Gratuit', color: 'text-purple-700' },
                  { label: 'Calcul intérêts', value:
                      rules.interestCalculation === 'none'             ? 'Aucun' :
                      rules.interestCalculation === 'simple'           ? 'Simple' :
                      rules.interestCalculation === 'compound-monthly' ? 'Composé mensuel' : 'Composé quotidien',
                    color: 'text-indigo-700' },
                  ...(rules.withdrawalLimit ? [{ label: 'Limite retrait/j', value: `${rules.withdrawalLimit} HTG`, color: 'text-orange-700' }] : []),
                  ...(rules.freeWithdrawalsPerMonth ? [{ label: 'Retraits gratuits', value: `${rules.freeWithdrawalsPerMonth}/mois`, color: 'text-teal-700' }] : []),
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 bg-white border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className={`text-sm font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Avantages */}
              <div className="p-4 bg-white border border-gray-100 rounded-xl mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Avantages inclus</p>
                <div className="space-y-1.5">
                  {rules.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#2E7D32] font-bold text-xs mt-0.5">•</span>
                      <p className="text-xs text-gray-600">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infos techniques */}
              <div className="p-3 bg-[#DDEAD5]/20 border border-[#2E7D32]/15 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Informations</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>Statut : <span className="font-semibold text-[#2E7D32]">Actif</span></p>
                  <p>Date d'ouverture : <span className="font-semibold">{new Date(formData.created_at).toLocaleDateString('fr-CA')}</span></p>
                  <p>Numéro : <span className="font-semibold">Généré par le système</span></p>
                </div>
              </div>

              {/* Note éducative */}
              {rules.educationalNote && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-800 leading-relaxed">{rules.educationalNote}</p>
                </div>
              )}

            </Section>
          </div>
        );
      })()}

    </div>
  );
};

export default CompteFormFields;