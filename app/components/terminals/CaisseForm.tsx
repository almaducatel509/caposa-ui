'use client';
import { useState, useEffect } from 'react';
import {
  Tag, ToggleLeft, ToggleRight,
  AlertCircle, Loader2, CheckCircle2, Building2,
} from 'lucide-react';

import { fetchBranches } from '@/app/lib/api/branche';
import { createCaisse } from '@/app/lib/api/caisse';
import { Branch } from '@/types/branche';
import { CaisseCreateValues, validateCaisseForm } from './validation';

// ─── Helpers UI ──────────────────────────────────────────────────
const inputCls = (err?: string) =>
  `w-full h-11 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-all ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────
interface Props {
  onSuccess?: (numero_caisse: string) => void;
  onCancel?:  () => void;
}

// ─── Composant ──────────────────────────────────────────────────
export default function CaisseForm({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<Partial<CaisseCreateValues>>({ actif: true });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [errors,   setErrors]   = useState<Partial<Record<keyof CaisseCreateValues, string>>>({});
  const [loading,  setLoading]  = useState(false);
  const [createdNumero, setCreatedNumero] = useState<string | null>(null);

  useEffect(() => { fetchBranches().then(setBranches); }, []);

  const set = <K extends keyof CaisseCreateValues>(k: K, v: CaisseCreateValues[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = async () => {
  const result = validateCaisseForm(form);
  if (!result.success) { setErrors(result.errors); return; }

  setLoading(true);
  try {
    const created = await createCaisse(result.data);
    setCreatedNumero(created.numero_caisse);
    onSuccess?.(created.numero_caisse);
  } catch {
    setErrors({ nom_caisse: "Erreur lors de l'enregistrement. Réessayez." });
  } finally {
    setLoading(false);
  }
};

  // ── État succès ──────────────────────────────────────────────────
  if (createdNumero) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">Caisse enregistrée</p>
          <p className="text-sm text-gray-500 mt-1">
            Numéro attribué :{' '}
            <span className="font-semibold text-[#2E7D32]">{createdNumero}</span>
          </p>
        </div>
        <p className="text-xs text-gray-400 bg-[#DDEAD5]/40 px-4 py-2 rounded-xl text-center">
          Vous pouvez maintenant ouvrir une session avec ce numéro de caisse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <span>
          Une caisse doit être enregistrée avant de pouvoir ouvrir une session.
          Le numéro sera attribué automatiquement à l'enregistrement.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Nom */}
        <Field label="Nom de la caisse *" error={errors.nom_caisse}>
          <div className="relative">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={form.nom_caisse ?? ''}
              onChange={e => set('nom_caisse', e.target.value)}
              placeholder="Caisse principale"
              className={inputCls(errors.nom_caisse) + ' pl-8'}
            />
          </div>
        </Field>

        {/* Agence */}
        <Field label="Agence *" error={errors.branch}>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={form.branch ?? ''}
              onChange={e => set('branch', e.target.value)}
              className={inputCls(errors.branch) + ' pl-8'}
            >
              <option value="">Sélectionner une agence</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.branch_name}</option>
              ))}
            </select>
          </div>
        </Field>

        {/* Poste (optionnel) */}
        <Field
          label="Poste / guichet"
          hint="Optionnel — ex : G-01, Guichet nord"
          error={errors.poste}
        >
          <input
            value={form.poste ?? ''}
            onChange={e => set('poste', e.target.value)}
            placeholder="G-01"
            className={inputCls(errors.poste)}
          />
        </Field>

        {/* Statut */}
        <Field label="Statut" error={undefined}>
          <button
            type="button"
            onClick={() => set('actif', !form.actif)}
            className={`h-11 px-4 rounded-xl border-2 flex items-center gap-3 text-sm font-medium transition-all ${
              form.actif
                ? 'border-[#2E7D32] bg-[#DDEAD5]/40 text-[#1B5E20]'
                : 'border-gray-200 bg-[#F9F9F6] text-gray-500'
            }`}
          >
            {form.actif
              ? <ToggleRight size={20} className="text-[#2E7D32]" />
              : <ToggleLeft  size={20} className="text-gray-400"  />}
            {form.actif ? 'Caisse active' : 'Caisse inactive'}
          </button>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" />Enregistrement…</>
            : <>Enregistrer la caisse</>
          }
        </button>
      </div>
    </div>
  );
}