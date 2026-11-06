'use client';

import React, { useRef, useEffect } from 'react';
import {
  ChevronDown,
  CheckCircle2,
  BadgeCheck,
  ShieldOff,
  XCircle,
  Download,
} from 'lucide-react';
import type { AccountData } from './validationsaccount';
import { AccountBulkAction, countEligible } from '@/app/lib/api/accountRules';

// Ré-export pour ne pas casser les imports existants (`from './AccountBulkActionDropdown'`)

interface AccountBulkActionDropdownProps {
  /** Comptes actuellement sélectionnés (sert aux compteurs par action). */
  selectedAccounts: AccountData[];
  /** L'utilisateur peut-il approuver ? (superviseur / direction / admin) */
  canApprove?:      boolean;
  isOpen:           boolean;
  onToggle:         () => void;
  onAction:         (action: AccountBulkAction) => void;
}

const ACTIONS: {
  id:      AccountBulkAction;
  label:   string;
  icon:    React.ReactNode;
  danger?: boolean;
  section: 'statut' | 'autre';
}[] = [
  { id: 'approve',  label: 'Approuver',             icon: <BadgeCheck   className="w-3.5 h-3.5" />, section: 'statut' },
  { id: 'activate', label: 'Débloquer / Réouvrir',  icon: <CheckCircle2 className="w-3.5 h-3.5" />, section: 'statut' },
  { id: 'suspend',  label: 'Geler',                 icon: <ShieldOff    className="w-3.5 h-3.5" />, section: 'statut' },
  { id: 'export',   label: 'Exporter la sélection', icon: <Download     className="w-3.5 h-3.5" />, section: 'autre'  },
  { id: 'close',    label: 'Fermer les comptes',    icon: <XCircle      className="w-3.5 h-3.5" />, danger: true, section: 'autre' },
];

const SECTIONS: { id: 'statut' | 'autre'; label: string }[] = [
  { id: 'statut', label: 'Statut' },
  { id: 'autre',  label: 'Autre'  },
];

const AccountBulkActionDropdown: React.FC<AccountBulkActionDropdownProps> = ({
  selectedAccounts, canApprove = false, isOpen, onToggle, onAction,
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

  const visibleActions = ACTIONS.filter(a => a.id !== 'approve' || canApprove);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl hover:shadow-md transition-all"
      >
        Actions groupées
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden py-1">
          {SECTIONS.map((section, si) => {
            const items = visibleActions.filter(a => a.section === section.id);
            if (items.length === 0) return null;
            return (
              <React.Fragment key={section.id}>
                {si > 0 && <div className="h-px bg-gray-100 my-1" />}
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {section.label}
                </p>
                {items.map(action => {
                  const count    = countEligible(action.id, selectedAccounts);
                  const disabled = count === 0;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      disabled={disabled}
                      title={disabled ? 'Aucun compte sélectionné ne permet cette action' : undefined}
                      onClick={() => { onAction(action.id); onToggle(); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                        action.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-[#DDEAD5]/60'
                      }`}
                    >
                      <span className={action.danger ? 'text-red-400' : action.id === 'approve' ? 'text-[#2E7D32]' : 'text-gray-400'}>
                        {action.icon}
                      </span>
                      {action.label}
                      <span
                        className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                          disabled ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountBulkActionDropdown;