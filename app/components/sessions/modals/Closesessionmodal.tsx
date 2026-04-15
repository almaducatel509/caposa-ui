'use client';
import { useState } from 'react';
import {
  LogOut, Wallet, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Loader2,
  AlertCircle, Package, Calculator, FileText,
} from 'lucide-react';
import { CaisseSession } from '@/types/caisse';

// ─── Helpers ─────────────────────────────────────────────────────

function formatHTG(v: number, devise = 'HTG') {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: devise,
    minimumFractionDigits: 2,
  }).format(v);
}

const cls = (err?: string) =>
  `w-full h-10 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

// ─── Checkbox ────────────────────────────────────────────────────

function CheckItem({
  label, description, checked, onChange, error,
}: {
  label: string; description: string;
  checked: boolean; onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
        checked
          ? 'border-[#2E7D32] bg-[#DDEAD5]/40'
          : error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 bg-[#F9F9F6] hover:border-gray-300'
      }`}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
        checked ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-gray-300'
      }`}>
        {checked && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <div>
        <p className={`text-sm font-semibold ${checked ? 'text-[#1B5E20]' : 'text-gray-700'}`}>
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        {error && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={10} />{error}
          </p>
        )}
      </div>
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────

interface Props {
  session:   CaisseSession;
  onClose:   () => void;
  onConfirm: (payload: {
    montant_fermeture:        number;
    note_fermeture?:          string;
    remise_effectuee:         boolean;
    reconciliation_effectuee: boolean;
  }) => Promise<void>;
}

// ─── Composant ───────────────────────────────────────────────────

export default function CloseSessionModal({ session, onClose, onConfirm }: Props) {
  const [montant,           setMontant]          = useState('');
  const [note,              setNote]             = useState('');
  const [remise,            setRemise]           = useState(false);
  const [reconciliation,    setReconciliation]   = useState(false);
  const [errors,            setErrors]           = useState<Record<string, string>>({});
  const [loading,           setLoading]          = useState(false);

  const devise = session.devise ?? 'HTG';

  // Écart en temps réel : montant saisi - montant théorique (ou ouverture si pas de théorique)
  const reference   = session.montant_theorique ?? session.montant_ouverture;
  const ecart       = montant ? parseFloat(montant) - reference : null;
  const ecartAbsolu = ecart != null ? Math.abs(ecart) : null;
  const hasEcart    = ecart != null && ecart !== 0;

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    const m = parseFloat(montant);
    if (isNaN(m) || m < 0)
      e.montant = 'Montant invalide';

    // Note obligatoire si écart détecté
    if (hasEcart && !note.trim())
      e.note = 'Une note est requise en cas d\'écart';

    if (!remise)
      e.remise = 'Confirmez que la remise a été effectuée';

    if (!reconciliation)
      e.reconciliation = 'Confirmez que la réconciliation a été effectuée';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onConfirm({
        montant_fermeture:        parseFloat(montant),
        note_fermeture:           note.trim() || undefined,
        remise_effectuee:         remise,
        reconciliation_effectuee: reconciliation,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Récap session ── */}
      <div className="p-4 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl space-y-2 text-sm">
        {[
          ['Caissier',             session.username],
          ['Caisse',               session.numero_caisse],
          ['Devise',               session.devise],
          ['Ouverture',            session.ouverture_at],
          ['Montant d\'ouverture', formatHTG(session.montant_ouverture, devise)],
          ['Montant théorique',    session.montant_theorique != null
            ? formatHTG(session.montant_theorique, devise)
            : '— (calcul en cours)'],
          ['Superviseur',          session.superviseur],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Montant de fermeture ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
          Montant compté ({devise}) *
        </p>
        <div className="relative">
          <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="number"
            min={0}
            value={montant}
            onChange={e => { setMontant(e.target.value); setErrors(er => ({ ...er, montant: '' })); }}
            placeholder="0"
            className={cls(errors.montant) + ' pl-8'}
          />
        </div>
        {errors.montant && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} />{errors.montant}
          </p>
        )}
      </div>

      {/* ── Écart en temps réel ── */}
      {ecart !== null && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          ecart === 0  ? 'bg-[#DDEAD5] text-[#1B5E20]'
          : ecart > 0  ? 'bg-blue-50 text-blue-700'
          :               'bg-red-50 text-red-700'
        }`}>
          {ecart === 0
            ? <><CheckCircle2 size={16} />Aucun écart — parfait !</>
            : ecart > 0
            ? <><TrendingUp size={16} />Excédent de {formatHTG(ecartAbsolu!, devise)}</>
            : <><TrendingDown size={16} />Déficit de {formatHTG(ecartAbsolu!, devise)}</>
          }
        </div>
      )}

      {/* ── Note — obligatoire si écart ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
          Note de fermeture {hasEcart ? '*' : '(optionnel)'}
        </p>
        {hasEcart && (
          <p className="text-xs text-orange-600 mb-1.5 flex items-center gap-1">
            <AlertTriangle size={11} />
            Un écart a été détecté — une explication est requise.
          </p>
        )}
        <div className="relative">
          <FileText size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setErrors(er => ({ ...er, note: '' })); }}
            placeholder="Ex : Billet abîmé de 250 HTG, client a payé en monnaie…"
            rows={3}
            className={`w-full px-4 py-2.5 pl-8 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none resize-none transition-colors ${
              errors.note
                ? 'border-red-400 ring-2 ring-red-100'
                : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
            }`}
          />
        </div>
        {errors.note && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} />{errors.note}
          </p>
        )}
      </div>

      {/* ── Checklist fin de journée ── */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Checklist de clôture *
        </p>
        <CheckItem
          label="Remise effectuée"
          description="Le cash a été remis au responsable trésorerie"
          checked={remise}
          onChange={v => { setRemise(v); setErrors(e => ({ ...e, remise: '' })); }}
          error={errors.remise}
        />
        <CheckItem
          label="Réconciliation effectuée"
          description="Les transactions ont été vérifiées et balancées"
          checked={reconciliation}
          onChange={v => { setReconciliation(v); setErrors(e => ({ ...e, reconciliation: '' })); }}
          error={errors.reconciliation}
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2 bg-white">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !montant}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" />Fermeture…</>
            : <><LogOut size={14} />Fermer la session</>
          }
        </button>
      </div>
    </div>
  );
}