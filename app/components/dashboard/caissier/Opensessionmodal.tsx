'use client';
import { useState } from 'react';
import { LogIn, User, Hash, Shield, Banknote, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { OpenSessionPayload } from '@/types/caisse';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">{label}</p>
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
    err ? 'border-red-400 ring-2 ring-red-100'
        : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

interface Props {
  onClose:   () => void;
  onConfirm: (payload: OpenSessionPayload) => Promise<void>;
}

export default function OpenSessionModal({ onClose, onConfirm }: Props) {
  const [form, setForm] = useState<Record<string, string>>({
    caissier_nom: '', numero_caisse: '', superviseur: '',
    montant_ouverture: '', id_responsable_cash: '',
  });
  const [showId,  setShowId]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.caissier_nom.trim())        e.caissier_nom        = 'Requis';
    if (!form.numero_caisse.trim())       e.numero_caisse       = 'Requis';
    if (!form.superviseur.trim())         e.superviseur         = 'Requis';
    if (!form.id_responsable_cash.trim()) e.id_responsable_cash = 'Requis';
    const m = parseFloat(form.montant_ouverture);
    if (isNaN(m) || m <= 0)               e.montant_ouverture   = 'Montant invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onConfirm({
        caissier_nom:        form.caissier_nom,
        numero_caisse:       form.numero_caisse,
        superviseur:         form.superviseur,
        montant_ouverture:   parseFloat(form.montant_ouverture),
        id_responsable_cash: form.id_responsable_cash,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom du caissier *" error={errors.caissier_nom}>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={form.caissier_nom} onChange={e => set('caissier_nom', e.target.value)}
              placeholder="Jean Dupont" className={cls(errors.caissier_nom) + ' pl-8'} />
          </div>
        </Field>
        <Field label="Numéro de caisse *" error={errors.numero_caisse}>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={form.numero_caisse} onChange={e => set('numero_caisse', e.target.value)}
              placeholder="C-01" className={cls(errors.numero_caisse) + ' pl-8'} />
          </div>
        </Field>
      </div>

      <Field label="Superviseur *" error={errors.superviseur}>
        <div className="relative">
          <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={form.superviseur} onChange={e => set('superviseur', e.target.value)}
            placeholder="Nom du superviseur" className={cls(errors.superviseur) + ' pl-8'} />
        </div>
      </Field>

      <Field label="Montant d'ouverture (HTG) *" error={errors.montant_ouverture}>
        <div className="relative">
          <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="number" min={0} value={form.montant_ouverture}
            onChange={e => set('montant_ouverture', e.target.value)}
            placeholder="50 000" className={cls(errors.montant_ouverture) + ' pl-8'} />
        </div>
      </Field>

      <Field label="ID responsable cash *" error={errors.id_responsable_cash}>
        <p className="text-xs text-gray-400 mb-1.5">ID de la personne qui remet le cash</p>
        <div className="relative">
          <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type={showId ? 'text' : 'password'} value={form.id_responsable_cash}
            onChange={e => set('id_responsable_cash', e.target.value)}
            placeholder="EMP-008" className={cls(errors.id_responsable_cash) + ' pl-8 pr-10'} />
          <button type="button" onClick={() => setShowId(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showId ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </Field>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
          Annuler
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60">
          {loading ? <><Loader2 size={14} className="animate-spin" />Ouverture…</> : <><LogIn size={14} />Ouvrir la session</>}
        </button>
      </div>
    </div>
  );
}