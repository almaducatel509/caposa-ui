"use client";

import React from "react";
import { Search, X, Plus, Download, Building2 } from "lucide-react";
import { MOCK_BRANCHES } from "../OpeningHours/mock";

interface HolidayCalendarFilterBarProps {
  filterValue: string;
  selectedType: string;
  selectedScope: string;
  selectedBranch: string;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onTypeChange: (value: string) => void;
  onScopeChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onAdd: () => void;
  onExport: () => void;
}

export default function HolidayCalendarFilterBar({
  filterValue,
  selectedType,
  selectedScope,
  selectedBranch,
  totalCount,
  onSearchChange,
  onClearSearch,
  onTypeChange,
  onScopeChange,
  onBranchChange,
  onAdd,
  onExport,
}: HolidayCalendarFilterBarProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Row 1 — search + actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Rechercher un jour férié..."
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-300 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
          />
          {filterValue && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white
                       shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       border border-gray-200 bg-white text-gray-700
                       hover:bg-gray-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Row 2 — filters + count */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type */}
        <select
          value={selectedType}
          onChange={e => onTypeChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white
                     focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]
                     appearance-none transition-all"
        >
          <option value="all">Tous les types</option>
          <option value="ferie">Férié</option>
          <option value="local">Local</option>
          <option value="interne">Interne</option>
          <option value="election">Élection</option>
          <option value="maintenance">Maintenance</option>
          <option value="autre">Autre</option>
        </select>

        {/* Scope */}
        <select
          value={selectedScope}
          onChange={e => onScopeChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white
                     focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]
                     appearance-none transition-all"
        >
          <option value="all">Toutes les portées</option>
          <option value="national">National</option>
          <option value="regional">Régional</option>
          <option value="branch">Succursale</option>
        </select>

        {/* Branch — depuis MOCK_BRANCHES */}
        <select
          value={selectedBranch}
          onChange={e => onBranchChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white
                     focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]
                     appearance-none transition-all"
        >
          <option value="all">
            <Building2 className="w-3.5 h-3.5" />
            Toutes les succursales
          </option>
          {MOCK_BRANCHES.map(b => (
            <option key={b.branch_code} value={b.branch_code}>
              {b.branch_name}
            </option>
          ))}
        </select>

        {/* Count */}
        <div className="h-px w-px" />
        <span className="text-xs text-gray-500 ml-1">
          <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
          {totalCount <= 1 ? "événement" : "événements"}
        </span>
      </div>
    </div>
  );
}