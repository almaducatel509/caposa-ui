'use client';
import { useState } from 'react';
import {
  LogIn, Hash, Shield, Banknote,
  Eye, EyeOff, AlertCircle, Loader2,
  AtSign, Building2, Coins,
} from 'lucide-react';
import { CaisseDevise, OpenSessionPayload,  } from '@/types/caisse';

// ─── Helpers UI ───────────────────────────────────────────────────

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
        {label}
      </p>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

const cls = (err?: string) =>
  `w-full h-10 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

// ─── Props ────────────────────────────────────────────────────────

interface Branch {
  id:   string;  // UUID
  name: string;
}

interface Props {
  onClose:   () => void;
  onConfirm: (payload: OpenSessionPayload) => Promise<void>;
  branches?: Branch[];  // liste des agences disponibles
}

// ─── Composant ───────────────────────────────────────────────────

export default function OpenSessionModal({ onClose, onConfirm, branches = [] }: Props) {
  const [form, setForm] = useState({
    username:            '',
    numero_caisse:       '',
    branch:              '',
    devise:              'HTG' as CaisseDevise,
    superviseur:         '',
    id_responsable_cash: '',
    montant_ouverture:   '',
  });
  const [showPin, setShowPin] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.username.trim())
      e.username = "Le nom d'utilisateur est requis";
    if (!form.numero_caisse.trim())
      e.numero_caisse = 'Le numéro de caisse est requis';
    if (!form.branch)
      e.branch = 'Sélectionnez une agence';
    if (!form.superviseur.trim())
      e.superviseur = 'Le superviseur est requis';
    if (!form.id_responsable_cash.trim())
      e.id_responsable_cash = "L'ID responsable cash est requis";

    const m = parseFloat(form.montant_ouverture);
    if (isNaN(m) || m <= 0)
      e.montant_ouverture = 'Montant invalide';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onConfirm({
        username:            form.username,
        numero_caisse:       form.numero_caisse,
        branch:              form.branch,
        devise:              form.devise,
        superviseur:         form.superviseur,
        id_responsable_cash: form.id_responsable_cash,
        montant_ouverture:   parseFloat(form.montant_ouverture),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Ligne 1 : Username + Numéro caisse ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Nom d'utilisateur *"
          hint="Votre username de connexion"
          error={errors.username}
        >
          <div className="relative">
            <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={form.username}
              onChange={e => set('username', e.target.value)}
              placeholder="jean.dupont"
              autoComplete="username"
              className={cls(errors.username) + ' pl-8'}
            />
          </div>
        </Field>

        <Field label="Numéro de caisse *" error={errors.numero_caisse}>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={form.numero_caisse}
              onChange={e => set('numero_caisse', e.target.value.toUpperCase())}
              placeholder="C-01"
              className={cls(errors.numero_caisse) + ' pl-8'}
            />
          </div>
        </Field>
      </div>

      {/* ── Ligne 2 : Agence + Devise ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Agence *" error={errors.branch}>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {branches.length > 0 ? (
              <select
                value={form.branch}
                onChange={e => set('branch', e.target.value)}
                className={cls(errors.branch) + ' pl-8'}
              >
                <option value="">Sélectionner une agence</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            ) : (
              <input
                value={form.branch}
                onChange={e => set('branch', e.target.value)}
                placeholder="UUID de l'agence"
                className={cls(errors.branch) + ' pl-8'}
              />
            )}
          </div>
        </Field>

        <Field label="Devise *" error={errors.devise}>
          <div className="relative">
            <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={form.devise}
              onChange={e => set('devise', e.target.value as CaisseDevise)}
              className={cls(errors.devise) + ' pl-8'}
            >
              <option value="HTG">HTG — Gourde haïtienne</option>
              <option value="USD">USD — Dollar américain</option>
            </select>
          </div>
        </Field>
      </div>

      {/* ── Superviseur ── */}
      <Field label="Superviseur *" hint="Username du superviseur" error={errors.superviseur}>
        <div className="relative">
          <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={form.superviseur}
            onChange={e => set('superviseur', e.target.value)}
            placeholder="superviseur.dupont"
            className={cls(errors.superviseur) + ' pl-8'}
          />
        </div>
      </Field>

      {/* ── Montant d'ouverture ── */}
      <Field label="Montant d'ouverture *" error={errors.montant_ouverture}>
        <div className="relative">
          <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="number"
            min={0}
            value={form.montant_ouverture}
            onChange={e => set('montant_ouverture', e.target.value)}
            placeholder="50 000"
            className={cls(errors.montant_ouverture) + ' pl-8'}
          />
        </div>
      </Field>

      {/* ── ID responsable cash ── */}
      <Field
        label="ID responsable cash *"
        hint="Username de la personne qui remet le cash"
        error={errors.id_responsable_cash}
      >
        <div className="relative">
          <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type={showPin ? 'text' : 'password'}
            value={form.id_responsable_cash}
            onChange={e => set('id_responsable_cash', e.target.value)}
            placeholder="username.responsable"
            className={cls(errors.id_responsable_cash) + ' pl-8 pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPin(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </Field>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" />Ouverture…</>
            : <><LogIn size={14} />Ouvrir la session</>
          }
        </button>
      </div>
    </div>
  );
}