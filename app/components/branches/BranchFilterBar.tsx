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
              ✕
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
            onClick={onExport}
            className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm"
          >
            Exporter
          </button>
        </div>
      </div>

      {/* Ligne 2 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex flex-wrap items-center gap-3">

        <span className="text-sm text-gray-500">Résultats :</span>

        <span className="bg-[#DDEAD5] text-[#1B5E20] font-bold text-sm px-3 py-0.5 rounded-lg">
          {totalCount}
        </span>

        <div className="h-5 w-px bg-gray-200" />

        <NativeDropdown
          value={selectedSize}
          onChange={onSizeChange}
          options={sizeOptions}
          icon={<FaBuilding size={11} />}
          active={selectedSize !== "all"}
        />

        <NativeDropdown
          value={selectedStatus}
          onChange={onStatusChange}
          options={statusOptions}
          icon={<FaCheckCircle size={11} />}
          active={selectedStatus !== "all"}
        />

        {activeFiltersCount > 0 && (
          <>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              {activeFiltersCount} filtre(s)
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
          </>
        )}
      </div>
    </div>
  );
};

export default BranchFilterBar;