'use client';

import React, { useState } from 'react';
import CompteAutocomplete from './CompteAutocomplete';
import { BANK_RULES, getRulesForAccountType } from '@/app/lib/bankRules';

// ============= TYPES =============
interface CompteFormData {
  id_membre: string;
  typeCompte: 'epargne' | 'cheques' | 'terme' | '';
  statutCompte: "actif" | "ferme" | "suspendu";
  dateOuverture: string;
  tauxInteret: number | null;
  limiteTrait: number | null;
  fraisServiceMensuel: number | null;
  member_details?: {
    full_name?: string;
    first_name: string;
    last_name: string;
    id_number: string;
    phone_number: string;
    email?: string;
  };
}

type FormMode = 'create' | 'edit' | 'view';

interface CompteFormFieldsProps {
  formData: CompteFormData;
  setFormData: (data: Partial<CompteFormData>) => void;
  errors: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mode?: FormMode;
}

// ============= COMPONENT =============
const CompteFormFields: React.FC<CompteFormFieldsProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  mode = 'create',
}) => {
  
  const [currentStep, setCurrentStep] = useState(1);
  const isCreateMode = mode === 'create';

  // ============= HANDLERS =============
  const clearError = (field: string) => {
    if (setErrors) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 🔥 Application automatique des règles métier
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
    
    console.log(`✅ Type de compte "${type}" sélectionné`);
    console.log(`📊 Règles appliquées automatiquement:`, {
      taux: rules.interestRate,
      frais: rules.monthlyFees,
      limite: rules.withdrawalLimit || 'N/A'
    });
  };

  // ============= RENDER MODE EDIT/VIEW =============
  if (!isCreateMode) {
    return (
      <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
        <p className="text-yellow-800 font-semibold">⚠️ Mode {mode} non disponible dans cette version</p>
        <p className="text-yellow-700 text-sm mt-2">Ce formulaire est optimisé pour la création de nouveaux comptes uniquement.</p>
      </div>
    );
  }

  // ============= RENDER CREATE MODE =============
  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-1 mx-2 transition-all ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className={currentStep >= 1 ? 'text-blue-700' : 'text-gray-500'}>1. Membre</span>
          <span className={currentStep >= 2 ? 'text-blue-700' : 'text-gray-500'}>2. Type</span>
          <span className={currentStep >= 3 ? 'text-blue-700' : 'text-gray-500'}>3. Confirmation</span>
        </div>
      </div>

      {/* STEP 1: Sélection du Membre */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">👤</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Sélection du Membre</h3>
              <p className="text-gray-600">Choisissez le titulaire du nouveau compte</p>
            </div>
          </div>
          
          <CompteAutocomplete
            selectedKey={formData.id_membre}
            onSelectionChange={(id: string) => {
              setFormData({ id_membre: id });
              clearError('id_membre');
              if (id) setCurrentStep(2);
            }}
            errorMessage={errors.id_membre}
            isRequired
            placeholder="Rechercher par nom ou ID..."
          />
          
          {formData.id_membre && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-green-800 font-semibold">✅ Membre sélectionné</p>
              <p className="text-green-700 text-sm mt-1">ID: <span className="font-mono">{formData.id_membre.slice(0, 12)}...</span></p>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Choix du Type de Compte */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← Retour à l'étape 1
          </button>

          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">💼</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Type de Compte</h3>
                <p className="text-gray-600">Sélectionnez le type adapté aux besoins du membre</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['epargne', 'cheques', 'terme'] as const).map((type) => {
                const rule = BANK_RULES[type];
                const isSelected = formData.typeCompte === type;
                
                return (
                  <div
                    key={type}
                    onClick={() => handleAccountTypeSelection(type)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                        : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div className="text-5xl mb-3">{rule.icon}</div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{rule.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Dépôt min:</span>
                        <span className="font-bold text-green-700">{rule.minDeposit} HTG</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Taux:</span>
                        <span className="font-bold text-blue-700">{rule.interestRate}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Frais/mois:</span>
                        <span className="font-bold text-purple-700">{rule.monthlyFees} HTG</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t-2 border-blue-200">
                        <span className="text-sm font-bold text-blue-600">✓ Sélectionné</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {errors.typeCompte && (
              <p className="text-red-500 text-sm mt-4 font-semibold">{errors.typeCompte}</p>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Confirmation et Règles Appliquées */}
      {currentStep === 3 && formData.typeCompte && (
        <div className="space-y-4">
          <button
            onClick={() => setCurrentStep(2)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← Modifier le type de compte
          </button>

          <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">✅</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Règles Appliquées</h3>
                <p className="text-gray-600">Vérifiez les paramètres du nouveau compte</p>
              </div>
            </div>

            {(() => {
              const rules = getRulesForAccountType(formData.typeCompte);
              
              return (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-green-200">
                    <span className="text-4xl">{rules.icon}</span>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{rules.title}</h4>
                      <p className="text-sm text-gray-600">{rules.description}</p>
                    </div>
                  </div>

                  {/* Règles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">💰 Dépôt minimum</p>
                      <p className="text-2xl font-bold text-green-700">{rules.minDeposit} HTG</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">📈 Taux d'intérêt</p>
                      <p className="text-2xl font-bold text-blue-700">{rules.interestRate}%</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">💳 Frais mensuels</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {rules.monthlyFees > 0 ? `${rules.monthlyFees} HTG` : 'Gratuit'}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">🔄 Calcul intérêts</p>
                      <p className="text-lg font-bold text-indigo-700">
                        {rules.interestCalculation === 'none' ? 'Aucun' :
                         rules.interestCalculation === 'simple' ? 'Simple' :
                         rules.interestCalculation === 'compound-monthly' ? 'Composé (mensuel)' :
                         'Composé (quotidien)'}
                      </p>
                    </div>

                    {rules.withdrawalLimit && (
                      <div className="p-4 bg-white rounded-lg border">
                        <p className="text-xs text-gray-600 mb-1">🏧 Limite retrait/jour</p>
                        <p className="text-2xl font-bold text-orange-700">{rules.withdrawalLimit} HTG</p>
                      </div>
                    )}

                    {rules.freeWithdrawalsPerMonth && (
                      <div className="p-4 bg-white rounded-lg border">
                        <p className="text-xs text-gray-600 mb-1">🎁 Retraits gratuits/mois</p>
                        <p className="text-2xl font-bold text-teal-700">{rules.freeWithdrawalsPerMonth}</p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm font-bold text-gray-700 mb-3">✨ Avantages inclus</p>
                    <div className="space-y-2">
                      {rules.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold mt-0.5">•</span>
                          <p className="text-sm text-gray-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info métadonnées */}
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-xs font-bold text-blue-800 mb-2">📋 Informations techniques</p>
                    <div className="space-y-1 text-xs text-blue-700">
                      <p>• Statut du compte : <span className="font-semibold">Actif</span></p>
                      <p>• Date d'ouverture : <span className="font-semibold">{new Date(formData.dateOuverture).toLocaleDateString('fr-CA')}</span></p>
                      <p>• Numéro de compte : <span className="font-semibold">Généré par le backend</span></p>
                    </div>
                  </div>

                  {/* Note éducative */}
                  {rules.educationalNote && (
                    <div className="p-4 bg-linear-to-r from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300">
                      <p className="text-sm text-amber-900 leading-relaxed">
                        {rules.educationalNote}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompteFormFields;