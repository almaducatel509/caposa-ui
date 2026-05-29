'use client';
import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Ecart } from '@/types/reconciliation.types';

interface EcartModalProps {
  ecart: Ecart | null;
  onClose: () => void;
  onConfirm: (ecartId: string, note: string) => Promise<void>;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(Math.abs(n)) + ' HTG';

const EcartModal: React.FC<EcartModalProps> = ({ ecart, onClose, onConfirm }) => {
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  if (!ecart) return null;

  const isManque = ecart.ecart < 0;

  const handleClose = () => { setNote(''); setError(''); onClose(); };

  const handleConfirm = async () => {
    if (!note.trim()) return setError('La note est obligatoire.');
    setError('');
    setLoading(true);
    try {
      await onConfirm(ecart.id, note.trim());
      setNote('');
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isManque ? 'bg-red-50' : 'bg-green-50'
            }`}>
              {isManque
                ? <AlertTriangle className="w-5 h-5 text-red-500" />
                : <CheckCircle  className="w-5 h-5 text-green-600" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Expliquer l'écart</h2>
              <p className="text-xs text-gray-400 mt-0.5">{ecart.label}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chiffres */}
        <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
          {[
            { label: 'Attendu',  value: fmt(ecart.attendu), color: 'text-gray-700' },
            { label: 'Réel',     value: fmt(ecart.reel),    color: 'text-gray-700' },
            { label: 'Écart',    value: (isManque ? '−' : '+') + fmt(ecart.ecart),
              color: isManque ? 'text-red-600 font-bold' : 'text-green-600 font-bold' },
          ].map(c => (
            <div key={c.label} className="px-5 py-4 text-center border-r border-gray-100 last:border-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{c.label}</p>
              <p className={`text-sm ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
              Explication du trésorier *
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Ex : Frais bancaire de 20 HTG déduit automatiquement. Confirmé par relevé."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
            />
          </div>
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !note.trim()}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement…' : 'Confirmer l\'explication'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EcartModal;