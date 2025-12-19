"use client";

import React from "react";
import { FaPlus } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { CiExport } from "react-icons/ci";

// ================= TYPES =================
interface Branch {
  id: string;
  branch_name: string;
}

interface HolidayCalendarFilterBarProps {
  filterValue: string;
  selectedType: string;
  selectedBranch: string;
  branches: Branch[];
  totalCount: number;

  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onTypeChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onAdd: () => void;
  onExport: () => void;
}

// ================= COMPONENT =================
export default function HolidayCalendarFilterBar({
  filterValue,
  selectedType,
  selectedBranch,
  branches,
  totalCount,
  onSearchChange,
  onClearSearch,
  onTypeChange,
  onBranchChange,
  onAdd,
  onExport,
}: HolidayCalendarFilterBarProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
      {/* LEFT */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filterValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un jour férié..."
            className="pl-9 pr-8 h-10 w-64 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {filterValue && (
            <button
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type */}
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="h-10 w-44 rounded-lg border border-gray-300 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tous les types</option>
          <option value="ferie">Férié</option>
          <option value="local">Local</option>
          <option value="interne">Interne</option>
          <option value="election">Élection</option>
          <option value="maintenance">Maintenance</option>
          <option value="autre">Autre</option>
        </select>

        {/* Branch */}
        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="h-10 w-44 rounded-lg border border-gray-300 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Toutes les agences</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.branch_name}
            </option>
          ))}
        </select>

        {/* Count */}
        <span className="text-sm text-gray-500 ml-2">
          {totalCount} {totalCount <= 1 ? "événement" : "événements"}
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex gap-2">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 h-10 px-4 rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-sm font-medium"
        >
          <FaPlus size={14} />
          Ajouter
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium"
        >
          <CiExport size={16} />
          Exporter
        </button>
      </div>
    </div>
  );
}
