"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, Filter, Calendar, CheckCircle } from 'lucide-react';

interface WithdrawalFilterBarProps {
  filterValue: string;
  selectedFilter: string;
  selectedStatus: string;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onFilterChange: (key: string) => void;
  onStatusChange: (key: string) => void;
  onExport: () => void;
  totalCount: number;
}

// Custom Dropdown Component
const CustomDropdown: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
}> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[200px]">
          {children}
        </div>
      )}
    </div>
  );
};

const WithdrawalFilterBar: React.FC<WithdrawalFilterBarProps> = ({
  filterValue,
  selectedFilter,
  selectedStatus,
  onSearchChange,
  onClear,
  onFilterChange,
  onStatusChange,
  onExport,
  totalCount,
}) => {
  const filterOptions = [
    { key: 'all', label: 'Toutes les périodes', icon: Filter },
    { key: 'recent', label: 'Récents (30j)', icon: Calendar },
    { key: 'thisMonth', label: 'Ce mois', icon: Calendar },
    { key: 'thisYear', label: 'Cette année', icon: Calendar },
  ];

  const statusOptions = [
    { key: 'all', label: 'Tous les statuts', color: 'default' },
    { key: 'completed', label: 'Complétés', color: 'success' },
    { key: 'pending', label: 'En attente', color: 'warning' },
    { key: 'processing', label: 'En cours', color: 'info' },
    { key: 'failed', label: 'Échoués', color: 'danger' },
  ];

  const getFilterLabel = () => filterOptions.find(opt => opt.key === selectedFilter)?.label || 'Période';
  const getStatusLabel = () => statusOptions.find(opt => opt.key === selectedStatus)?.label || 'Tous les statuts';

  const activeFiltersCount = [
    selectedFilter !== 'all',
    selectedStatus !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header avec recherche et actions principales */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        
        <div className="relative w-full lg:max-w-xl">
          {/* Search icon */}
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />

          {/* Input */}
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher par nom, référence, compte..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full h-12 pl-12 pr-12
              rounded-xl text-sm
              bg-white shadow-sm
              border-2 border-transparent
              hover:border-rose-200
              focus:border-rose-500 focus:outline-none
              transition-colors
            "
          />

          {/* Clear button */}
          {filterValue && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onClear();
              }}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                p-1 rounded-md
                text-gray-400
                hover:text-gray-600
                hover:bg-gray-100
                transition
              "
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={onExport}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 border-2 border-rose-600 text-rose-600 hover:bg-rose-50 font-medium h-12 px-6 rounded-xl transition-all"
          >
            <Download size={16} />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-pink-50 rounded-xl p-4 shadow-sm border border-purple-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge nombre de résultats */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Résultats:</span>
            <span className="bg-purple-100 text-purple-700 font-bold text-base px-4 py-1 rounded-lg">
              {totalCount}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 hidden sm:block" />

          {/* Filtres dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtre période */}
            <CustomDropdown
              trigger={
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedFilter !== 'all' 
                      ? 'bg-purple-100 border-2 border-gray-400 text-purple-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="text-purple-600" size={16} />
                  <span>{getFilterLabel()}</span>
                  <span className="text-xs">▼</span>
                </button>
              }
            >
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => onFilterChange(option.key)}
                    className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors ${
                      selectedFilter === option.key ? 'bg-purple-50 text-purple-700 font-semibold' : ''
                    }`}
                  >
                    <IconComponent className="text-purple-600" size={16} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </CustomDropdown>

            {/* Filtre statut */}
            <CustomDropdown
              trigger={
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedStatus !== 'all' 
                      ? 'bg-rose-100 border-2 border-gray-400 text-rose-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className="text-rose-600" size={16} />
                  <span>{getStatusLabel()}</span>
                  <span className="text-xs">▼</span>
                </button>
              }
            >
              {statusOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onStatusChange(option.key)}
                  className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors ${
                    selectedStatus === option.key ? 'bg-rose-50 text-rose-700 font-semibold' : ''
                  }`}
                >
                  <CheckCircle className="text-rose-600" size={16} />
                  <span>{option.label}</span>
                </button>
              ))}
            </CustomDropdown>

            {/* Badge filtres actifs */}
            {activeFiltersCount > 0 && (
              <>
                <div className="h-8 w-px bg-gray-300 hidden sm:block" />
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    onFilterChange('all');
                    onStatusChange('all');
                  }}
                  className="text-red-600 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  Réinitialiser
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalFilterBar;