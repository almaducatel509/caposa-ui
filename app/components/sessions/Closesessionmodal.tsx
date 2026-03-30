'use client';
import { useState } from 'react';
import { LogOut, Wallet, TrendingUp, AlertTriangle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { CaisseSession } from '@/types/caisse';

function formatHTG(v: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'HTG', minimumFractionDigits: 2 }).format(v);
}

const cls = (err?: string) =>
  `w-full h-10 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors ${
    err ? 'border-red-400 ring-2 ring-red-100'
        : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

interface Props {
  session:   CaisseSession;
  onClose:   () => void;
  onConfirm: (montantFermeture: number) => Promise<void>;
}

export default function CloseSessionModal({ session, onClose, onConfirm }: Props) {
  const [montant, setMontant] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const ecart = montant ? parseFloat(montant) - session.montant_ouverture : null;

  const handleSubmit = async () => {
    const m = parseFloat(montant);
    if (isNaN(m) || m < 0) { setError('Montant invalide'); return; }
    setLoading(true);
    try { await onConfirm(m); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Récap */}
      <div className="p-4 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl space-y-2 text-sm">
        {[
          ['Caissier',            session.caissier_nom],
          ['Caisse',              session.numero_caisse],
          ['Ouverture',           session.ouverture_at],
          ['Montant d\'ouverture', formatHTG(session.montant_ouverture)],
          ['Superviseur',         session.superviseur],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Montant fermeture */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
          Montant de fermeture (HTG) *
        </p>
        <div className="relative">
          <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="number" min={0} value={montant}
            onChange={e => { setMontant(e.target.value); setError(''); }}
            placeholder="0" className={cls(error) + ' pl-8'} />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} />{error}
          </p>
        )}
      </div>

      {/* Écart temps réel */}
      {ecart !== null && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          ecart === 0 ? 'bg-[#DDEAD5] text-[#1B5E20]'
          : ecart > 0 ? 'bg-blue-50 text-[#355C7D]'
          :              'bg-red-50 text-red-700'
        }`}>
          {ecart === 0
            ? <><CheckCircle2 size={16} />Aucun écart — parfait !</>
            : ecart > 0
            ? <><TrendingUp size={16} />Excédent de {formatHTG(ecart)}</>
            : <><AlertTriangle size={16} />Déficit de {formatHTG(Math.abs(ecart))}</>
          }
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
          Annuler
        </button>
        <button onClick={handleSubmit} disabled={loading || !montant}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60">
          {loading ? <><Loader2 size={14} className="animate-spin" />Fermeture…</> : <><LogOut size={14} />Fermer la session</>}
        </button>
      </div>
    </div>
  );
}