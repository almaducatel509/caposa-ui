"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, Upload, Download, Filter,
  Calendar, MapPin, CheckCircle, X, ChevronDown
} from 'lucide-react';

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

// ─── Custom Dropdown ───────────────────────────────────────────────────────────
const CustomDropdown: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
}> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(o => !o)}>{trigger}</div>
      {isOpen && (
        <div className="absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[200px]">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
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
    { key: 'all',       label: 'Tous',           icon: Filter },
    { key: 'recent',    label: 'Récents (30j)',   icon: Calendar },
    { key: 'thisMonth', label: 'Ce mois',         icon: Calendar },
    { key: 'thisYear',  label: 'Cette année',     icon: Calendar },
  ];

  const branchOptions = [
    { key: 'all', label: 'Toutes les branches' },
    ...branches.map(b => ({ key: b.id, label: b.branch_name })),
  ];

  const statusOptions = [
    { key: 'all',       label: 'Tous les statuts' },
    { key: 'active',    label: 'Actifs' },
    { key: 'inactive',  label: 'Inactifs' },
    { key: 'suspended', label: 'Suspendus' },
  ];

  const getFilterLabel  = () => filterOptions.find(o => o.key === selectedFilter)?.label  ?? 'Période';
  const getBranchLabel  = () => branches.find(b => b.id === selectedBranch)?.branch_name   ?? 'Toutes les branches';
  const getStatusLabel  = () => statusOptions.find(o => o.key === selectedStatus)?.label   ?? 'Tous les statuts';

  const activeCount = [
    selectedFilter !== 'all',
    selectedBranch !== 'all',
    selectedStatus !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 ">

      {/* ── Ligne 1 : Recherche + Actions ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">

        {/* Barre de recherche */}
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher par nom, email, téléphone..."
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent hover:border-[#2E7D32]/40 transition-all shadow-sm"
          />
          {filterValue && (
            <button
              onClick={() => { onSearchChange(''); onClear(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={onAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
          <button
            onClick={onImport}
            disabled={importLoading}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-white border-2 border-[#2E7D32] text-[#2E7D32] text-sm font-medium rounded-xl hover:bg-[#DDEAD5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
                Import…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Importer
              </>
            )}
          </button>
          <button
            onClick={onExport}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-white border-2 border-[#2E7D32] text-[#2E7D32] text-sm font-medium rounded-xl hover:bg-[#DDEAD5] transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* ── Ligne 2 : Filtres avancés ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-2 flex flex-wrap items-center gap-3">

        {/* Badge résultats */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Résultats :</span>
          <span className="bg-[#DDEAD5] text-[#1B5E20] font-bold text-sm px-3 py-0.5 rounded-lg">
            {totalCount}
          </span>
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* Filtre période */}
        <CustomDropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
              selectedFilter !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              {getFilterLabel()}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {filterOptions.map(o => (
            <button
              key={o.key}
              onClick={() => onFilterChange(o.key)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#DDEAD5]/40 transition-colors ${
                selectedFilter === o.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold' : 'text-gray-700'
              }`}
            >
              <o.icon className="w-3.5 h-3.5 text-[#2E7D32]" />
              {o.label}
            </button>
          ))}
        </CustomDropdown>

        {/* Filtre branche */}
        <CustomDropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
              selectedBranch !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <MapPin className="w-3.5 h-3.5" />
              {getBranchLabel()}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {branchOptions.map(o => (
            <button
              key={o.key}
              onClick={() => onBranchChange(o.key)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#DDEAD5]/40 transition-colors ${
                selectedBranch === o.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold' : 'text-gray-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
              {o.label}
            </button>
          ))}
        </CustomDropdown>

        {/* Filtre statut */}
        <CustomDropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
              selectedStatus !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <CheckCircle className="w-3.5 h-3.5" />
              {getStatusLabel()}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {statusOptions.map(o => (
            <button
              key={o.key}
              onClick={() => onStatusChange(o.key)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#DDEAD5]/40 transition-colors ${
                selectedStatus === o.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold' : 'text-gray-700'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
              {o.label}
            </button>
          ))}
        </CustomDropdown>

        {/* Badge filtres actifs + reset */}
        {activeCount > 0 && (
          <>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-lg text-xs font-semibold">
              {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => { onFilterChange('all'); onBranchChange('all'); onStatusChange('all'); }}
              className="flex items-center gap-1 text-xs text-red-600 font-medium px-3 py-1 hover:bg-red-50 rounded-xl transition-colors"
            >
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeFilterBar;