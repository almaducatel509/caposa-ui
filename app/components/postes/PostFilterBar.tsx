"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search, X, ChevronDown,
  Filter, Plus, Download, Wallet
} from "lucide-react";

interface PostFilterBarProps {
  filterValue: string;
  selectedType: string;
  totalCount: number;

  onSearchChange: (v: string) => void;
  onClear: () => void;
  onTypeChange: (v: string) => void;

  onAdd: () => void;
  onExport: () => void;
}

/* ─── Dropdown réutilisable ───────────────── */
function Dropdown({ trigger, children }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

/* ─── Main Component ───────────────── */
const PostFilterBar: React.FC<PostFilterBarProps> = ({
  filterValue,
  selectedType,
  totalCount,
  onSearchChange,
  onClear,
  onTypeChange,
  onAdd,
  onExport,
}) => {

  const TYPE_OPTIONS = [
    { key: "all", label: "Tous", icon: Filter },
    { key: "deposit", label: "Dépôt", icon: Wallet },
    { key: "withdrawal", label: "Retrait", icon: Wallet },
    { key: "transfer", label: "Transfert", icon: Wallet },
  ];

  const typeLabel =
    TYPE_OPTIONS.find(o => o.key === selectedType)?.label ?? "Type";

  const isActive = selectedType !== "all";

  return (
    <div className="flex flex-col gap-4">

      {/* ── Ligne 1 : Recherche + Actions ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">

        {/* 🔍 Search */}
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher un poste par nom ou description..."
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
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

        {/* 🎯 Actions */}
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={onAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Nouveau poste
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* ── Ligne 2 : Filtres ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex flex-wrap items-center gap-3">

        {/* Résultats */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Résultats :</span>
          <span className="bg-[#DDEAD5] text-[#1B5E20] font-bold text-sm px-3 py-0.5 rounded-lg">
            {totalCount}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Filtre Type */}
        <Dropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border ${
              isActive
                ? "bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20]"
                : "bg-white border-gray-200 text-gray-600"
            }`}>
              <Wallet className="w-3.5 h-3.5" />
              {typeLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {TYPE_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => onTypeChange(opt.key)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
                  selectedType === opt.key
                    ? "bg-[#DDEAD5] text-[#1B5E20]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 text-[#2E7D32]" />
                {opt.label}
              </button>
            );
          })}
        </Dropdown>

        {/* Reset */}
        {isActive && (
          <>
            <div className="h-5 w-px bg-gray-200" />
            <button
              onClick={() => onTypeChange("all")}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 bg-red-50 rounded-xl"
            >
              <X className="w-3 h-3" />
              Effacer
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default PostFilterBar;