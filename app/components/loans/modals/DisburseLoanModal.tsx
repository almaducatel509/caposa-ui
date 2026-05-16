'use client';

import React, { useState, useEffect } from 'react';
import { X, Banknote, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LoanForDisburse {
  id_loan:               string;
  member_name:     string;
  member_id:       string;
  amount:          number;
  loan_type:       string;
  duration_months: number;
  monthly_payment: number;
}

interface DisburseLoanModalProps {
  isOpen:    boolean;
  loan:      LoanForDisburse | null;
  onClose:   () => void;
  onConfirm: (loanId: string | number) => Promise<void>;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatHTG = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

// ─── Component ────────────────────────────────────────────────────────────────
const DisburseLoanModal: React.FC<DisburseLoanModalProps> = ({
  isOpen, loan, onClose, onConfirm,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, loan]);

  if (!isOpen || !loan) return null;

  const handleSubmit = async () => {
    if (!confirmed) {
      setError('Veuillez confirmer la remise de l\'argent.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(loan.id_loan);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors du décaissement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-[#DDEAD5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Décaisser le prêt #{loan.id_loan}</p>
              <p className="text-xs text-gray-600 mt-0.5">Remise des fonds au membre</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4">

          {/* Membre */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Bénéficiaire</p>
            <p className="text-sm font-bold text-gray-800">{loan.member_name}</p>
            <p className="text-xs text-gray-400 font-mono">{loan.member_id}</p>
          </div>

          {/* Montant à remettre — mis en avant */}
          <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] rounded-xl p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Montant à remettre</p>
            <p className="text-3xl font-bold text-white">{formatHTG(loan.amount)}</p>
          </div>

          {/* Détails */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Type</p>
              <p className="text-sm font-semibold text-gray-700">{loan.loan_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Durée</p>
              <p className="text-sm font-semibold text-gray-700">{loan.duration_months} mois</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">Mensualité estimée</p>
              <p className="text-sm font-semibold text-gray-700">~{formatHTG(Math.round(loan.monthly_payment))}/mois</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Le décaissement est <strong>définitif</strong>. Le calendrier de remboursement
              démarrera et une transaction sera enregistrée dans votre caisse.
            </p>
          </div>

          {/* Checkbox confirmation */}
          <label className="flex items-start gap-3 p-3 bg-[#F9F9F6] border border-gray-100 rounded-xl cursor-pointer hover:bg-[#DDEAD5]/20 transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => { setConfirmed(e.target.checked); setError(null); }}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30"
            />
            <span className="text-sm text-gray-700">
              Je confirme avoir remis <strong>{formatHTG(loan.amount)}</strong> à {loan.member_name}.
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {error}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !confirmed}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Décaissement…</>
              : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirmer le décaissement</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisburseLoanModal;