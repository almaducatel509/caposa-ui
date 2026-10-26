'use client';

/**
 * LoanBulkActionDropdown.tsx — menu des actions groupées
 * ─────────────────────────────────────────────────────────────────
 * Actions alignées sur le contrat backend :
 * - disponibles : export, approve, reject, delete
 * - « Bientôt » (affichées mais désactivées) : disburse, mark_payment,
 *   send_reminder — en attente des endpoints backend.
 * - « archive » supprimée : un prêt `paid` ou `rejected` est déjà archivé
 *   par son statut, il n'existe pas d'action d'archivage.
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef } from 'react';
import {
  ChevronDown, Download, Bell, CheckCircle2, XCircle, Banknote, Wallet, Trash2,
} from 'lucide-react';
import type { LoanTab } from '../transactions/validation/loanSchema';

export type LoanBulkAction =
  | 'export'
  | 'approve'
  | 'reject'
  | 'disburse'
  | 'mark_payment'
  | 'send_reminder'
  | 'delete';

interface Props {
  selectedCount: number;
  isOpen:        boolean;
  onToggle:      () => void;
  onAction:      (a: LoanBulkAction) => void;
  /** Onglet courant : filtre les actions pertinentes. */
  context:       LoanTab;
  /** Actions masquées selon le rôle (ex. ['approve','reject','delete'] pour un caissier). */
  hidden?:       LoanBulkAction[];
}

const ALL_ACTIONS: {
  id: LoanBulkAction; label: string; icon: React.ElementType;
  color?: string; danger?: boolean; soon?: boolean;
}[] = [
  { id: 'export',        label: 'Exporter la sélection', icon: Download,     color: 'text-gray-600'   },
  { id: 'approve',       label: 'Approuver',             icon: CheckCircle2, color: 'text-[#2E7D32]'  },
  { id: 'reject',        label: 'Rejeter',               icon: XCircle,      color: 'text-red-600'    },
  { id: 'disburse',      label: 'Décaisser',             icon: Banknote,     soon: true               },
  { id: 'mark_payment',  label: 'Enregistrer un paiement', icon: Wallet,     soon: true               },
  { id: 'send_reminder', label: 'Envoyer un rappel',     icon: Bell,         soon: true               },
  { id: 'delete',        label: 'Supprimer',             icon: Trash2,       danger: true             },
];

const CONTEXT_MAP: Record<LoanTab, LoanBulkAction[]> = {
  demandes: ['export', 'approve', 'reject', 'disburse', 'delete'],
  a_jour:   ['export', 'mark_payment', 'send_reminder'],
  retard:   ['export', 'mark_payment', 'send_reminder'],
  archive:  ['export', 'delete'],
};

const LoanBulkActionDropdown: React.FC<Props> = ({
  selectedCount, isOpen, onToggle, onAction, context, hidden = [],
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Ferme au clic extérieur
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onToggle]);

  const visible = ALL_ACTIONS.filter(a => CONTEXT_MAP[context].includes(a.id) && !hidden.includes(a.id));

  return (
    <div ref={ref} className="relative">
      <button onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#2E7D32] text-white hover:bg-[#1B5E20] shadow-sm">
        Actions ({selectedCount})
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {visible.map(a => {
            const Icon = a.icon;
            return (
              <React.Fragment key={a.id}>
                {a.danger && <div className="border-t border-gray-100" />}
                <button
                  disabled={a.soon}
                  title={a.soon ? 'Disponible quand le backend sera prêt' : undefined}
                  onClick={() => { onAction(a.id); onToggle(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors ${
                    a.soon     ? 'text-gray-300 cursor-not-allowed'
                    : a.danger ? 'text-red-600 hover:bg-red-50'
                    :            `${a.color ?? 'text-gray-600'} hover:bg-[#F9F9F6]`
                  }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1">{a.label}</span>
                  {a.soon && <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">Bientôt</span>}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LoanBulkActionDropdown;