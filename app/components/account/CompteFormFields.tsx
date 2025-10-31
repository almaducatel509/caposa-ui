'use client';
import React, { useEffect } from 'react';
import { AccountFormData } from './validationsaccount';
import { FaInfoCircle, FaLock } from 'react-icons/fa';

type Errors = Record<string, string>;

const AccountFormFields: React.FC<{
  formData: AccountFormData;
  setFormData: (data: Partial<AccountFormData>) => void;
  errors: Errors;
  setErrors?: (errors: Errors) => void;
  members?: Array<{ id: string; first_name?: string; last_name?: string }>;
  employees?: Array<{ id: string; first_name?: string; last_name?: string }>;
  isEditMode?: boolean;
}> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  members = [],
  employees = [],
  isEditMode = false,
}) => {
  // Helper setters
  const handleChange = (key: keyof AccountFormData, value: any) => {
    setFormData({ [key]: value } as Partial<AccountFormData>);
  };

  const handleNumber = (key: keyof AccountFormData, value: string) => {
    const num = value === '' ? undefined : Number(value);
    setFormData({ [key]: num } as Partial<AccountFormData>);
  };

  const completionPercentage = (() => {
    const requiredFields = [
      formData.noCompte,
      formData.idMembre,
      formData.typeCompte,
      formData.dateOuverture,
    ];
    
    // En mode CREATE, inclure dépôt initial
    if (!isEditMode) {
      requiredFields.push(
        typeof formData.depotInitial !== 'undefined' ? String(formData.depotInitial) : ''
      );
    }
    
    const filled = requiredFields.filter((f) => f !== undefined && String(f).trim() !== '').length;
    return Math.round((filled / requiredFields.length) * 100);
  })();

  // Auto-clear errors
  useEffect(() => {
    if (!setErrors) return;
    const newErrors: Errors = { ...errors };
    Object.keys(newErrors).forEach((k) => {
      const val = (formData as any)[k];
      if (val !== undefined && val !== '' && val !== null) {
        delete newErrors[k];
      }
    });
    setErrors(Object.keys(newErrors).length ? newErrors : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Formater le solde en monnaie
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0,00 $';
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression du formulaire</span>
          <span className="text-sm font-bold text-green-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Identification du Membre (TOUJOURS EN PREMIER) */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Titulaire du Compte
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membre * {!isEditMode && <span className="text-xs text-gray-500">(Doit être membre actif)</span>}
            </label>
            <select
              value={formData.idMembre || ''}
              onChange={(e) => handleChange('idMembre', e.target.value)}
              disabled={isEditMode}  // ✅ Ne peut PAS changer le membre en édition
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Sélectionner un membre</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name || ''} {m.last_name || ''} (ID: {m.id})
                </option>
              ))}
            </select>
            {errors.idMembre && <p className="text-red-500 text-sm mt-1">{errors.idMembre}</p>}
            {isEditMode && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <FaLock className="text-gray-400" />
                Le titulaire ne peut pas être modifié après création
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Informations du Compte */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏦</span> Informations du Compte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de Compte * {!isEditMode && <span className="text-xs text-gray-500">(Généré automatiquement)</span>}
            </label>
            <input
              type="text"
              value={formData.noCompte || ''}
              onChange={(e) => handleChange('noCompte', e.target.value)}
              placeholder="Ex: 001-123456"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 font-mono"
            />
            {errors.noCompte && <p className="text-red-500 text-sm mt-1">{errors.noCompte}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de Compte *</label>
            <select
              value={formData.typeCompte || ''}
              onChange={(e) => handleChange('typeCompte', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Choisir un type</option>
              <option value="epargne">💰 Épargne (Min. 25$)</option>
              <option value="cheques">📝 Chèques (Min. 100$)</option>
              <option value="terme">⏰ Terme (Min. 500$)</option>
            </select>
            {errors.typeCompte && <p className="text-red-500 text-sm mt-1">{errors.typeCompte}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut du Compte</label>
            <select
              value={formData.statutCompte || 'actif'}
              onChange={(e) => handleChange('statutCompte', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="actif">✅ Actif</option>
              <option value="suspendu">⏸️ Suspendu</option>
              <option value="ferme">🔒 Fermé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date d'Ouverture *</label>
            <input
              type="date"
              value={formData.dateOuverture || ''}
              onChange={(e) => handleChange('dateOuverture', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            {errors.dateOuverture && <p className="text-red-500 text-sm mt-1">{errors.dateOuverture}</p>}
          </div>
        </div>
      </div>

      {/* Solde du Compte - DIFFÉRENT selon le mode */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💵</span> {isEditMode ? 'Solde Actuel' : 'Dépôt Initial'}
        </h3>
        
        {isEditMode ? (
          // ✅ MODE EDIT: Solde en LECTURE SEULE
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Solde Actuel</span>
              <FaLock className="text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(formData.soldeActuel)}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
              <FaInfoCircle className="text-blue-500 flex-shrink-0" />
              <span>
                Le solde ne peut être modifié que via les transactions (dépôts/retraits). 
                Pour modifier le solde, utilisez le module Transactions.
              </span>
            </div>
          </div>
        ) : (
          // ✅ MODE CREATE: Dépôt Initial
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dépôt Initial * <span className="text-xs text-gray-500">(Deviendra le solde du compte)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={typeof formData.depotInitial === 'number' ? String(formData.depotInitial) : ''}
                onChange={(e) => handleNumber('depotInitial', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-lg font-semibold"
              />
            </div>
            {errors.depotInitial && <p className="text-red-500 text-sm mt-1">{errors.depotInitial}</p>}
            
            {/* Avertissements selon le type */}
            {formData.typeCompte && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Minimum requis:</strong>{' '}
                {formData.typeCompte === 'epargne' && '25,00 $ pour un compte épargne'}
                {formData.typeCompte === 'cheques' && '100,00 $ pour un compte chèques'}
                {formData.typeCompte === 'terme' && '500,00 $ pour un compte à terme'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paramètres Financiers */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">⚙️</span> Paramètres Financiers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Taux d'intérêt (Épargne/Terme) */}
          {(formData.typeCompte === 'epargne' || formData.typeCompte === 'terme') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taux d'Intérêt Annuel * <span className="text-xs text-gray-500">(Requis pour ce type)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={typeof formData.tauxInteret === 'number' ? String(formData.tauxInteret) : ''}
                  onChange={(e) => handleNumber('tauxInteret', e.target.value)}
                  placeholder="Ex: 2.50"
                  className="w-full pr-8 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">%</span>
              </div>
              {errors.tauxInteret && <p className="text-red-500 text-sm mt-1">{errors.tauxInteret}</p>}
            </div>
          )}

          {/* Limite de retrait (Chèques) */}
          {formData.typeCompte === 'cheques' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite de Retrait Quotidienne * <span className="text-xs text-gray-500">(Requis pour chèques)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={typeof formData.limiteTrait === 'number' ? String(formData.limiteTrait) : ''}
                  onChange={(e) => handleNumber('limiteTrait', e.target.value)}
                  placeholder="Ex: 500.00"
                  className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              {errors.limiteTrait && <p className="text-red-500 text-sm mt-1">{errors.limiteTrait}</p>}
            </div>
          )}

          {/* Frais de service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frais de Service Mensuel <span className="text-xs text-gray-500">(Optionnel)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={typeof formData.fraisServiceMensuel === 'number' ? String(formData.fraisServiceMensuel) : ''}
                onChange={(e) => handleNumber('fraisServiceMensuel', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gestion (Conseiller assigné) */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👔</span> Gestion du Compte
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conseiller Assigné <span className="text-xs text-gray-500">(Optionnel)</span>
            </label>
            <select
              value={formData.idEmployee || ''}
              onChange={(e) => handleChange('idEmployee', e.target.value || undefined)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Aucun conseiller assigné</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name || ''} {emp.last_name || ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Le conseiller assigné sera le point de contact principal pour ce compte
            </p>
          </div>
        </div>
      </div>

      {/* Résumé Professionnel */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
          <span className="text-xl">✅</span> Résumé du Compte
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <span className="text-xs font-medium text-gray-600 uppercase">Numéro</span>
            <div className="mt-2 font-bold text-gray-900 font-mono">
              {formData.noCompte || '—'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <span className="text-xs font-medium text-gray-600 uppercase">Titulaire</span>
            <div className="mt-2 font-semibold text-gray-900">
              {members.find((m) => m.id === formData.idMembre)
                ? `${members.find((m) => m.id === formData.idMembre)!.first_name || ''} ${members.find((m) => m.id === formData.idMembre)!.last_name || ''}`
                : '—'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <span className="text-xs font-medium text-gray-600 uppercase">Type</span>
            <div className="mt-2 font-semibold text-gray-900 capitalize">
              {formData.typeCompte || '—'}
            </div>
          </div>
        </div>
        
        {!isEditMode && formData.depotInitial && formData.depotInitial > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Dépôt Initial</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(formData.depotInitial)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Ce montant deviendra le solde initial du compte après création
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountFormFields;