'use client';
import { useState } from 'react';
import {
  LogIn, AlertCircle, Loader2, CheckCircle2,
  Eye, EyeOff, Banknote, User, Hash,
  Building2, Coins,
} from 'lucide-react';
import { OpenSessionPayload, CaisseDevise } from '@/types/caisse';
import { canOpenSessionNow } from '@/app/utils/sessionEligibility';
import { BranchData, Holiday, OpeningHour } from '../../branches/validations';

// ─── Props ───────────────────────────────────────────────────────
interface Props {
  onClose:           () => void;
  onConfirm:         (payload: OpenSessionPayload) => Promise<void>;
  branches:          BranchData[];
  openingHours:      OpeningHour[];
  holidays:          Holiday[];
  onRequireOverride: (reason: string, details: string) => void;
}

// ─── Field helper ─────────────────────────────────────────────────

function Field({ label, hint, error, children }: {
  label:    string;
  hint?:    string;
  error?:   string;
  children: React.ReactNode;
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

const inputCls = (err?: string) =>
  `w-full h-10 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

// ─── Composant ───────────────────────────────────────────────────

export default function OpenSessionModal({
  onClose,
  onConfirm,
  branches,
  openingHours,
  holidays,
  onRequireOverride,
}: Props) {
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
  const [done,    setDone]    = useState(false);

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  // ── Validation ────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.username.trim())
      e.username = "Le nom d'utilisateur est requis";

    if (!form.numero_caisse.trim())
      e.numero_caisse = 'Le numéro de caisse est requis';

    if (!form.branch.trim())
      e.branch = "L'agence est requise";

    if (!form.superviseur.trim())
      e.superviseur = 'Le superviseur est requis';

    if (!form.id_responsable_cash.trim())
      e.id_responsable_cash = "L'ID responsable cash est requis";

    const m = parseFloat(form.montant_ouverture);
    if (isNaN(m) || m <= 0)
      e.montant_ouverture = 'Montant invalide — doit être supérieur à 0';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Soumission ────────────────────────────────────────────────

  const handleSubmit = async () => {
    // Étape 1 : validation des champs
    if (!validate()) return;

    // Étape 2 : vérification de l'éligibilité de la branche
    const branch = branches.find(b => b.id === form.branch);
    if (!branch) {
      setErrors({ branch: "Branche introuvable" });
      return;
    }

    const branchHours    = openingHours.find(h => h.id === branch.opening_hour);
    const branchHolidays = holidays.filter(h => branch.holidays?.includes(h.id));

    if (!branchHours) {
      setErrors({ branch: "Horaires de la branche non configurés" });
      return;
    }

    const eligibility = canOpenSessionNow(
      branch,
      new Date(),
      branchHours,
      branchHolidays
    );

    // Cas 1 : Tout est bon → ouverture directe
    if (eligibility.eligible) {
      await doOpenSession();
      return;
    }

    // Cas 2 : Hors horaires ou jour férié → demande d'approbation directeur
    if (eligibility.requiresOverride) {
      onRequireOverride(eligibility.reason, eligibility.details ?? '');
      return;
    }

    // Cas 3 : Branche archivée ou non configurée → blocage total
    setErrors({
      branch: eligibility.details ?? "Impossible d'ouvrir une session dans cette branche",
    });
  };

  // ── Ouverture effective ───────────────────────────────────────

  const doOpenSession = async () => {
    setLoading(true);
    try {
      await onConfirm({
        username:            form.username.trim(),
        caissier_nom:        form.username.trim(),
        numero_caisse:       form.numero_caisse.trim(),
        branch:              form.branch.trim(),
        devise:              form.devise,
        superviseur:         form.superviseur.trim(),
        id_responsable_cash: form.id_responsable_cash.trim(),
        montant_ouverture:   parseFloat(form.montant_ouverture),
      });
      setDone(true);
    } catch {
      setErrors({ montant_ouverture: "Erreur lors de l'ouverture. Réessayez." });
    } finally {
      setLoading(false);
    }
  };

  // ── État succès ───────────────────────────────────────────────

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">Session ouverte</p>
          <p className="text-sm text-gray-500 mt-1">
            Caisse <span className="font-semibold text-[#2E7D32]">{form.numero_caisse}</span> — session démarrée avec succès.
          </p>
        </div>
      </div>
    );
  }

  // ── Formulaire ────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* Info */}
      <div className="flex items-start gap-3 px-4 py-3 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl text-sm text-[#1B5E20]">
        <LogIn size={15} className="shrink-0 mt-0.5" />
        <span>
          Renseignez les informations de la session. Le montant d'ouverture correspond au fond de caisse remis par le responsable cash.
        </span>
      </div>

      {/* Champs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Username caissier */}
        <Field label="Username caissier *" error={errors.username}
          hint="Identifiant unique du caissier">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              placeholder="jean.dupont"
              className={inputCls(errors.username) + ' pl-8'}
            />
          </div>
        </Field>

        {/* Numéro de caisse */}
        <Field label="Numéro de caisse *" error={errors.numero_caisse}>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={form.numero_caisse}
              onChange={e => set('numero_caisse', e.target.value)}
              placeholder="C-01"
              className={inputCls(errors.numero_caisse) + ' pl-8'}
            />
          </div>
        </Field>

        {/* Agence — <select> avec vraies branches */}
        <Field label="Agence *" error={errors.branch}>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={form.branch}
              onChange={e => set('branch', e.target.value)}
              className={inputCls(errors.branch) + ' pl-8 pr-4 appearance-none cursor-pointer'}
            >
              <option value="">-- Sélectionnez une agence --</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.branch_name} ({b.branch_code})
                </option>
              ))}
            </select>
          </div>
        </Field>

        {/* Devise */}
        <Field label="Devise *">
          <div className="flex gap-2">
            {(['HTG', 'USD'] as CaisseDevise[]).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => set('devise', d)}
                className={`flex-1 h-10 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  form.devise === d
                    ? 'border-[#2E7D32] bg-[#DDEAD5]/40 text-[#1B5E20]'
                    : 'border-gray-200 bg-[#F9F9F6] text-gray-500 hover:border-gray-300'
                }`}
              >
                <Coins size={13} />
                {d}
              </button>
            ))}
          </div>
        </Field>

        {/* Superviseur */}
        <Field label="Superviseur *" error={errors.superviseur}
          hint="Username du superviseur qui autorise">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={form.superviseur}
              onChange={e => set('superviseur', e.target.value)}
              placeholder="marie.joseph"
              className={inputCls(errors.superviseur) + ' pl-8'}
            />
          </div>
        </Field>

        {/* ID responsable cash */}
        <Field label="ID responsable cash *" error={errors.id_responsable_cash}
          hint="Username qui remet le fond de caisse">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPin ? 'text' : 'password'}
              value={form.id_responsable_cash}
              onChange={e => set('id_responsable_cash', e.target.value)}
              placeholder="paul.martin"
              className={inputCls(errors.id_responsable_cash) + ' pl-8 pr-9'}
            />
            <button
              type="button"
              onClick={() => setShowPin(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>

        {/* Montant d'ouverture — pleine largeur */}
        <div className="sm:col-span-2">
          <Field label="Montant d'ouverture *" error={errors.montant_ouverture}
            hint="Fond de caisse remis physiquement par le responsable cash">
            <div className="relative">
              <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="number"
                min={0}
                value={form.montant_ouverture}
                onChange={e => set('montant_ouverture', e.target.value)}
                placeholder="0.00"
                className={inputCls(errors.montant_ouverture) + ' pl-8'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                {form.devise}
              </span>
            </div>
          </Field>
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" />Ouverture…</>
            : <><LogIn size={14} />Démarrer la session</>
          }
        </button>
      </div>

    </div>
  );
}