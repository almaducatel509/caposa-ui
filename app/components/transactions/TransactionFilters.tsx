'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

/* ================= TYPES ================= */

export interface TransactionFiltersState {
  search: string;
  type: string;
  status: string;
  dateRange: string;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onFiltersChange: (filters: TransactionFiltersState) => void;
}

/* ================= OPTIONS ================= */

const TYPE_OPTIONS = [
  { key: 'all', label: 'Tous' },
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

const DATE_OPTIONS = [
  { key: 'all', label: 'Toutes les périodes' },
  { key: 'today', label: "Aujourd’hui" },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
];

/* ================= COMPONENT ================= */

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const update = (key: keyof TransactionFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const reset = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      status: 'all',
      dateRange: 'all',
    });
  };

  const activeCount = [
    filters.type !== 'all',
    filters.status !== 'all',
    filters.dateRange !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">

      {/* 🔍 SEARCH */}
      <div className="relative max-w-xl">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Rechercher une transaction (référence, montant, note...)"
          className="
            w-full h-12 pl-12 pr-4 rounded-xl
            bg-white shadow-sm
            border-2 border-transparent
            hover:border-violet-200
            focus:border-violet-500 focus:outline-none
          "
        />
      </div>

      {/* 🎛 FILTER BAR */}
      <div className="bg-violet-50 rounded-xl p-4 shadow-sm border border-violet-100">
        <div className="flex flex-wrap gap-3 items-center">

          {/* TYPE */}
          <select
            value={filters.type}
            onChange={(e) => update('type', e.target.value)}
            className="h-10 px-4 rounded-lg border bg-white"
          >
            {TYPE_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>

          {/* STATUS */}
          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value)}
            className="h-10 px-4 rounded-lg border bg-white"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>

          {/* DATE */}
          <select
            value={filters.dateRange}
            onChange={(e) => update('dateRange', e.target.value)}
            className="h-10 px-4 rounded-lg border bg-white"
          >
            {DATE_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>

          {/* ACTIVE BADGE */}
          {activeCount > 0 && (
            <>
              <span className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-semibold">
                {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
              </span>
              <button
                onClick={reset}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Réinitialiser
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
