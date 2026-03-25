"use client";

import React, { useState, useMemo } from "react";
import {
  Eye, Pencil, CheckCircle2, Trash2,
  ChevronDown, ChevronUp, ChevronsUpDown,
  Clock,
} from "lucide-react";
import { BranchData } from "./validations";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BranchTableProps {
  branches:    BranchData[];
  isLoading:   boolean;
  onView:      (b: BranchData) => void;
  onEdit:      (b: BranchData) => void;
  onActivate:  (b: BranchData) => void;
  onDelete:    (b: BranchData) => void;
}

/* ─── Statut effectif (logique métier) ───────────────────────────────────── */

type EffectiveStatus = "active" | "needs_activation" | "missing_schedule";

export function getEffectiveStatus(b: BranchData): EffectiveStatus {
  if (b.status === "active" && b.opening_hour) return "active";
  if (b.opening_hour)                           return "needs_activation";
  return "missing_schedule";
}

const STATUS_CFG: Record<EffectiveStatus, {
  bg: string; text: string; dot: string; label: string;
}> = {
  active: {
    bg:    "bg-[#DDEAD5]",
    text:  "text-[#1B5E20]",
    dot:   "bg-[#2E7D32]",
    label: "Actif",
  },
  needs_activation: {
    bg:    "bg-teal-50",
    text:  "text-teal-700",
    dot:   "bg-teal-500",
    label: "À activer",
  },
  missing_schedule: {
    bg:    "bg-amber-50",
    text:  "text-amber-700",
    dot:   "bg-amber-400",
    label: "Horaire manquant",
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: string;
  sortField: string;
  sortDir: "asc" | "desc";
}) {
  if (sortField !== field)
    return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === "asc"
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function SkeletonRow() {
  return (
    <div
      className="grid items-center px-5 py-3.5 border-b border-gray-50"
      style={{ gridTemplateColumns: "40px 1.6fr 1.2fr 1.4fr 1fr 1fr 130px" }}
    >
      <div className="flex justify-center">
        <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-36 bg-gray-100 animate-pulse rounded" />
        <div className="h-2.5 w-28 bg-gray-100 animate-pulse rounded" />
      </div>
      <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
      <div className="h-3 w-28 bg-gray-100 animate-pulse rounded" />
      <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
      <div className="h-5 w-24 bg-gray-100 animate-pulse rounded-full" />
      <div className="flex justify-center gap-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* ─── Composant principal ────────────────────────────────────────────────── */

const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  isLoading,
  onView,
  onEdit,
  onActivate,
  onDelete,
}) => {
  /* ── État local ── */
  const [activeTab, setActiveTab]   = useState<"active" | "inactive">("active");
  const [sortField, setSortField]   = useState<keyof BranchData>("branch_name");
  const [sortDir,   setSortDir]     = useState<"asc" | "desc">("asc");
  const [selected,  setSelected]    = useState<Set<string>>(new Set());

  /* ── Compteurs par onglet ── */
  const counts = useMemo(() => ({
    active:   branches.filter(b => getEffectiveStatus(b) === "active").length,
    inactive: branches.filter(b => getEffectiveStatus(b) !== "active").length,
  }), [branches]);

  /* ── Filtrage par onglet ── */
  const tabBranches = useMemo(() =>
    branches.filter(b =>
      activeTab === "active"
        ? getEffectiveStatus(b) === "active"
        : getEffectiveStatus(b) !== "active"
    ),
    [branches, activeTab]
  );

  /* ── Tri ── */
  const toggleSort = (field: keyof BranchData) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sorted = useMemo(() =>
    [...tabBranches].sort((a, b) => {
      const raw_a = a[sortField] ?? "";
      const raw_b = b[sortField] ?? "";

      const va: string | number =
        typeof raw_a === "number" ? raw_a
        : typeof raw_a === "string" ? raw_a.toLowerCase()
        : String(raw_a).toLowerCase();

      const vb: string | number =
        typeof raw_b === "number" ? raw_b
        : typeof raw_b === "string" ? raw_b.toLowerCase()
        : String(raw_b).toLowerCase();

      if (va < vb) return sortDir === "asc" ? -1 :  1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    }),
    [tabBranches, sortField, sortDir]
  );

  /* ── Sélection ── */
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(sorted.map(b => b.id)));

  const toggleRow = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const handleTabChange = (tab: "active" | "inactive") => {
    setActiveTab(tab);
    setSelected(new Set());
  };

  /* ── Colonnes triables ── */
  const SORTABLE_COLS: { label: string; field: keyof BranchData }[] = [
    { label: "Branche",     field: "branch_name"     },
    { label: "Personnel",   field: "number_of_posts"  },
    { label: "Contact",     field: "branch_address"   },
    { label: "Ouverture",   field: "opening_date"     },
    { label: "Statut",      field: "status"           },
  ];

  /* ── Render ── */
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Onglets ── */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-gray-100">
        {(["active", "inactive"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count    = counts[tab];
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={[
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2",
                isActive
                  ? "border-[#2E7D32] text-[#1B5E20] bg-[#DDEAD5]/30"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {tab === "active" ? "Branches actives" : "Branches inactives"}
              <span
                className={[
                  "px-2 py-0.5 rounded-lg text-xs font-bold",
                  isActive
                    ? "bg-[#2E7D32] text-white"
                    : "bg-gray-100 text-gray-500",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Header colonnes ── */}
      <div
        className="grid items-center px-5 py-3 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]"
        style={{ gridTemplateColumns: "40px 1.6fr 1.2fr 1.4fr 1fr 1fr 130px" }}
      >
        {/* Checkbox tout sélectionner */}
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => { if (el) el.indeterminate = someSelected; }}
            onChange={toggleAll}
            className="w-3.5 h-3.5 accent-[#2E7D32] cursor-pointer"
          />
        </div>

        {SORTABLE_COLS.map(({ label, field }) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-[#2E7D32] transition-colors text-left"
          >
            {label}
            <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
          </button>
        ))}

        <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Actions
        </div>
      </div>

      {/* ── Lignes ── */}
      <div className="divide-y divide-gray-50">

        {isLoading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && sorted.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Aucune branche {activeTab === "active" ? "active" : "inactive"}
            </p>
          </div>
        )}

        {!isLoading && sorted.map((branch) => {
          const total =
            branch.number_of_tellers +
            branch.number_of_clerks +
            branch.number_of_credit_officers;

          const effectiveStatus = getEffectiveStatus(branch);
          const statusCfg       = STATUS_CFG[effectiveStatus];

          const category =
            total >= 20 ? { label: "Grande",  color: "#2E7D32", bg: "#DDEAD5" } :
            total >= 10 ? { label: "Moyenne", color: "#2E7D32", bg: "#DDEAD5" } :
                          { label: "Petite",  color: "#D4AF37", bg: "#FFF4D6" };

          const isSelected = selected.has(branch.id);

          return (
            <div
              key={branch.id}
              className={[
                "grid items-center px-5 py-3 transition-colors cursor-default",
                isSelected
                  ? "bg-[#DDEAD5]/20"
                  : "hover:bg-[#DDEAD5]/10",
              ].join(" ")}
              style={{ gridTemplateColumns: "40px 1.6fr 1.2fr 1.4fr 1fr 1fr 130px" }}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRow(branch.id)}
                  className="w-3.5 h-3.5 accent-[#2E7D32] cursor-pointer"
                />
              </div>

              {/* Branche + code */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {branch.branch_name}
                  </p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0"
                    style={{ backgroundColor: category.bg, color: category.color }}
                  >
                    {category.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono truncate">
                  {branch.branch_code}
                </p>
              </div>

              {/* Personnel */}
              <div className="text-xs">
                <p className="font-bold text-gray-800">{total} employés</p>
                <p className="text-gray-400">
                  {branch.number_of_tellers}c · {branch.number_of_clerks}cm · {branch.number_of_credit_officers}ag
                </p>
              </div>

              {/* Contact */}
              <div className="text-xs text-gray-500 space-y-0.5">
                <p className="truncate">{branch.branch_address}</p>
                <p>{branch.branch_phone_number}</p>
                <p className="truncate">{branch.branch_email}</p>
              </div>

              {/* Date ouverture */}
              <p className="text-xs text-gray-500">
                {new Date(branch.opening_date).toLocaleDateString("fr-CA")}
              </p>

              {/* Statut ternaire */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${statusCfg.bg} ${statusCfg.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">

                {/* Voir */}
                <button
                  onClick={() => onView(branch)}
                  title="Voir les détails"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Modifier */}
                <button
                  onClick={() => onEdit(branch)}
                  title="Modifier"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-[#DDEAD5] hover:text-[#1B5E20] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Activer — seulement si horaire assigné mais pas encore active */}
                {effectiveStatus === "needs_activation" && (
                  <button
                    onClick={() => onActivate(branch)}
                    title="Activer la branche"
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}

                {/* Assigner horaire — seulement si horaire manquant */}
                {effectiveStatus === "missing_schedule" && (
                  <button
                    onClick={() => onView(branch)}
                    title="Horaire manquant — voir détails"
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}

                {/* Supprimer */}
                <button
                  onClick={() => onDelete(branch)}
                  title="Supprimer"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer — nombre sélectionnés ── */}
      {selected.size > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#DDEAD5]/20 flex items-center justify-between">
          <p className="text-xs text-[#1B5E20] font-medium">
            {selected.size} branche{selected.size > 1 ? "s" : ""} sélectionnée{selected.size > 1 ? "s" : ""}
          </p>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Désélectionner tout
          </button>
        </div>
      )}
    </div>
  );
};

export default BranchTable;