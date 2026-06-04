'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, X,
  ChevronDown,
  Banknote, FileCheck, ArrowLeftRight, Wallet, MoreHorizontal,
  CheckCircle2, Clock, Loader2, XCircle,
  Plus, RefreshCw,
  Filter,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { DepositData } from '../validation/deposit';
export type DepositFilterRange  = 'all' | 'small' | 'medium' | 'large' | 'xlarge';
export type DepositFiltertype = 'all' | 'cash'| 'check';

export type DepositFilterPeriod = 'all' | 'today' | 'week' | 'month' | 'year';

interface DepositFilterBarProps {
  selectedPeriod: DepositFilterPeriod;
  filterValue:    string;
  selectedType:   string;
  selectedStatus: string;
  totalCount:     number;
  loading?:       boolean;
  onSearchChange: (v: string) => void;
  onClear:        () => void;
  onTypeChange:   (v: string) => void;
  onStatusChange: (v: string) => void;
  onPeriodChange: (v: DepositFilterPeriod)=> void;
  onAdd:          () => void;
  onRefresh:      () => void;
  deposits:       DepositData[];
  selectedRange:  DepositFilterRange;
  onRangeChange:  (key: DepositFilterRange) => void;
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
function Dropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px]">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
const DepositFilterBar: React.FC<DepositFilterBarProps> = ({
  filterValue,onRangeChange, selectedType,selectedRange, selectedStatus, selectedPeriod, totalCount, loading = false,
  onSearchChange, onClear, onTypeChange, onStatusChange, onPeriodChange,
  onAdd, onRefresh, deposits, 

}) => {


  const PERIOD_OPTIONS = [
    { key: 'all',   label: 'Toutes périodes', icon: Filter   },
    { key: 'today', label: "Aujourd'hui",     icon: Calendar },
    { key: 'week',  label: '7 jours',         icon: Calendar },
    { key: 'month', label: '30 jours',        icon: Calendar },
  ];
  const TYPE_OPTIONS = [
    { key: 'all',      label: 'Tous les types', icon: Wallet           },
    { key: 'cash',     label: 'Espèces',        icon: Banknote         },
    { key: 'check',    label: 'Chèque',         icon: FileCheck        },
    { key: 'transfer', label: 'Virement',       icon: ArrowLeftRight   },
    { key: 'other',    label: 'Autre',          icon: MoreHorizontal   },
  ];

  const STATUS_OPTIONS = [
    { key: 'all',        label: 'Tous les statuts', icon: CheckCircle2 },
    { key: 'encaisse',   label: 'Encaissé',         icon: CheckCircle2 },
    { key: 'en_attente', label: 'En attente',       icon: Clock        },
    { key: 'en_cours',   label: 'En cours',         icon: Loader2      },
    { key: 'echoue',     label: 'Échoué',           icon: XCircle      },
  ];

  const typeLabel   = TYPE_OPTIONS.find(o => o.key === selectedType)?.label   ?? 'Tous les types';
  const statusLabel = STATUS_OPTIONS.find(o => o.key === selectedStatus)?.label ?? 'Tous les statuts';
  // const activeCount = (selectedType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  const activeCount = [
    selectedPeriod !== 'all',
    selectedType   !== 'all',
    selectedStatus !== 'all',
    selectedRange  !== 'all',
  ].filter(Boolean).length;

  const handleReset = () => {
    onPeriodChange('all');
    onTypeChange('all');
    onStatusChange('all');
    onRangeChange('all');
  };  
  
  return (
    <div className="space-y-3">

      {/* ── Ligne 1 : recherche + actions ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">

        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Code, n° compte, nom du membre…"
            className="w-full h-10 pl-10 pr-10 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] placeholder:text-gray-400 transition-all"
          />
          {filterValue && (
            <button
              onClick={() => { onSearchChange(''); onClear(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau dépôt
          </button>
        </div>
      </div>

      {/* ── Ligne 2 : filtres ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Résultats</span>
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#DDEAD5] text-[#1B5E20]">
            {totalCount}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Filtre période */}
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map(p => (
              <button
                key={p.key}
                onClick={() => onPeriodChange(p.key as DepositFilterPeriod)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedPeriod === p.key
                    ? 'bg-[#2E7D32] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Filtre type */}
        <Dropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all ${
              selectedType !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <Wallet className="w-3.5 h-3.5" />
              {typeLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {TYPE_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => onTypeChange(opt.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                  selectedType === opt.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-medium' : 'text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 text-[#2E7D32]" />
                {opt.label}
              </button>
            );
          })}
        </Dropdown>

        {/* Filtre statut */}
        <Dropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all ${
              selectedStatus !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {STATUS_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => onStatusChange(opt.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                  selectedStatus === opt.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-medium' : 'text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 text-[#2E7D32]" />
                {opt.label}
              </button>
            );
          })}
        </Dropdown>
       
        {/* Réinitialiser */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
            >
              <X className="w-3 h-3" /> Effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositFilterBar;