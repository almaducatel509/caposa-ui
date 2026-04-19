'use client';

import React, { useEffect, useRef } from 'react';
import {
  ChevronDown, Download, Bell, CheckCircle2, XCircle,
  Banknote, Archive, Trash2,
} from 'lucide-react';

export type LoanBulkAction =
  | 'export'
  | 'send_reminder'
  | 'approve'
  | 'reject'
  | 'disburse'
  | 'mark_payment'
  | 'archive'
  | 'delete';

interface Props {
  selectedCount: number;
  isOpen:        boolean;
  onToggle:      () => void;
  onAction:      (a: LoanBulkAction) => void;
  /** Contexte d'onglet pour filtrer les actions pertinentes */
  context?: 'pending' | 'approved' | 'active' | 'archive' | 'all';
}

const ALL_ACTIONS: { id: LoanBulkAction; label: string; icon: React.ElementType; danger?: boolean; color?: string }[] = [
  { id: 'export',        label: 'Exporter la sélection',     icon: Download,    color: 'text-gray-600' },
  { id: 'send_reminder', label: 'Envoyer un rappel',         icon: Bell,        color: 'text-[#355C7D]' },
  { id: 'approve',       label: 'Approuver',                 icon: CheckCircle2, color: 'text-[#2E7D32]' },
  { id: 'disburse',      label: 'Décaisser',                 icon: Banknote,     color: 'text-[#2E7D32]' },
  { id: 'mark_payment',  label: 'Marquer un paiement',       icon: CheckCircle2, color: 'text-[#2E7D32]' },
  { id: 'reject',        label: 'Rejeter',                   icon: XCircle,      color: 'text-red-600' },
  { id: 'archive',       label: 'Archiver',                  icon: Archive,      color: 'text-gray-500' },
  { id: 'delete',        label: 'Supprimer',                 icon: Trash2,       danger: true },
];

const CONTEXT_MAP: Record<NonNullable<Props['context']>, LoanBulkAction[]> = {
  pending:  ['export', 'approve', 'reject', 'delete'],
  approved: ['export', 'disburse', 'reject'],
  active:   ['export', 'send_reminder', 'mark_payment', 'archive'],
  archive:  ['export'],
  all:      ['export', 'send_reminder', 'approve', 'disburse', 'mark_payment', 'reject', 'archive', 'delete'],
};

const LoanBulkActionDropdown: React.FC<Props> = ({
  selectedCount, isOpen, onToggle, onAction, context = 'all',
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

  const visible = ALL_ACTIONS.filter(a => CONTEXT_MAP[context].includes(a.id));

  return (
    <div ref={ref} className="relative">
      <button onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#2E7D32] text-white hover:bg-[#1B5E20] transition-all shadow-sm">
        Actions ({selectedCount})
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {visible.map((a, i) => {
            const Icon = a.icon;
            const isLast = i === visible.length - 1;
            const showDivider = a.danger && !isLast ? false : a.danger;
            return (
              <React.Fragment key={a.id}>
                {showDivider && <div className="border-t border-gray-100" />}
                <button onClick={() => { onAction(a.id); onToggle(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors ${
                    a.danger ? 'text-red-600 hover:bg-red-50' : `${a.color ?? 'text-gray-600'} hover:bg-[#F9F9F6]`
                  }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {a.label}
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