'use client';

import React, { useState, useEffect } from 'react';
import { HAITI_DEPARTMENTS, getCitiesByDepartment } from '@/app/data/haitiLocations';
import type { DepartmentCode } from '@/app/data/haitiLocations';

import { BranchData, Post, EmployeeFormData, ErrorMessages } from './validations';
import { EmailField } from './EmailField';
import EmployeePhotoField from './EmployeePhotoField';
import {
  User, Mail, Lock, Phone, MapPin, Building2,
  Briefcase, CheckCircle2, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import PhotoSelector from '../core/upload-file';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ step, title, icon: Icon }: {
  step: number; title: string; icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-6 h-6 rounded-lg bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">{step}</span>
      </div>
      <Icon className="w-4 h-4 text-gray-400" />
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function Field({ label, required, error, hint, className = '', children }: {
  label: string; required?: boolean; error?: string;
  hint?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function Input({ hasError, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all
        focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
        disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
        ${hasError
          ? 'border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400'
          : 'border-gray-200 bg-white hover:border-gray-300'
        } ${className}`}
    />
  );
}

function Select({ hasError, className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  return (
    <select {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all appearance-none bg-white
        focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
        disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
        ${hasError
          ? 'border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400'
          : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const EmployeeFormFields: React.FC<{
  formData: EmployeeFormData;
  setFormData: (data: Partial<EmployeeFormData>) => void;
  errors: ErrorMessages<EmployeeFormData>;
  setErrors?: (errors: Partial<ErrorMessages<EmployeeFormData>>) => void;
  branches?: BranchData[];
  posts?: Post[];
  isEditMode?: boolean;
  onKeepPasswordChange?: (keepCurrent: boolean) => void;
}> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  branches = [],
  posts = [],
  isEditMode = false,
  onKeepPasswordChange,
}) => {

  const [keepCurrentPassword, setKeepCurrentPassword] = useState(true);
  const [departmentCode, setDepartmentCode] = useState<DepartmentCode>(HAITI_DEPARTMENTS[0].code);
  const [city, setCity]     = useState<string>('');
  const [street, setStreet] = useState<string>('');

  // Parse existing address in edit mode
  useEffect(() => {
    if (isEditMode && formData.address) {
      const parts = formData.address.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        setStreet(parts[0] || '');
        setCity(parts[1] || '');
        const dept = HAITI_DEPARTMENTS.find(d =>
          getCitiesByDepartment(d.code)?.includes(parts[1])
        );
        if (dept) setDepartmentCode(dept.code);
      } else {
        setStreet(formData.address);
      }
    }
  }, [isEditMode, formData.address]);

  // Compose full address when components change
  useEffect(() => {
    const full = [street.trim(), city.trim()].filter(Boolean).join(', ');
    if (full !== formData.address) setFormData({ address: full });
  }, [street, city]);

  useEffect(() => {
    if (onKeepPasswordChange) onKeepPasswordChange(keepCurrentPassword);
  }, [keepCurrentPassword, onKeepPasswordChange]);

  const clearFieldError = (key: keyof EmployeeFormData) => {
    if (!setErrors) return;
    setErrors({ [key]: undefined });
  };

  const calculateCompletion = () => {
    const fields = [
      formData.user.username, formData.user.email,
      formData.first_name, formData.last_name,
      formData.date_of_birth, formData.phone_number,
      formData.address, formData.gender,
      formData.payment_ref, formData.branch,
      formData.posts?.length > 0 ? 'has_posts' : '',
    ];
    if (!isEditMode) {
      fields.push(formData.user.password, formData.user.confirm_password);
    } else if (!keepCurrentPassword) {
      fields.push(formData.user.password, formData.user.confirm_password);
    }
    const completed = fields.filter(f => f && f.toString().trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  const handleUserFieldChange = (field: keyof EmployeeFormData['user'], value: string) => {
    setFormData({ user: { ...formData.user, [field]: value } });
  };

  const handlePostChange = (postId: string, isChecked: boolean) => {
    const current = formData.posts || [];
    setFormData({
      posts: isChecked ? [...current, postId] : current.filter(id => id !== postId),
    });
  };

  return (
    <div className="flex flex-col gap-5">
          {/* ── Barre de progression ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Complétion du formulaire</span>
          <span className="text-sm font-bold text-[#2E7D32]">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-linear-to-r from-[#2E7D32] to-[#81C784] h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* ── 1. Compte utilisateur ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={1} title="Compte utilisateur" icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Field label="Nom d'utilisateur" required error={errors.username}>
            <Input
              type="text"
              autoComplete="off"
              value={formData.user.username}
              onChange={e => handleUserFieldChange('username', e.target.value)}
              placeholder="Ex: jdupont"
              hasError={!!errors.username}
            />
          </Field>

          <Field label="Email" required error={errors.email}>
            <EmailField
              value={formData.user.email}
              onChange={value => handleUserFieldChange('email', value)}
              context="employee"
              error={errors.email}
              required
            />
          </Field>

          {/* Gestion mot de passe */}
          {isEditMode ? (
            <div className="sm:col-span-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setKeepCurrentPassword(p => {
                    if (!p) {
                      handleUserFieldChange('password', '');
                      handleUserFieldChange('confirm_password', '');
                    }
                    return !p;
                  });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                  ${keepCurrentPassword
                    ? 'border-[#2E7D32] bg-[#DDEAD5]/40'
                    : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                  ${keepCurrentPassword ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-gray-300'}`}>
                  {keepCurrentPassword && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${keepCurrentPassword ? 'text-[#1B5E20]' : 'text-gray-700'}`}>
                    Garder le mot de passe actuel
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Décocher uniquement pour changer le mot de passe</p>
                </div>
              </button>

              {!keepCurrentPassword && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <div className="flex items-start gap-2 sm:col-span-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 font-medium">Vous êtes en train de changer le mot de passe.</p>
                  </div>
                  <Field label="Nouveau mot de passe" required error={errors.password}>
                    <Input type="password" value={formData.user.password}
                      onChange={e => handleUserFieldChange('password', e.target.value)}
                      placeholder="Nouveau mot de passe" hasError={!!errors.password} />
                  </Field>
                  <Field label="Confirmer le mot de passe" required error={errors.confirm_password}>
                    <Input type="password" value={formData.user.confirm_password}
                      onChange={e => handleUserFieldChange('confirm_password', e.target.value)}
                      placeholder="Confirmer le mot de passe" hasError={!!errors.confirm_password} />
                  </Field>
                </div>
              )}
            </div>
          ) : (
            <>
              <Field label="Mot de passe" required error={errors.password}>
                {/* // Password création */}

                <Input
                  type="password"
                  autoComplete="new-password"
                  value={formData.user.password}
                  onChange={e => handleUserFieldChange('password', e.target.value)}
                  placeholder="Mot de passe"
                  hasError={!!errors.password}
                />
              </Field>
              <Field label="Confirmer le mot de passe" required error={errors.confirm_password}>
                {/* // Confirm password création   */}
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={formData.user.confirm_password}
                  onChange={e => handleUserFieldChange('confirm_password', e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  hasError={!!errors.confirm_password}
                />
              </Field>
            </>
          )}
        </div>
      </div>

      {/* ── 2. Informations personnelles ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={2} title="Informations personnelles" icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="space-y-1">
            <PhotoSelector
              value={typeof formData.photo_profil === 'string' ? formData.photo_profil : null}
              onChange={(file) => setFormData({ photo_profil: file, remove_photo: false })}
              onRemove={() => setFormData({ photo_profil: null, remove_photo: true })}
            />
            {errors.photo_profil && <p className="text-xs text-red-500">{errors.photo_profil}</p>}
          </div>


          <Field label="Prénom" required error={errors.first_name}>
            <Input type="text" value={formData.first_name}
              onChange={e => setFormData({ first_name: e.target.value })}
              placeholder="Prénom" hasError={!!errors.first_name} />
          </Field>

          <Field label="Nom" required error={errors.last_name}>
            <Input type="text" value={formData.last_name}
              onChange={e => setFormData({ last_name: e.target.value })}
              placeholder="Nom de famille" hasError={!!errors.last_name} />
          </Field>

          <Field label="Date de naissance" required error={errors.date_of_birth}>
            <Input type="date" value={formData.date_of_birth}
              onChange={e => setFormData({ date_of_birth: e.target.value })}
              hasError={!!errors.date_of_birth} />
          </Field>

          <Field label="Genre" required error={errors.gender}>
            <Select value={formData.gender}
              onChange={e => setFormData({ gender: e.target.value })}
              hasError={!!errors.gender}>
              <option value="">Sélectionner le genre</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="other">Autre</option>
            </Select>
          </Field>

          <Field label="Téléphone" required error={errors.phone_number}>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input type="tel" value={formData.phone_number}
                onChange={e => setFormData({ phone_number: e.target.value.replace(/\D/g, '') })}
                placeholder="Ex: 36000000" hasError={!!errors.phone_number}
                className="pl-9" />
            </div>
          </Field>

          <Field label="Référence de paiement" required error={errors.payment_ref}>
            <Input type="text" value={formData.payment_ref}
              onChange={e => setFormData({ payment_ref: e.target.value })}
              placeholder="Référence de paiement" hasError={!!errors.payment_ref} />
          </Field>

          {/* Adresse Haïti */}
          <Field label="Département" required>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Select value={departmentCode}
                onChange={e => {
                  setDepartmentCode(e.target.value as DepartmentCode);
                  setCity('');
                  clearFieldError('address');
                }}
                className="pl-9">
                <option value="">Sélectionner un département</option>
                {HAITI_DEPARTMENTS.map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </Select>
            </div>
          </Field>

          <Field label="Ville" required>
            <Select value={city}
              onChange={e => { setCity(e.target.value); clearFieldError('address'); }}
              disabled={!departmentCode}>
              <option value="">Sélectionner une ville</option>
              {departmentCode && getCitiesByDepartment(departmentCode)?.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Rue / Numéro de maison" required error={errors.address}
            hint={`Adresse complète : ${formData.address || '—'}`}
            className="sm:col-span-2">
            <Input type="text" value={street}
              onChange={e => { setStreet(e.target.value); clearFieldError('address'); }}
              placeholder="Ex: 35, Tozin" hasError={!!errors.address} />
          </Field>
        </div>
      </div>

      {/* ── 3. Affectation de travail ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={3} title="Affectation de travail" icon={Building2} />

        <div className="flex flex-col gap-4">

          <Field label={`Branche (${branches.length} disponibles)`} required error={errors.branch}>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Select
                value={formData.branch || ''}
                onChange={e => setFormData({ branch: e.target.value })}
                hasError={!!errors.branch}
                className="pl-9">
                <option value="">Choisir une branche</option>
                {branches.map(b => (
                  <option key={b.id} value={String(b.id)}>{b.branch_name}</option>
                ))}
              </Select>
            </div>
          </Field>

          <Field
            label={`Postes (${posts.length} disponibles)`}
            required
            error={errors.posts}>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              {formData.posts && formData.posts.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#DDEAD5] text-[#1B5E20] font-semibold">
                  {formData.posts.length} sélectionné{formData.posts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="border border-gray-200 rounded-xl p-3 bg-white max-h-44 overflow-y-auto flex flex-col gap-1">
              {posts.map(post => {
                const isChecked = formData.posts?.includes(String(post.id)) || false;
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => handlePostChange(String(post.id), !isChecked)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all
                      ${isChecked
                        ? 'border-[#2E7D32] bg-[#DDEAD5]/40'
                        : 'border-gray-100 bg-white hover:border-[#2E7D32]/30 hover:bg-[#DDEAD5]/10'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                      ${isChecked ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-gray-300'}`}>
                      {isChecked && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-sm ${isChecked ? 'font-semibold text-[#1B5E20]' : 'text-gray-700'}`}>
                      {post.name || post.post_name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

        </div>
      </div>

      {/* ── 4. Récapitulatif affectation ── */}
      {(formData.branch || (formData.posts && formData.posts.length > 0)) && (
        <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
          <SectionHeader step={4} title="Récapitulatif de l'affectation" icon={ShieldCheck} />
          <div className="flex flex-col gap-3">

            {formData.branch && (
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">Branche</p>
                <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-[#DDEAD5] text-[#1B5E20]">
                  {branches.find(b => String(b.id) === String(formData.branch))?.branch_name || '—'}
                </span>
              </div>
            )}

            {formData.posts && formData.posts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-2">
                  Postes ({formData.posts.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.posts.map(postId => {
                    const post = posts.find(p => String(p.id) === postId);
                    return (
                      <span key={postId}
                        className="bg-blue-50 text-[#355C7D] px-3 py-1 rounded-full text-xs font-semibold">
                        {post?.name || post?.post_name || '—'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeFormFields;