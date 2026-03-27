"use client";

import React from "react";
import { FiSearch } from "react-icons/fi";
import { FaPlus, FaDownload } from "react-icons/fa";

interface PostFilterBarProps {
  filterValue: string;
  totalCount:  number;
  onSearchChange: (value: string) => void;
  onClear:  () => void;
  onAdd:    () => void;
  onExport: () => void;
}

const PostFilterBar: React.FC<PostFilterBarProps> = ({
  filterValue, totalCount, onSearchChange, onClear, onAdd, onExport,
}) => {
  return (
    <div className="flex flex-col gap-3">

      {/* ── Ligne 1 : Recherche + boutons ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

        <div className="relative flex-1 max-w-xl">
          <FiSearch size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher un poste par nom ou description…"
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-colors"
          />
          {filterValue && (
            <button type="button"
              onClick={() => { onSearchChange(""); onClear(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onExport}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <FaDownload size={12} />
            Exporter
          </button>
          <button type="button" onClick={onAdd}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold transition-colors shadow-sm">
            <FaPlus size={11} />
            Nouveau poste
          </button>
        </div>
      </div>

      {/* ── Ligne 2 : Compteur ── */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Résultats</span>
        <span className="inline-flex items-center justify-center min-w-8 h-6 px-2 bg-[#DDEAD5] text-[#1B5E20] text-xs font-bold rounded-lg">
          {totalCount}
        </span>
      </div>
    </div>
  );
};

export default PostFilterBar;