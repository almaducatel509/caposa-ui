'use client';

/* ─────────────────────────────────────────────────────────────────────────────
   BACKEND NOTES — à lire avant de modifier ce fichier
   ─────────────────────────────────────────────────────────────────────────────

   Champs envoyés à l'API (voir toMemberApiFormData dans validations.ts) :
     - first_name, last_name, gender, date_of_birthday
     - id_type, id_number
     - phone_number, email
     - department (nom humain, pas le code), city, address
     - income_source, monthly_income
     - account_type, devise, initial_balance
     - beneficiary_name, beneficiary_relation, beneficiary_phone
     - photo_profil (File, si includePhoto=true)

   Champs NON envoyés à l'API (UI only) :
     - department_code  → converti en department (nom) avant envoi via codeToName()
     - consent          → validation UI uniquement, pas persisté en base
     - address          → dérivé automatiquement de street + city dans le useEffect

   FUTURE CANDIDATES (à ajouter quand le backend supporte) :
     - monthly_income   → pas encore dans le serializer Django, ignoré silencieusement
     - beneficiary_*    → idem, à ajouter dans MemberSerializer.fields
     - id_type          → à ajouter dans le modèle Member Django
     - devise           → déjà dans CaisseSession, à relier au compte membre

   REMINDER : l'API attend department NAME (pas le code).
     toMemberApiPayload() mappe department_code → department via codeToName().

   account_number est GÉNÉRÉ côté backend — ne pas l'exposer dans ce formulaire.
   membership_tier est CALCULÉ côté backend (basé sur initial_balance ou ancienneté).
   status est géré via les actions groupées, pas ici.
   total_amount est READ-ONLY (calculé par le backend via annotate).
────────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState, useRef } from 'react';
import { User, Phone, MapPin, Banknote, Users, ShieldCheck, Camera, X } from 'lucide-react';
import { HAITI_DEPARTMENTS, getCitiesByDepartment } from '@/app/data/haitiLocations';
import type { DepartmentCode } from '@/app/data/haitiLocations';
import type { MemberUiForm, FieldErrors } from './validations';
import PhotoSelector from '../core/upload-file';
import SignatureField from './SignatureField';

// ─── Section wrapper ───────────────────────────────────────────────────────────

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
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, required, error, full, children }: {
  label: string; required?: boolean; error?: string; full?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 ${
        error ? 'border-red-300' : 'border-gray-200 focus:border-[#2E7D32]'
      } ${props.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
    />
  );
}

function Select({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 ${
        error ? 'border-red-300' : 'border-gray-200 focus:border-[#2E7D32]'
      }`}
    >
      {children}
    </select>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ form }: { form: MemberUiForm }) {
  const fields = [
    form.first_name, form.last_name, form.gender, form.date_of_birthday,
    form.id_type, form.id_number, form.phone_number, form.department_code,
    form.city, form.address, form.income_source, form.account_type,
    form.devise, form.consent,
  ];
  const filled = fields.filter(v => v !== '' && v !== undefined && v !== null).length;
  const pct    = Math.round((filled / fields.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Complétion du formulaire</span>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-[#2E7D32]' : 'text-gray-700'}`}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const MemberFormFields: React.FC<{
  formData:    MemberUiForm;
  setFormData: (patch: Partial<MemberUiForm>) => void;
  errors:      FieldErrors<MemberUiForm>;
  setErrors?:  React.Dispatch<React.SetStateAction<FieldErrors<MemberUiForm>>>;
  isEditMode?: boolean;
}> = ({ formData, setFormData, errors, setErrors, isEditMode = false }) => {

  const [street, setStreet] = useState('');
  // const photoRef = useRef<HTMLInputElement>(null);

  const clear = (key: keyof MemberUiForm) => {
    if (!setErrors) return;
    setErrors(prev => { const n = { ...prev }; delete (n as any)[key]; return n; });
  };

  // Compose address from street + city
  useEffect(() => {
    const full = [street.trim(), formData.city?.trim()].filter(Boolean).join(', ');
    setFormData({ address: full });
  }, [street, formData.city]);

  // Pre-fill street from existing address in edit mode
  useEffect(() => {
    if (isEditMode && formData.address && !street) {
      const parts = formData.address.split(',');
      setStreet(parts[0]?.trim() ?? '');
    }
  }, [isEditMode]);

  return (
    <div className="space-y-4">

      <ProgressBar form={formData} />

      {/* ── 1. Identité ── */}
      <Section number={1} icon={User} title="Identité">

      {/* Photo */}
        <div className="space-y-1">
          <PhotoSelector
            value={typeof formData.photo_profil === 'string' ? formData.photo_profil : null}
            onChange={(file) => setFormData({ photo_profil: file, remove_photo: false })}
            onRemove={() => setFormData({ photo_profil: null, remove_photo: true })}
          />
          {errors.photo_profil && <p className="text-xs text-red-500">{errors.photo_profil}</p>}
        </div>
        <Field label="Prénom" required error={errors.first_name}>
          <Input
            value={formData.first_name}
            onChange={e => { setFormData({ first_name: e.target.value }); clear('first_name'); }}
            placeholder="Ex: Jean"
            error={errors.first_name}
          />
        </Field>

        <Field label="Nom" required error={errors.last_name}>
          <Input
            value={formData.last_name}
            onChange={e => { setFormData({ last_name: e.target.value }); clear('last_name'); }}
            placeholder="Ex: Dupont"
            error={errors.last_name}
          />
        </Field>

        <Field label="Genre" required error={errors.gender}>
          <Select
            value={formData.gender}
            onChange={e => { setFormData({ gender: e.target.value as 'M' | 'F' }); clear('gender'); }}
            error={errors.gender}
          >
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </Select>
        </Field>

        <Field label="Date de naissance" required error={errors.date_of_birthday}>
          <Input
            type="date"
            value={formData.date_of_birthday}
            onChange={e => { setFormData({ date_of_birthday: e.target.value }); clear('date_of_birthday'); }}
            error={errors.date_of_birthday}
          />
        </Field>

        <Field label="Type de pièce d'identité" required error={errors.id_type}>
          <Select
            value={formData.id_type}
            onChange={e => { setFormData({ id_type: e.target.value as any }); clear('id_type'); }}
            error={errors.id_type}
          >
            <option value="" disabled>— Sélectionner —</option>
            <option value="cin">Carte d'identité nationale (CIN)</option>
            <option value="passeport">Passeport</option>
            <option value="permis">Permis de conduire</option>
            <option value="autre">Autre</option>
          </Select>
        </Field>

        <Field label="Numéro de pièce" required error={errors.id_number}>
          <Input
            value={formData.id_number}
            onChange={e => { setFormData({ id_number: e.target.value }); clear('id_number'); }}
            placeholder="Ex: 001-234-567-8"
            disabled={isEditMode}
            error={errors.id_number}
          />
        </Field>

      </Section>

      {/* ── 2. Contact & Localisation ── */}
      <Section number={2} icon={Phone} title="Contact & Localisation">

        <Field label="Téléphone" required error={errors.phone_number}>
          <Input
            type="tel"
            value={formData.phone_number}
            onChange={e => { setFormData({ phone_number: e.target.value.replace(/\D/g, '') }); clear('phone_number'); }}
            placeholder="Ex: 50912345678"
            error={errors.phone_number}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={formData.email ?? ''}
            onChange={e => { setFormData({ email: e.target.value }); clear('email'); }}
            placeholder="Ex: jean@email.com"
            error={errors.email}
          />
        </Field>

        <Field label="Département" required error={errors.department_code}>
          <Select
            value={formData.department_code ?? ''}
            onChange={e => {
              setFormData({ department_code: e.target.value as DepartmentCode, city: '' });
              clear('department_code'); clear('city');
            }}
            error={errors.department_code}
          >
            <option value="" disabled>— Sélectionner —</option>
            {HAITI_DEPARTMENTS.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Ville" required error={errors.city}>
          <Select
            value={formData.city}
            onChange={e => { setFormData({ city: e.target.value }); clear('city'); }}
            error={errors.city}
          >
            <option value="" disabled>— Sélectionner —</option>
            {(getCitiesByDepartment(formData.department_code as DepartmentCode) ?? []).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>

        <Field label="Rue / Quartier" required error={errors.address} full>
          <Input
            value={street}
            onChange={e => { setStreet(e.target.value); clear('address'); }}
            placeholder="Ex: 35, Rue Pavée"
            error={errors.address}
          />
          {formData.address && (
            <p className="text-xs text-gray-400 mt-1">
              Adresse complète : <span className="font-medium text-gray-600">{formData.address}</span>
            </p>
          )}
        </Field>

      </Section>

      {/* ── 3. Situation financière ── */}
      <Section number={3} icon={Banknote} title="Situation financière">

        <Field label="Source de revenus" required error={errors.income_source}>
          <Select
            value={formData.income_source}
            onChange={e => { setFormData({ income_source: e.target.value as any }); clear('income_source'); }}
            error={errors.income_source}
          >
            <option value="" disabled>— Sélectionner —</option>
            <option value="salarie">Salarié(e)</option>
            <option value="commercant">Commerçant(e)</option>
            <option value="agriculteur">Agriculteur(trice)</option>
            <option value="diaspora">Diaspora / Transfert</option>
            <option value="retraite">Retraité(e)</option>
            <option value="autre">Autre</option>
          </Select>
        </Field>

        <Field label="Revenu mensuel estimé (HTG)" error={errors.monthly_income}>
          <Input
            type="number"
            min="0"
            value={formData.monthly_income ?? ''}
            onChange={e => {
              setFormData({ monthly_income: e.target.value ? Number(e.target.value) : undefined });
              clear('monthly_income');
            }}
            placeholder="Ex: 15000"
            error={errors.monthly_income}
          />
        </Field>

      </Section>

      {/* ── 4. Compte à ouvrir ── */}
      {/* BACKEND: account_type et devise sont envoyés à l'API.
          account_number est GÉNÉRÉ côté backend — ne pas l'exposer ici.
          initial_balance → utilisé pour créer le premier dépôt côté Django.
          Si le backend ne supporte pas encore devise, il sera ignoré silencieusement. */}
      <Section number={4} icon={Banknote} title="Compte à ouvrir">

        <Field label="Type de compte" required error={errors.account_type}>
          <Select
            value={formData.account_type}
            onChange={e => { setFormData({ account_type: e.target.value as any }); clear('account_type'); }}
            error={errors.account_type}
            disabled={isEditMode}
          >
            <option value="savings">Épargne</option>
            <option value="checking">Courant</option>
          </Select>
        </Field>

        <Field label="Devise" required error={errors.devise}>
          <Select
            value={formData.devise}
            onChange={e => { setFormData({ devise: e.target.value as any }); clear('devise'); }}
            error={errors.devise}
            disabled={isEditMode}
          >
            <option value="HTG">HTG — Gourde haïtienne</option>
            <option value="USD">USD — Dollar américain</option>
          </Select>
        </Field>

        <Field label="Solde initial" error={errors.initial_balance}>
          <Input
            type="number"
            min="0"
            value={formData.initial_balance ?? ''}
            onChange={e => {
              setFormData({ initial_balance: e.target.value ? Number(e.target.value) : undefined });
              clear('initial_balance');
            }}
            placeholder="0.00"
            disabled={isEditMode}
            error={errors.initial_balance}
          />
        </Field>

      </Section>

      {/* ── 5. Bénéficiaire désigné ── */}
      <Section number={5} icon={Users} title="Bénéficiaire désigné">

        <div className="md:col-span-2 -mt-1 mb-1">
          <p className="text-xs text-gray-400">
            Personne à contacter ou à qui reviennent les fonds en cas de décès du membre.
          </p>
          {/* BACKEND: beneficiary_name, beneficiary_relation, beneficiary_phone
              À ajouter dans MemberSerializer.fields et Member model Django.
              Actuellement envoyés mais ignorés si le serializer ne les inclut pas. */}
        </div>

        <Field label="Nom complet du bénéficiaire" error={errors.beneficiary_name} full>
          <Input
            value={formData.beneficiary_name ?? ''}
            onChange={e => { setFormData({ beneficiary_name: e.target.value }); clear('beneficiary_name'); }}
            placeholder="Ex: Marie Dupont"
            error={errors.beneficiary_name}
          />
        </Field>

        <Field label="Lien de parenté" error={errors.beneficiary_relation}>
          <Select
            value={formData.beneficiary_relation ?? ''}
            onChange={e => { setFormData({ beneficiary_relation: e.target.value as any }); clear('beneficiary_relation'); }}
            error={errors.beneficiary_relation}
          >
            <option value="" disabled>— Sélectionner —</option>
            <option value="conjoint">Conjoint(e)</option>
            <option value="enfant">Enfant</option>
            <option value="parent">Parent</option>
            <option value="frere_soeur">Frère / Sœur</option>
            <option value="autre">Autre</option>
          </Select>
        </Field>

        <Field label="Téléphone du bénéficiaire" error={errors.beneficiary_phone}>
          <Input
            type="tel"
            value={formData.beneficiary_phone ?? ''}
            onChange={e => { setFormData({ beneficiary_phone: e.target.value.replace(/\D/g, '') }); clear('beneficiary_phone'); }}
            placeholder="Ex: 50912345678"
            error={errors.beneficiary_phone}
          />
        </Field>

      </Section>
      {/* ── 6. Consentement ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Consentement & traitement des données</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Conformément aux lois en vigueur sur la protection des données personnelles.
            </p>
          </div>
        </div>

        {/* Checkbox consentement */}
        <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
          formData.consent
            ? 'bg-[#DDEAD5]/50 border-[#2E7D32]/30'
            : errors.consent
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:bg-gray-50'
        }`}>
          <input
            type="checkbox"
            checked={formData.consent === true}
            onChange={e => {
              setFormData({ consent: e.target.checked ? true : (undefined as any) });
              clear('consent');
            }}
            className="mt-0.5 w-4 h-4 accent-[#2E7D32]"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            J'accepte que la coopérative collecte et traite mes données personnelles dans le cadre
            de mon adhésion et de la gestion de mon compte. Ces données ne seront pas partagées
            avec des tiers sans mon consentement explicite.
          </span>
        </label>
        {errors.consent && <p className="text-xs text-red-500 mt-2">{errors.consent}</p>}

        {/* Signature — EN DEHORS du label */}
        <SignatureField
          value={formData.signature ?? ''}
          onChange={(val) => setFormData({ signature: val })}
          error={errors.signature}
        />
      </div>

    </div>
  );
};

export default MemberFormFields;