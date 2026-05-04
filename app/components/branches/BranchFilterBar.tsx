"use client";

import React, { useRef, useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FaPlus, FaDownload, FaBuilding, FaCheckCircle } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { CheckCircle, ChevronDown, Upload, Wallet, X } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface BranchFilterBarProps {
  filterValue:    string;
  selectedSize:   string;
  selectedStatus: string;
  totalCount:     number;
  onSearchChange: (value: string) => void;
  onClear:        () => void;
  onSizeChange:   (key: string) => void;
  onStatusChange: (key: string) => void;
  onAdd:          () => void;
  importLoading?: boolean;
  onImport?:      () => void;
}

/* ─── Dropdown natif ─────────────────────────────────────────────────────── */


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

/* ─── Composant principal ────────────────────────────────────────────────── */

const BranchFilterBar: React.FC<BranchFilterBarProps> = ({
  filterValue,
  selectedSize,
  selectedStatus,
  totalCount,
  onSearchChange,
  onClear,
  onSizeChange,
  onStatusChange,
  onAdd,
  onImport,
  importLoading = false,
}) => {
  const sizeOptions = [
    { key: "all",    label: "Toutes les tailles"      },
    { key: "small",  label: "Petites (< 10 employés)" },
    { key: "medium", label: "Moyennes (10–19)"        },
    { key: "large",  label: "Grandes (20+)"           },
  ];

  const statusOptions = [
    { key: "all",      label: "Tous les statuts" },
    { key: "active",   label: "Actives"          },
    { key: "inactive", label: "Inactives"        },  
    { key: "archive", label: "archive"        },

  ];

  // const activeFiltersCount = [
  //   selectedSize   !== "all",
  //   selectedStatus !== "all",
  // ].filter(Boolean).length;

 const typeLabel   = sizeOptions.find(o => o.key === selectedSize)?.label   ?? 'Toutes les tailles';
  const statusLabel = statusOptions.find(o => o.key === selectedStatus)?.label ?? 'Tous les statuts';
  const activeCount = [selectedSize !== 'all', selectedStatus !== 'all'].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Ligne 1 */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">

        {/* Recherche */}
        <div className="relative w-full lg:max-w-xl">
          <FiSearch
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={filterValue}
            placeholder="Code, nom, adresse, email..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent hover:border-[#2E7D32]/40 transition-all shadow-sm"
          />

          {filterValue && (
            <button
              onClick={() => {
                onSearchChange("");
                onClear();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={onAdd}
            className="flex-1 lg:flex-none h-11 px-5 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-lg"
          >
            Nouvelle branche
          </button>

          <button
            onClick={onImport}
            disabled={importLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {importLoading ? 'Import…' : 'Importer'}
          </button>
        </div>
      </div>

      {/* Ligne 2 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex flex-wrap items-center gap-3">

         <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Résultats</span>
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#DDEAD5] text-[#1B5E20]">
            {totalCount}
          </span>
        </div>
        <div className="h-5 w-px bg-gray-200" />

         {/* Filtre type */}
        <Dropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all ${
              selectedSize !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <Wallet className="w-3.5 h-3.5" />
              {typeLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {sizeOptions.map(opt => {
            return (
              <button
                key={opt.key}
                onClick={() => onSizeChange(opt.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                  selectedSize === opt.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-medium' : 'text-gray-700'
                }`}
              >
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
              <CheckCircle className="w-3.5 h-3.5" />
              {statusLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {statusOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => onStatusChange(opt.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                selectedStatus === opt.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-medium' : 'text-gray-700'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
              {opt.label}
            </button>
          ))}
        </Dropdown>

        {activeCount > 0 && (
          <div>
            <div className="h-5 w-px bg-gray-200" />
            {/* <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              {activeFiltersCount} filtre(s)
            </span> */}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                onSizeChange("all");
                onStatusChange("all");
              }}
              className="text-xs text-red-600"
            >
              Effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchFilterBar;