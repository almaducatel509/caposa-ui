'use client';

import React from 'react';
import { Building2, MapPin, Users, Clock, Sparkles, ExternalLink } from 'lucide-react';
import {
  HAITI_DEPARTMENTS,
  CITIES_BY_DEPARTMENT,
  DepartmentCode,
} from '@/app/data/haitiLocations';
import { OpeningHourAutocomplete } from './OpeningHourAutocomplete';
import type { OpeningHour } from '@/types/branche';
import type { BranchFormData, ErrorMessages } from './validations';

// ============= TYPES =============

type FormMode = 'create' | 'edit' | 'activate';

interface BranchFormFieldsProps {
  formData: BranchFormData;
  /** Setter en Partial<> comme dans CompteFormFields — on update plusieurs champs d'un coup */
  setFormData: (updates: Partial<BranchFormData>) => void;
  errors: ErrorMessages<BranchFormData>;
  setErrors?: React.Dispatch<React.SetStateAction<ErrorMessages<BranchFormData>>>;
  mode?: FormMode;
  isSubmitting?: boolean;
  /** Liste des horaires (pour détecter is_default et afficher un badge) */
  openingHours?: OpeningHour[];
}

// ─── Section wrapper (style CAPOSA, copié du pattern compte) ───────────────
function Section({ number, icon: Icon, title, badge, children }: {
  number: number;
  icon: any;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="  flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-[#DDEAD5]/40 to-transparent">
        <div className="w-6 h-6 rounded-full bg-[#2E7D32] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{number}</span>
        </div>
        <Icon className="w-4 h-4 text-[#2E7D32]" />
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {badge}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

// ─── FieldLabel (style CAPOSA) ─────────────────────────────────────────────
function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ─── FieldError ────────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

// ============= COMPONENT =============

const BranchFormFields: React.FC<BranchFormFieldsProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  mode = 'create',
  isSubmitting = false,
  openingHours = [],
}) => {

  // Petit helper pour effacer une erreur quand l'utilisateur corrige le champ
  const clearError = (field: keyof BranchFormData) => {
    if (setErrors) setErrors(prev => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
  };

 
  // Villes disponibles selon le département
  const cities = formData.department_code
    ? CITIES_BY_DEPARTMENT[formData.department_code as DepartmentCode] ?? []
    : [];

  // L'horaire actuellement sélectionné
  const selectedHour = openingHours.find((h) => h.id === formData.opening_hour);
  const isUsingDefaultHour = Boolean((selectedHour as any)?.is_default);
  const hasNoHour = !formData.opening_hour;

  // Highlight visuel si on est en mode "activate" et qu'il manque l'horaire
  const highlightHourSection = mode === 'activate' && hasNoHour;

  // Handler générique pour les inputs (texte, email, tel, date, number)
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['number_of_tellers', 'number_of_clerks', 'number_of_credit_officers'];
    setFormData({
      [name]: numericFields.includes(name) ? Number(value) : value,
    } as Partial<BranchFormData>);
    clearError(name as keyof BranchFormData);
  };

  // Style commun pour les inputs (aligné avec CompteFormFields)
  const inputCls = (err?: string) =>
    [
      'w-full h-11 px-4 rounded-xl border-2 text-sm bg-white outline-none transition-colors',
      isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
      err
        ? 'border-red-400 ring-2 ring-red-200'
        : 'border-gray-200 hover:border-[#2E7D32]/40 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20',
    ].join(' ');

  return (
    <div className="space-y-4">

      {/* ── SECTION 1 : Identité ─────────────────────────────────────────── */}
      <Section number={1} icon={Building2} title="Identité de la branche">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <FieldLabel label="Nom de la branche" required />
            <input
              type="text"
              name="branch_name"
              value={formData.branch_name || ''}
              onChange={handleInput}
              disabled={isSubmitting}
              placeholder="Ex : Branche Pétionville"
              className={inputCls(errors.branch_name)}
            />
            <FieldError msg={errors.branch_name} />
          </div>

          <div>
            <FieldLabel label="Téléphone" required />
            <input
              type="tel"
              name="branch_phone_number"
              value={formData.branch_phone_number || ''}
              onChange={handleInput}
              disabled={isSubmitting}
              placeholder="+509 xxxx xxxx"
              className={inputCls(errors.branch_phone_number)}
            />
            <FieldError msg={errors.branch_phone_number} />
          </div>

          <div>
            <FieldLabel label="Email" required />
            <input
              type="email"
              name="branch_email"
              value={formData.branch_email || ''}
              onChange={handleInput}
              disabled={isSubmitting}
              placeholder="branche@caposa.ht"
              className={inputCls(errors.branch_email)}
            />
            <FieldError msg={errors.branch_email} />
          </div>

          <div className="md:col-span-2">
            <FieldLabel label="Adresse (numéro et rue)" required />
            <input
              type="text"
              name="branch_address"
              value={formData.branch_address || ''}
              onChange={handleInput}
              disabled={isSubmitting}
              placeholder="Ex : 13 Rue Capois"
              className={inputCls(errors.branch_address)}
            />
            <p className="text-xs text-gray-400 mt-1">
              La ville et le département sont sélectionnés ci-dessous.
            </p>
            <FieldError msg={errors.branch_address} />
          </div>

          <div className="md:col-span-2">
            <FieldLabel label="Date d'ouverture" required />
            <input
              type="date"
              name="opening_date"
              value={formData.opening_date || ''}
              onChange={handleInput}
              disabled={isSubmitting}
              className={inputCls(errors.opening_date)}
            />
            <FieldError msg={errors.opening_date} />
          </div>

        </div>
      </Section>

      {/* ── SECTION 2 : Localisation ─────────────────────────────────────── */}
      <Section number={2} icon={MapPin} title="Localisation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <FieldLabel label="Département" required />
            <select
              name="department_code"
              value={formData.department_code || ''}
              onChange={(e) => {
                // On reset la ville si on change de département (les villes changent)
                setFormData({
                  department_code: e.target.value as DepartmentCode,
                  city: '',
                });
                clearError('department_code');
              }}
              disabled={isSubmitting}
              className={inputCls(errors.department_code)}
            >
              <option value="">Sélectionnez un département</option>
              {HAITI_DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
            <FieldError msg={errors.department_code} />
          </div>

          <div>
            <FieldLabel label="Ville" required />
            <select
              name="city"
              value={formData.city || ''}
              onChange={handleInput}
              disabled={!formData.department_code || isSubmitting}
              className={inputCls(errors.city)}
            >
              <option value="">
                {formData.department_code
                  ? 'Sélectionnez une ville'
                  : "Choisissez d'abord un département"}
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <FieldError msg={errors.city} />
          </div>

        </div>
      </Section>


     {/* ── Section 4 : Horaire d'ouverture ── */}
      <div className=" rounded-2xl border border-gray-100  shadow-sm">
        <div className="flex items-center gap-2  h-12 px-5 bg-gradient-to-r from-[#DDEAD5]/40 to-transparent">
          <div className="w-6 h-6 rounded-full bg-[#2E7D32] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">4</span>
          </div>
          <Clock size={16} style={{ color: "#2E7D32" }} />
          <h2 className="text-lg font-semibold">Horaire d'ouverture</h2>
        </div>
        <div className='p-5'>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-semibold mb-0.5">Optionnel à la création</p>
            <p>
              Sélectionnez un horaire existant si disponible, ou laissez vide.
              Vous pourrez en assigner un depuis la page{" "}
              <span className="font-semibold">Horaires</span> après la création.
            </p>
          </div>
        </div>
        <OpeningHourAutocomplete
            selectedKey={formData.opening_hour || ''}
            onSelectionChange={(id: string) => {
              setFormData({ opening_hour: id || undefined });
              clearError('opening_hour');
            }}
            errorMessage={errors.opening_hour}
            isDisabled={isSubmitting}
          />
        </div>
        

        
      </div>

    </div>
  );
};

export default BranchFormFields;