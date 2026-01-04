"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaUpload, FaDownload, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { FiSearch } from 'react-icons/fi';
import { MdKeyboardArrowDown } from 'react-icons/md';

interface EmployeeFilterBarProps {
  filterValue: string;
  selectedFilter: string;
  selectedBranch: string;
  selectedStatus: string;
  branches: Array<{ id: string; branch_name: string }>;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onFilterChange: (key: string) => void;
  onBranchChange: (key: string) => void;
  onStatusChange: (key: string) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  totalCount: number;
  importLoading?: boolean;
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

const EmployeeFilterBar: React.FC<EmployeeFilterBarProps> = ({
  filterValue,
  selectedFilter,
  selectedBranch,
  selectedStatus,
  branches,
  onSearchChange,
  onClear,
  onFilterChange,
  onBranchChange,
  onStatusChange,
  onAdd,
  onImport,
  onExport,
  totalCount,
  importLoading = false,
}) => {
  const filterOptions = [
    { key: 'all', label: 'Tous', icon: FaFilter },
    { key: 'recent', label: 'Récents (30j)', icon: FaCalendarAlt },
    { key: 'thisMonth', label: 'Ce mois', icon: FaCalendarAlt },
    { key: 'thisYear', label: 'Cette année', icon: FaCalendarAlt },
  ];

  const branchOptions = [
    { key: 'all', label: 'Toutes les branches' },
    ...branches.map(b => ({ key: b.id, label: b.branch_name }))
  ];

  const statusOptions = [
    { key: 'all', label: 'Tous les statuts', color: 'default' },
    { key: 'active', label: 'Actifs', color: 'success' },
    { key: 'inactive', label: 'Inactifs', color: 'warning' },
    { key: 'suspended', label: 'Suspendus', color: 'danger' },
  ];

  const getFilterLabel = () => filterOptions.find(opt => opt.key === selectedFilter)?.label || 'Période';
  const getBranchLabel = () => branches.find(b => b.id === selectedBranch)?.branch_name || 'Toutes les branches';
  const getStatusLabel = () => statusOptions.find(opt => opt.key === selectedStatus)?.label || 'Tous les statuts';

  const activeFiltersCount = [
    selectedFilter !== 'all',
    selectedBranch !== 'all',
    selectedStatus !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header avec recherche et actions principales */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Recherche */}
        <div className="relative w-full lg:max-w-xl">
          {/* Search icon (always visible) */}
          <FiSearch
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />

          {/* Input */}
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher un employé par nom, email, téléphone..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full h-12 pl-12 pr-12
              rounded-xl text-sm
              bg-white shadow-sm
              border-2 border-transparent
              hover:border-blue-200
              focus:border-blue-500 focus:outline-none
              transition-colors
            "
          />

          {/* Clear button (only when text exists) */}
          {filterValue && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onClear();
              }}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                p-1 rounded-full
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
            onClick={onAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-lg"
          >
            <FaPlus size={16} />
            Ajouter
          </button>
          <button
            onClick={onImport}
            disabled={importLoading}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 border-2 border-green-600 bg-white text-green-600 hover:border-slate-400 hover:bg-slate-50 font-medium h-12 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" />
                Import...
              </>
            ) : (
              <>
                <FaUpload size={16} />
                Importer
              </>
            )}
          </button>
          <button
            onClick={onExport}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 border-2 border-green-600 bg-white text-green-600 hover:border-slate-400 hover:bg-slate-50 font-medium h-12 px-6 rounded-lg transition-all"
          >
            <FaDownload size={16} />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-linear-to-r from-blue-50 via-white to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge nombre de résultats */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Résultats:</span>
            <span className="bg-blue-100 text-blue-700 font-bold text-base px-4 py-1 rounded-lg">
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
                      ? 'bg-blue-100 border-2 border-gray-400 text-green-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaCalendarAlt className="text-green-600" />
                  <span>{getFilterLabel()}</span>
                  <MdKeyboardArrowDown />
                </button>
              }
            >
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onFilterChange(option.key)}
                  className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors ${
                    selectedFilter === option.key ? 'bg-blue-50 text-blue-700 font-semibold' : ''
                  }`}
                >
                  <option.icon className="text-green-600" />
                  <span>{option.label}</span>
                </button>
              ))}
            </CustomDropdown>

            {/* Filtre branche */}
            <CustomDropdown
              trigger={
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedBranch !== 'all' 
                      ? 'bg-indigo-100 border-2 border-gray-400 text-green-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaMapMarkerAlt className="text-green-600" />
                  <span>{getBranchLabel()}</span>
                  <MdKeyboardArrowDown />
                </button>
              }
            >
              {branchOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onBranchChange(option.key)}
                  className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors ${
                    selectedBranch === option.key ? 'bg-indigo-50 text-indigo-700 font-semibold' : ''
                  }`}
                >
                  <FaMapMarkerAlt className="text-green-600" />
                  <span>{option.label}</span>
                </button>
              ))}
            </CustomDropdown>

            {/* Filtre statut */}
            <CustomDropdown
              trigger={
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedStatus !== 'all' 
                      ? 'bg-green-100 border-2 border-gray-400 text-green-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaCheckCircle className="text-green-600" />
                  <span>{getStatusLabel()}</span>
                  <MdKeyboardArrowDown />
                </button>
              }
            >
              {statusOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onStatusChange(option.key)}
                  className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors ${
                    selectedStatus === option.key ? 'bg-green-50 text-green-700 font-semibold' : ''
                  }`}
                >
                  <FaCheckCircle className="text-green-600" />
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
                    onBranchChange('all');
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

export default EmployeeFilterBar;