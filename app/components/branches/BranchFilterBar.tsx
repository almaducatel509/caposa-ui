"use client";

import React, { useRef, useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FaPlus, FaDownload, FaBuilding, FaCheckCircle } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Upload } from "lucide-react";

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
  onExport:       () => void;
  onImport?:      () => void;
}

/* ─── Dropdown natif ─────────────────────────────────────────────────────── */

interface DropdownProps {
  value:    string;
  onChange: (key: string) => void;
  options:  { key: string; label: string }[];
  icon:     React.ReactNode;
  active:   boolean;
}

function NativeDropdown({ value, onChange, options, icon, active }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = options.find((o) => o.key === value)?.label ?? options[0].label;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium border transition-all",
          active
            ? "bg-[#DDEAD5] border-[#2E7D32] text-[#1B5E20]"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
        ].join(" ")}
      >
        <span className="text-current">{icon}</span>
        <span>{currentLabel}</span>
        <MdKeyboardArrowDown
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 left-0">
          {options.map((opt) => (
            <li key={opt.key}>
              <button
                type="button"
                onClick={() => { onChange(opt.key); setOpen(false); }}
                className={[
                  "w-full text-left px-4 py-2 text-sm transition-colors",
                  opt.key === value
                    ? "bg-[#DDEAD5] text-[#1B5E20] font-semibold"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
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
  onExport,
  onImport,
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
  ];

  const activeFiltersCount = [
    selectedSize   !== "all",
    selectedStatus !== "all",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Ligne 1 : Recherche + boutons ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

        {/* Barre de recherche — identique AccountFilterBar */}
        <div className="relative flex-1 max-w-xl">
          <FiSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={filterValue}
            placeholder="N° branche, nom, adresse, email..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-colors"
          />
          {filterValue && (
            <button
              type="button"
              onClick={() => { onSearchChange(""); onClear(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Boutons — mêmes que AccountFilterBar */}
        <div className="flex items-center gap-2 shrink-0">
          {onImport && (
            <button
              type="button"
              onClick={onImport}
              className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Upload size={14} />
              Importer
            </button>
          )}
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FaDownload size={12} />
            Exporter
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <FaPlus size={11} />
            Nouvelle branche
          </button>
        </div>
      </div>

      {/* ── Ligne 2 : Compteur + filtres ── */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Résultats */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Résultats</span>
          <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 bg-[#DDEAD5] text-[#1B5E20] text-xs font-bold rounded-lg">
            {totalCount}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Filtre taille */}
        <NativeDropdown
          value={selectedSize}
          onChange={onSizeChange}
          options={sizeOptions}
          icon={<FaBuilding size={11} />}
          active={selectedSize !== "all"}
        />

        {/* Filtre statut */}
        <NativeDropdown
          value={selectedStatus}
          onChange={onStatusChange}
          options={statusOptions}
          icon={<FaCheckCircle size={11} />}
          active={selectedStatus !== "all"}
        />

        {/* Reset filtres actifs */}
        {activeFiltersCount > 0 && (
          <>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""} actif
            </span>
            <button
              type="button"
              onClick={() => { onSizeChange("all"); onStatusChange("all"); }}
              className="text-xs text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
            >
              Réinitialiser
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BranchFilterBar;