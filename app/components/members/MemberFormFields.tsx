'use client';

import React, { useEffect, useState } from 'react';
import { HAITI_DEPARTMENTS, getCitiesByDepartment } from '@/app/data/haitiLocations';
import { BranchData } from '../branches/validations';
import { PostData } from '../employees/validations';
import { ErrorMessages } from './validations';
import type { MemberUiForm, FieldErrors, MemberData } from './validations';
import type { DepartmentCode } from '@/app/data/haitiLocations';

/* ─────────────────────────────────────────────────────────────────────────────
   KEEP FOR LATER (COMMENTED OUT ON PURPOSE)
   These fields do NOT exist in MemberUiForm today. If you reintroduce them,
   1) add them to the Zod schema (member.schema.ts),
   2) add them to formData defaults in the modal,
   3) uncomment/handle them in this component.

   // LEGACY / FUTURE CANDIDATES:
   // - department (use department_code instead)
   // - account_type
   // - account_number
   // - membership_tier
   // - income_source
   // - total_amount (read-only display, not a form input)
   // - status (exists on API read model, not on UI form)
────────────────────────────────────────────────────────────────────────────── */
  const MemberFormFields: React.FC<{
    formData: MemberUiForm;
    setFormData: (data: Partial<MemberUiForm>) => void;
    errors: FieldErrors<MemberUiForm>;
    // make it a React state updater to allow setErrors(prev => ...)
    setErrors?: React.Dispatch<React.SetStateAction<FieldErrors<MemberUiForm>>>;
    branches?: any[];
    posts?: any[];
    isEditMode?: boolean;
    onKeepPasswordChange?: (keepCurrent: boolean) => void;  //  prop to communicate password choice
                                                                 
}> = ({ 
  formData, 
  setFormData, 
  errors, 
  setErrors,
  branches = [],  
  isEditMode = false,
  onKeepPasswordChange
}) => {

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [keepCurrentPassword, setKeepCurrentPassword] = useState(true); // Default: keep current password
  const [street, setStreet] = useState<string>('');

  console.log('👥 Professional Member Form:', {
    mode: isEditMode ? 'EDIT' : 'CREATE',
    formData: formData,
  });

  const clearFieldError = (key: keyof MemberUiForm) => {
  if (!setErrors) return;
  setErrors(prev => {
    const next = { ...(prev ?? {}) };
    delete (next as Record<string, string | undefined>)[key as string];
    return next;
  });
};
  // ✅ Compose address that API expects (e.g., "35, Tozin, Limonade")
  useEffect(() => {
    const full = [street.trim(), formData.city?.trim()].filter(Boolean).join(', ');
    setFormData({ address: full });
    // Intentionally not clearing here; we clear error when the user types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [street, formData.city]);

  // Calculate form completion percentage
  const calculateCompletion = () => {
    const fields = [
      formData.first_name,
      formData.last_name,
      formData.id_number,
      formData.phone_number,
      formData.department_code,
      formData.city,
      formData.address,
      formData.gender,
      formData.date_of_birthday,
      formData.email ?? '',
      formData.initial_balance ?? '',
    ];

    const completed = fields.filter(v => v !== '' && v !== undefined && v !== null).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();


  return (
    <div className="space-y-6">
 {/* Professional Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Form Completion
          </span>
          <span className="text-sm font-bold text-green-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>     

      {/* ───────────────────── Informations du membre ───────────────────── */}
      {/* Il faut aussi verifier si le member en question a deja un compte */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations du membre</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Département (codes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Département *</label>
            <select
              value={formData.department_code ?? ''}      // empty string okay before submit
              onChange={(e) => {
                const code = e.target.value as DepartmentCode;
                setFormData({ department_code: code, city: '' });
                clearFieldError('department_code');
                clearFieldError('city');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="" disabled>Sélectionner un département</option>
              {HAITI_DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.department_code && <p className="text-red-500 text-sm mt-1">{errors.department_code}</p>}

          </div>

          {/* Ville (dépend du département) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
            <select
              value={formData.city}
              onChange={(e) => {
                setFormData({ city: e.target.value });
                clearFieldError('city');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="" disabled>
                Sélectionner une ville
              </option>
              {(getCitiesByDepartment(formData.department_code) ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          {/* Rue uniquement — l'adresse complète est dérivée */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rue / Adresse (sans ville) *
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => {
                setStreet(e.target.value);
                clearFieldError('address'); // validate derived field too
              }}
              placeholder="Ex: 35, Tozin"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Adresse complète envoyée : <strong>{formData.address || '—'}</strong>
            </p>
          </div>

          {/* Le reste via .map() (uniquement clés existantes dans MemberUiForm) */}
          {([
            ['first_name', 'Prénom'],
            ['last_name', 'Nom'],
            ['id_number', "Numéro d'identité"],
            ['phone_number', 'Téléphone'],
            ['gender', 'Genre (M/F)'],
            ['date_of_birthday', 'Date de naissance'],
            ['email', 'Email'],
            ['initial_balance', 'Solde initial'],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
              <input
                type={
                  field.includes('balance')
                    ? 'number'
                    : field.includes('date')
                    ? 'date'
                    : 'text'
                }
                value={(formData as any)[field] ?? ''}
                disabled={!!isEditMode && (field === 'id_number' || field === 'initial_balance')}
                onChange={(e) => {
                  const raw = e.target.value;
                  const value =
                    field === 'initial_balance'
                      ? (raw === '' ? undefined : Number(raw))
                      : raw;
                  setFormData({ [field]: value } as Partial<MemberUiForm>);
                  clearFieldError(field);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────── FUTURE: Comptes & Extras ─────────────────────
          If later you add member accounts to the UI form, prefer a dedicated
          sub-section (cards/list) instead of raw inputs:

          - account_type: 'savings' | 'checking' | 'investment' | 'loan'
          - account_number: string
          - initial account deposit workflow → transactions module

          And remember: the current API wants department NAME, not CODE.
          `toMemberApiPayload` already maps:
            department_code → department (human name)
      ───────────────────────────────────────────────────────────────────── */}
    </div>
  );
};

export default MemberFormFields;
