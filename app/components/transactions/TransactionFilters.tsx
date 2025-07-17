'use client';
import React from 'react';
import { Input, Button } from "@nextui-org/react";
import { FaSearch, FaFilter, FaCalendarAlt } from "react-icons/fa";

interface TransactionFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
  onRefresh: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onRefresh 
}) => {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      status: 'all',
      dateRange: 'all'
    });
  };

  const transactionTypes = [
    { key: 'all', label: 'Tous', icon: '📊' },
    { key: 'deposit', label: 'Dépôts', icon: '💵' },
    { key: 'withdrawal', label: 'Retraits', icon: '💸' },
    { key: 'transfer', label: 'Virements', icon: '🔄' },
    { key: 'loan', label: 'Prêts', icon: '🏦' }
  ];

  const statusTypes = [
    { key: 'all', label: 'Tous', icon: '📋' },
    { key: 'pending', label: 'En attente', icon: '⏳' },
    { key: 'completed', label: 'Complété', icon: '✅' },
    { key: 'failed', label: 'Échoué', icon: '❌' },
    { key: 'processing', label: 'En cours', icon: '⚡' }
  ];

  const dateRanges = [
    { key: 'all', label: 'Toutes', icon: '📅' },
    { key: 'today', label: 'Aujourd\'hui', icon: '📅' },
    { key: 'week', label: 'Cette semaine', icon: '📆' },
    { key: 'month', label: 'Ce mois', icon: '🗓️' },
    { key: 'quarter', label: 'Ce trimestre', icon: '📊' }
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
      {/* Barre de recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Rechercher une transaction (description, montant, référence...)"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            classNames={{
              input: "text-sm",
              inputWrapper: "border border-gray-300"
            }}
          />
        </div>
        <Button
          color="default"
          variant="bordered"
          startContent={<FaFilter />}
          onClick={resetFilters}
        >
          Réinitialiser
        </Button>
      </div>

      {/* Filtres par type */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <span>🏷️</span> Type de Transaction
        </h4>
        <div className="flex flex-wrap gap-2">
          {transactionTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => updateFilter('type', type.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 font-medium
                ${filters.type === type.key 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
            >
              <span className="text-sm">{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres par statut */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <span>📊</span> Statut
        </h4>
        <div className="flex flex-wrap gap-2">
          {statusTypes.map((status) => (
            <button
              key={status.key}
              onClick={() => updateFilter('status', status.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 font-medium
                ${filters.status === status.key 
                  ? 'bg-green-500 text-white border-green-500 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:bg-green-50'
                }
              `}
            >
              <span className="text-sm">{status.icon}</span>
              <span className="text-sm">{status.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres par période */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FaCalendarAlt className="text-gray-600" /> Période
        </h4>
        <div className="flex flex-wrap gap-2">
          {dateRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => updateFilter('dateRange', range.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 font-medium
                ${filters.dateRange === range.key 
                  ? 'bg-purple-500 text-white border-purple-500 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                }
              `}
            >
              <span className="text-sm">{range.icon}</span>
              <span className="text-sm">{range.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Résultats de filtrage */}
      {(filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all') && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🔍</span>
              <span className="text-blue-800 font-medium">Filtres actifs</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                  Recherche: "{filters.search}"
                </span>
              )}
              {filters.type !== 'all' && (
                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                  Type: {transactionTypes.find(t => t.key === filters.type)?.label}
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                  Statut: {statusTypes.find(s => s.key === filters.status)?.label}
                </span>
              )}
              {filters.dateRange !== 'all' && (
                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                  Période: {dateRanges.find(d => d.key === filters.dateRange)?.label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;