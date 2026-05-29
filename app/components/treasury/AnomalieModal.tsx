'use client';
import React, { useState } from 'react';
import { X, AlertTriangle, FileText, UserX } from 'lucide-react';
import { Remise, Decision, AnomalieDecision, AnomalieResolution } from '@/types/remise';

// ─── Props ────────────────────────────────────────────────────────────────────
interface AnomalieModalProps {
  remise: Remise | null;
  onClose: () => void;
  onConfirm: (
    id: string,
    decision: Decision,
    anomalie: AnomalieDecision,
  ) => Promise<void>;
}

// ─── Composant ───────────────────────────────────────────────────────────────
const AnomalieModal: React.FC<AnomalieModalProps> = ({ remise, onClose, onConfirm }) => {
  const [resolution, setResolution] = useState<AnomalieResolution | null>(null);
  const [note,       setNote]       = useState('');
  const [amount,     setAmount]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  if (!remise) return null;

  const reset = () => {
    setResolution(null);
    setNote('');
    setAmount('');
    setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleConfirm = async () => {
    if (!resolution)    return setError('Choisissez une résolution.');
    if (!note.trim())   return setError('La note est obligatoire.');
    if (resolution === 'justified' && (!amount || isNaN(Number(amount)))) {
      return setError('Saisissez le montant justifié.');
    }

    setError('');
    setLoading(true);
    try {
      await onConfirm(
        remise.id,
        'approved',                       // anomalie justifiée → remise approuvée
        {
          resolution,
          note: note.trim(),
          amount: resolution === 'justified' ? Number(amount) : undefined,
        },
      );
      reset();
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' G';

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Traitement de l'anomalie</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {remise.id} · {remise.cashier.name} · {fmt(remise.amount)}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5">

          {/* Choix résolution */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Décision du trésorier
            </p>
            <div className="grid grid-cols-2 gap-3">

              <ResolutionCard
                active={resolution === 'justified'}
                icon={<FileText className="w-5 h-5" />}
                title="Justifier l'écart"
                desc="L'écart est expliqué et accepté (erreur documentée, frais bancaire, etc.)"
                color="blue"
                onClick={() => setResolution('justified')}
              />

              <ResolutionCard
                active={resolution === 'imputed'}
                icon={<UserX className="w-5 h-5" />}
                title="Imputer à la caissière"
                desc="L'écart est à la charge de la caissière et sera enregistré dans son dossier."
                color="red"
                onClick={() => setResolution('imputed')}
              />

            </div>
          </div>

          {/* Montant justifié (seulement si 'justified') */}
          {resolution === 'justified' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                Montant justifié (G)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="ex : 500"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
              />
            </div>
          )}

          {/* Note obligatoire */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
              Note {resolution === 'imputed' ? "d'imputation" : 'de justification'} *
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder={
                resolution === 'imputed'
                  ? 'Ex : Écart de 500 HTG imputé à la caissière — billet déchiré non signalé.'
                  : 'Ex : Frais bancaire de 20 HTG confirmé par relevé du 29/05.'
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
            />
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !resolution}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement…' : 'Confirmer la décision'}
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Carte choix résolution ───────────────────────────────────────────────────
const ResolutionCard: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'blue' | 'red';
  onClick: () => void;
}> = ({ active, icon, title, desc, color, onClick }) => {
  const styles = {
    blue: {
      ring:    active ? 'border-blue-400 bg-blue-50'  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40',
      icon:    'bg-blue-100 text-blue-700',
      title:   'text-blue-900',
    },
    red: {
      ring:    active ? 'border-red-400 bg-red-50'    : 'border-gray-200 hover:border-red-200 hover:bg-red-50/40',
      icon:    'bg-red-100 text-red-700',
      title:   'text-red-900',
    },
  };
  const s = styles[color];

  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all ${s.ring}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${s.icon}`}>
        {icon}
      </div>
      <p className={`text-sm font-semibold mb-1 ${s.title}`}>{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </button>
  );
};

export default AnomalieModal;