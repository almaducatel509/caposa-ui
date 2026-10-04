'use client';

import React, { useRef, useEffect } from 'react';
import {
  ChevronDown, CheckCircle2,
  MapPin, Briefcase, Archive, Download,
} from 'lucide-react';

export type EmployeeBulkAction =
  | 'activate'
  | 'change_branch'
  | 'change_post'
  | 'archive'
  | 'export';

type DropdownContext = 'actif' | 'archive';

interface BulkActionDropdownProps {
  selectedCount: number;
  isOpen:        boolean;
  onToggle:      () => void;
  onAction:      (action: EmployeeBulkAction) => void;
  context:       DropdownContext;
}

const ACTIONS: {
  id:      EmployeeBulkAction;
  label:   string;
  icon:    React.ReactNode;
  danger?: boolean;
  section: 'statut' | 'organisation' | 'autre';
  contexts: DropdownContext[];   // ← sur quel(s) onglet(s) cette action a du sens
}[] = [
  { id: 'activate',      label: 'Reactiver',             icon: <CheckCircle2 className="w-3.5 h-3.5" />, section: 'statut',       contexts: ['archive'] },
  { id: 'change_branch', label: 'Changer la succursale', icon: <MapPin       className="w-3.5 h-3.5" />, section: 'organisation', contexts: ['actif']   },
  { id: 'change_post',   label: 'Assigner un poste',     icon: <Briefcase    className="w-3.5 h-3.5" />, section: 'organisation', contexts: ['actif']   },
  { id: 'export',        label: 'Exporter la selection', icon: <Download     className="w-3.5 h-3.5" />, section: 'autre',        contexts: ['actif', 'archive'] },
  { id: 'archive',       label: 'Archiver',              icon: <Archive      className="w-3.5 h-3.5" />, danger: true, section: 'autre', contexts: ['actif'] },
];

const SECTIONS: { id: 'statut' | 'organisation' | 'autre'; label: string }[] = [
  { id: 'statut',       label: 'Statut'       },
  { id: 'organisation', label: 'Organisation' },
  { id: 'autre',        label: 'Autre'        },
];

const BulkActionDropdown: React.FC<BulkActionDropdownProps> = ({
  selectedCount, isOpen, onToggle, onAction, context,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && isOpen) onToggle();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onToggle]);

  const visibleActions = ACTIONS.filter(a => a.contexts.includes(context));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl hover:shadow-md transition-all"
      >
        Actions groupees
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden py-1">
          {SECTIONS.map((section, si) => {
            const items = visibleActions.filter(a => a.section === section.id);
            if (items.length === 0) return null;
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
                      action.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-[#DDEAD5]/60'
                    }`}
                  >
                    <span className={action.danger ? 'text-red-400' : 'text-gray-400'}>
                      {action.icon}
                    </span>
                    {action.label}
                    {action.id === 'export' && (
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

export default BulkActionDropdown;