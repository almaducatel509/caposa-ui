'use client';

import React, { useState } from 'react';
import {
  X, Download, Loader2, CheckCheck,
} from 'lucide-react';
import { DepositData } from '@/app/components/transactions/deposits/DepositTable';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DepositExportModalProps {
  open:      boolean;
  deposits:  DepositData[];
  onClose:   () => void;
  onConfirm: (ids: number[]) => Promise<void>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── Component ─────────────────────────────────────────────────────────────────

const DepositExportModal: React.FC<DepositExportModalProps> = ({
  open, deposits, onClose, onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(deposits.map(d => d.id));
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center">
              <Download className="w-5 h-5 text-[#355C7D]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Exporter {deposits.length} dépôt{deposits.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {deposits.length} dépôt{deposits.length > 1 ? 's' : ''} sélectionné{deposits.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          <p className="text-sm text-gray-600">
            Les données de ces dépôts seront exportées en CSV pour audit ou rapprochement.
          </p>

          {/* ── Aperçu ── */}
          <div className="rounded-xl border border-[#355C7D]/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50">
              <CheckCheck className="w-4 h-4 text-[#355C7D]" />
              <span className="text-xs font-semibold text-[#355C7D]">
                {deposits.length} dépôt{deposits.length > 1 ? 's' : ''} à exporter
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {deposits.slice(0, 5).map(dep => (
                <div key={dep.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{dep.member_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{dep.idCompte}</p>
                  </div>
                  <p className="text-xs font-bold text-[#2E7D32]">
                    +{formatHTG(dep.montantTransaction)}
                  </p>
                </div>
              ))}
              {deposits.length > 5 && (
                <div className="px-4 py-2 text-xs text-gray-400">
                  +{deposits.length - 5} autres dépôts inclus
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-[#355C7D] hover:bg-[#2a4a65] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <Download className="w-3.5 h-3.5" />
            Exporter en CSV
          </button>
        </div>

      </div>
    </div>
  );
};

export default DepositExportModal;