'use client';
import { useState } from 'react';
import { Hash, MapPin, Banknote, Tag, ToggleLeft, ToggleRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

// ─── Helpers UI ───────────────────────────────────────────────────

const inputCls = (err?: string) =>
  `w-full h-11 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-all ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

function Field({
  label, hint, error, children,
}: {
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

// ─── Props ────────────────────────────────────────────────────────

interface Props {
  onSuccess?: (caisse: CaisseFormValues) => void;
  onCancel?:  () => void;
}

// ─── Composant ────────────────────────────────────────────────────

export default function EnregistrementCaisse({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<Partial<CaisseFormValues>>({
    devise:       'HTG',
    actif:        true,
    solde_initial: 0,
  });
  const [errors,  setErrors]  = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const set = (k: keyof CaisseFormValues, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = async () => {
    const result = validateForm(CaisseSchema, {
      ...form,
      solde_initial: Number(form.solde_initial ?? 0),
    });

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    setLoading(true);
    try {
      // TODO: remplacer par AxiosInstance.post('/caisses/', result.data)
      await new Promise(r => setTimeout(r, 800)); // simulation API
      setDone(true);
      onSuccess?.(result.data);
    } catch (err) {
      setErrors({ numero_caisse: 'Erreur lors de l\'enregistrement. Réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  // ── État succès ───────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">Caisse enregistrée</p>
          <p className="text-sm text-gray-500 mt-1">
            La caisse <span className="font-semibold text-[#2E7D32]">{form.numero_caisse}</span> est prête à être utilisée.
          </p>
        </div>
        <p className="text-xs text-gray-400 bg-[#DDEAD5]/40 px-4 py-2 rounded-xl">
          Vous pouvez maintenant ouvrir une session avec ce numéro de caisse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Alerte info */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <span>
          Une caisse doit être enregistrée avant de pouvoir ouvrir une session.
          Le numéro de caisse sera requis à chaque ouverture.
        </span>
      </div>

      {/* Grille formulaire */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Field label="Numéro de caisse *" hint="Format : C-01, C-02, C-100" error={errors.numero_caisse}>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={form.numero_caisse ?? ''}
              onChange={e => set('numero_caisse', e.target.value.toUpperCase())}
              placeholder="C-01"
              className={inputCls(errors.numero_caisse) + ' pl-8'}
            />
          </div>
        </Field>

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

        <Field label="Localisation *" hint="Bureau, étage, département" error={errors.localisation}>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={form.localisation ?? ''}
              onChange={e => set('localisation', e.target.value)}
              placeholder="Rez-de-chaussée — Accueil"
              className={inputCls(errors.localisation) + ' pl-8'}
            />
          </div>
        </Field>

        <Field label="Devise *" error={errors.devise}>
          <select
            value={form.devise ?? 'HTG'}
            onChange={e => set('devise', e.target.value)}
            className={inputCls(errors.devise)}
          >
            <option value="HTG">HTG — Gourde haïtienne</option>
            <option value="USD">USD — Dollar américain</option>
          </select>
        </Field>

        <Field
          label="Solde initial (HTG)"
          hint="Montant de départ — peut être 0"
          error={errors.solde_initial}
        >
          <div className="relative">
            <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="number"
              min={0}
              value={form.solde_initial ?? 0}
              onChange={e => set('solde_initial', parseFloat(e.target.value))}
              className={inputCls(errors.solde_initial) + ' pl-8'}
            />
          </div>
        </Field>

        <Field label="Statut" error={errors.actif}>
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

      {/* Actions */}
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60"
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