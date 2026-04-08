'use client';

import React, { useRef, useEffect } from 'react';
import {
  ChevronDown, CheckCircle2, XCircle, X, Banknote,
  Lock, AlertTriangle, MinusCircle, UserPlus,
  MessageSquare, Mail, FileText, FileDown,
} from 'lucide-react';

export type LoanBulkAction =
  | 'approve' | 'reject' | 'cancel' | 'disburse' | 'close'
  | 'mark_late' | 'remove_late' | 'apply_penalties'
  | 'assign_agent' | 'send_sms' | 'send_email'
  | 'export_csv' | 'export_pdf';

interface LoanBulkActionDropdownProps {
  selectedCount: number;
  isOpen:        boolean;
  onToggle:      () => void;
  onAction:      (action: LoanBulkAction) => void;
}

const ACTIONS: {
  id:      LoanBulkAction;
  label:   string;
  icon:    React.ReactNode;
  danger?: boolean;
  section: 'decision' | 'suivi' | 'communication' | 'export';
}[] = [
  { id: 'approve',          label: 'Approuver',             icon: <CheckCircle2  className="w-3.5 h-3.5" />, section: 'decision'      },
  { id: 'reject',           label: 'Rejeter',               icon: <XCircle       className="w-3.5 h-3.5" />, section: 'decision', danger: true },
  { id: 'cancel',           label: 'Annuler',               icon: <X             className="w-3.5 h-3.5" />, section: 'decision', danger: true },
  { id: 'disburse',         label: 'Décaisser',             icon: <Banknote      className="w-3.5 h-3.5" />, section: 'decision'      },
  { id: 'close',            label: 'Clôturer (Remboursé)',  icon: <Lock          className="w-3.5 h-3.5" />, section: 'decision'      },
  { id: 'mark_late',        label: 'Marquer en retard',     icon: <AlertTriangle className="w-3.5 h-3.5" />, section: 'suivi', danger: true },
  { id: 'remove_late',      label: 'Retirer retard',        icon: <MinusCircle   className="w-3.5 h-3.5" />, section: 'suivi'         },
  { id: 'apply_penalties',  label: 'Appliquer pénalités',   icon: <AlertTriangle className="w-3.5 h-3.5" />, section: 'suivi', danger: true },
  { id: 'assign_agent',     label: 'Assigner à un agent',   icon: <UserPlus      className="w-3.5 h-3.5" />, section: 'communication' },
  { id: 'send_sms',         label: 'Envoyer SMS',           icon: <MessageSquare className="w-3.5 h-3.5" />, section: 'communication' },
  { id: 'send_email',       label: 'Envoyer Email',         icon: <Mail          className="w-3.5 h-3.5" />, section: 'communication' },
  { id: 'export_csv',       label: 'Exporter CSV',          icon: <FileText      className="w-3.5 h-3.5" />, section: 'export'        },
  { id: 'export_pdf',       label: 'Exporter PDF',          icon: <FileDown      className="w-3.5 h-3.5" />, section: 'export'        },
];

const SECTIONS: { id: 'decision' | 'suivi' | 'communication' | 'export'; label: string }[] = [
  { id: 'decision',      label: 'Décision'      },
  { id: 'suivi',         label: 'Suivi'         },
  { id: 'communication', label: 'Communication' },
  { id: 'export',        label: 'Export'        },
];

const LoanBulkActionDropdown: React.FC<LoanBulkActionDropdownProps> = ({
  selectedCount, isOpen, onToggle, onAction,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isOpen) onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl hover:shadow-md transition-all"
      >
        Actions groupées
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden py-1 max-h-[420px] overflow-y-auto">
          {SECTIONS.map((section, si) => {
            const items = ACTIONS.filter(a => a.section === section.id);
            return (
              <React.Fragment key={section.id}>
                {si > 0 && <div className="h-px bg-gray-100 my-1" />}
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {section.label}
                </p>
                {items.map(action => (
                  <button
                    key={action.id}
                    onClick={() => { onAction(action.id); onToggle(); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                      action.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-[#DDEAD5]/60'
                    }`}
                  >
                    <span className={action.danger ? 'text-red-400' : 'text-gray-400'}>
                      {action.icon}
                    </span>
                    {action.label}
                    {(action.id === 'export_csv' || action.id === 'export_pdf') && (
                      <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">
                        {selectedCount}
                      </span>
                    )}
                  </button>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LoanBulkActionDropdown;