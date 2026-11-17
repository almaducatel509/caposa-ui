'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { X } from 'lucide-react';
import { DatePeriodFilter } from '@/app/components/common/DatePeriodFilter';

/* ================= TYPES ================= */

export interface TransactionFiltersState {
  search: string;
  type: string;
  status: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onFiltersChange: (filters: TransactionFiltersState) => void;
}

/* ================= OPTIONS ================= */

const TYPE_OPTIONS = [
  { key: 'all', label: 'Tous les types' },
  { key: 'deposit', label: 'Dépôts' },
  { key: 'withdrawal', label: 'Retraits' },
  { key: 'transfer', label: 'Virements' },
  { key: 'loan', label: 'Prêts' },
];

const STATUS_OPTIONS = [
  { key: 'all', label: 'Tous les statuts' },
  { key: 'pending', label: 'En attente' },
  { key: 'completed', label: 'Complété' },
  { key: 'failed', label: 'Échoué' },
];

/* ================= COMPONENT ================= */

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const update = (key: keyof TransactionFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const reset = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      status: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const isPeriodActive = filters.dateRange !== 'all' || !!filters.startDate || !!filters.endDate;
  const activeCount = [
    filters.type !== 'all',
    filters.status !== 'all',
    isPeriodActive,
    !!filters.search.trim(),
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* 🔍 SEARCH */}
      <div className="relative max-w-xl">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Rechercher par référence, montant, description..."
          className="w-full h-11 pl-11 pr-10 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] shadow-xs"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => update('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 🎛 FILTER BAR */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 flex flex-wrap gap-3 items-center">
        {/* TYPE */}
        <select
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
          className="h-10 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 cursor-pointer"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>

        {/* STATUS */}
        <select
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
          className="h-10 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 cursor-pointer"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>

        {/* DATE PERIOD & CUSTOM DATES */}
        <DatePeriodFilter
          selectedPeriod={filters.dateRange}
          startDate={filters.startDate}
          endDate={filters.endDate}
          onPeriodChange={(p) => update('dateRange', p)}
          onDateRangeChange={(start, end) => {
            onFiltersChange({
              ...filters,
              startDate: start,
              endDate: end,
              dateRange: start || end ? 'custom' : filters.dateRange,
            });
          }}
        />

        {/* ACTIVE BADGE & RESET */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <span className="px-2.5 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold">
              {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
            >
              <X className="w-3 h-3" /> Effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionFilters;
