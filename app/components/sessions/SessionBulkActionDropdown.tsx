'use client';

import React, { useRef, useEffect } from 'react';
import {
  ChevronDown,
  Download,
  Printer,
} from 'lucide-react';

export type SessionBulkAction =
  | 'export'
  | 'print';

interface SessionBulkActionDropdownProps {
  selectedCount: number;
  isOpen:        boolean;
  onToggle:      () => void;
  onAction:      (action: SessionBulkAction) => void;
}

const ACTIONS: {
  id:      SessionBulkAction;
  label:   string;
  icon:    React.ReactNode;
  section: 'export';
}[] = [
  { id: 'export', label: 'Exporter en CSV',  icon: <Download className="w-3.5 h-3.5" />, section: 'export' },
  { id: 'print',  label: 'Imprimer fiches', icon: <Printer  className="w-3.5 h-3.5" />, section: 'export' },
];

const SECTIONS: { id: 'export'; label: string }[] = [
  { id: 'export', label: 'Export & Impression' },
];

const SessionBulkActionDropdown: React.FC<SessionBulkActionDropdownProps> = ({
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
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden py-1">
          {SECTIONS.map((section) => {
            const items = ACTIONS.filter(a => a.section === section.id);
            return (
              <React.Fragment key={section.id}>
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {section.label}
                </p>
                {items.map(action => (
                  <button
                    key={action.id}
                    onClick={() => { onAction(action.id); onToggle(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors text-gray-700 hover:bg-[#DDEAD5]/60"
                  >
                    <span className="text-gray-400">{action.icon}</span>
                    {action.label}
                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">
                      {selectedCount}
                    </span>
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

export default SessionBulkActionDropdown;