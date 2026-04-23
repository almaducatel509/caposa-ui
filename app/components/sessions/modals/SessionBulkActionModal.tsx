'use client';

import React, { useState } from 'react';
import {
  X, Download, Printer, Loader2, CheckCheck,
} from 'lucide-react';
import { CaisseSession } from '@/types/caisse';
import { SessionBulkAction } from '../SessionBulkActionDropdown';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SessionBulkActionModalProps {
  action:    SessionBulkAction | null;
  sessions:  CaisseSession[];
  onClose:   () => void;
  onConfirm: (action: SessionBulkAction, ids: string[]) => Promise<void>;
}

// ─── Config par action ─────────────────────────────────────────────────────────

type ActionConfig = {
  title:        (n: number) => string;
  description:  (n: number) => string;
  icon:         React.ReactNode;
  confirmLabel: (n: number) => string;
  color:        string;
};

const ACTION_CONFIG: Record<SessionBulkAction, ActionConfig> = {
  export: {
    title:        (n) => `Exporter ${n} session${n > 1 ? 's' : ''}`,
    description:  (n) => `Les données de ${n} session${n > 1 ? 's' : ''} seront exportées en fichier CSV (compatible Excel).`,
    icon:         <Download className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Exporter ${n} session${n > 1 ? 's' : ''} en CSV`,
    color:        'bg-[#DDEAD5]',
  },
  print: {
    title:        (n) => `Imprimer ${n} fiche${n > 1 ? 's' : ''} de session`,
    description:  (n) => `Les fiches détaillées des ${n} session${n > 1 ? 's' : ''} seront préparées pour impression (une fiche par page).`,
    icon:         <Printer className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Imprimer ${n} fiche${n > 1 ? 's' : ''}`,
    color:        'bg-[#DDEAD5]',
  },
};

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// ─── Component ─────────────────────────────────────────────────────────────────

const SessionBulkActionModal: React.FC<SessionBulkActionModalProps> = ({
  action, sessions, onClose, onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const cfg = action ? ACTION_CONFIG[action] : null;
  if (!action || !cfg) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(action, sessions.map(s => s.id));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className={`flex items-start justify-between p-5 border-b border-gray-100 ${cfg.color}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/60">
              {cfg.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title(sessions.length)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {sessions.length} session{sessions.length > 1 ? 's' : ''} sélectionnée{sessions.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          <p className="text-sm text-gray-600">{cfg.description(sessions.length)}</p>

          {/* ── Liste des sessions ── */}
          <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DDEAD5]/60">
              <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
              <span className="text-xs font-semibold text-[#1B5E20]">
                {sessions.length} session{sessions.length > 1 ? 's' : ''} concernée{sessions.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {sessions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {s.caissier_nom ?? s.username}
                      <span className="text-gray-400 font-normal"> · {s.numero_caisse}</span>
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {s.branch_name ?? s.branch} · {formatDate(s.ouverture_at)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    s.statut === 'ouverte'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.statut === 'ouverte' ? 'Ouverte' : 'Fermée'}
                  </span>
                </div>
              ))}
              {sessions.length > 5 && (
                <div className="px-4 py-2 text-xs text-gray-400 italic">
                  + {sessions.length - 5} autres sessions…
                </div>
              )}
            </div>
          </div>

          {/* ── Info format ── */}
          {action === 'export' && (
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <Download className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-semibold mb-0.5">Contenu du fichier CSV</p>
                <p>Caissier, superviseur, agence, caisse, devise, dates, montants, écart, statut</p>
              </div>
            </div>
          )}

          {action === 'print' && (
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <Printer className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-semibold mb-0.5">Format d&apos;impression</p>
                <p>Une fiche par page — prête pour archivage BRH</p>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {cfg.confirmLabel(sessions.length)}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SessionBulkActionModal;