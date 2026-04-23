"use client";

import React, { useState, useMemo } from "react";
import {
  Eye, Pencil, CheckCircle2, Trash2,
  ChevronDown, ChevronUp, ChevronsUpDown,
  Clock, Check, X,
  Archive,
  ShieldOff,
  Wallet,
} from "lucide-react";
import { BranchData } from "./validations";
import BranchBulkActionDropdown, { BranchBulkAction } from "./BranchBulkActionDropdown";
import BranchBulkActionModal from "./modals/BranchBulkActionModal";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type BranchStatus = "active" | "inactive" | "archive";
type TabId = "active" | "inactive" | "archive";

export interface BranchTableProps {
  branches:    BranchData[];
  isLoading:   boolean;
  onView:      (b: BranchData) => void;
  onEdit:      (b: BranchData) => void;
  onActivate:  (b: BranchData) => void;
  onDelete:    (b: BranchData) => void;
  onBulkAction?: (action: BranchBulkAction, ids: string[]) => Promise<void>;
}


const STATUS_CFG: Record<BranchStatus, {
  bg: string; text: string; dot: string; label: string;
}> = {
  active: {
    bg:    "bg-[#DDEAD5]",
    text:  "text-[#1B5E20]",
    dot:   "bg-[#2E7D32]",
    label: "Active",
  },
  inactive: {
    bg:    "bg-teal-50",
    text:  "text-teal-700",
    dot:   "bg-teal-500",
    label: "À activer",
  },
  archive: {
    bg:    "bg-amber-50",
    text:  "text-amber-700",
    dot:   "bg-amber-400",
    label: "Archive",
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
  onBulkAction,
}) => {
  /* ── État local ── */
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const [sortField,    setSortField]    = useState<keyof BranchData>("branch_name");
  const [sortDir,      setSortDir]      = useState<"asc" | "desc">("asc");
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<BranchBulkAction | null>(null);

  /* ── Compteurs par onglet ── */
  const counts = useMemo(() => ({
    active: branches.filter(b => b.statusBranche === "active").length,
    inactive: branches.filter(b => b.statusBranche === "inactive").length,
    archive: branches.filter(b => b.statusBranche === "archive").length,
  }), [branches]);

    /* ── Filtrage par onglet ── */
  const tabBranches = useMemo(() =>
    branches.filter(b => {
      if (activeTab === "active") return b.statusBranche === "active";
      if (activeTab === "inactive") return b.statusBranche === "inactive";
      if (activeTab === "archive") return b.statusBranche === "archive";
      return false;
    }),
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

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setSelected(new Set());
  };

  /* ── Branches sélectionnées ── */
  const selectedBranches = useMemo(
    () => sorted.filter(b => selected.has(b.id)),
    [sorted, selected],
  );

  /* ── Colonnes triables ── */
  const SORTABLE_COLS: { label: string; field: keyof BranchData }[] = [
    { label: "Branche",     field: "branch_name"      },
    { label: "Personnel",   field: "number_of_posts"  },
    { label: "Contact",     field: "branch_address"   },
    { label: "Ouverture",   field: "opening_date"     },
    { label: "Statut",      field: "statusBranche"           },
  ];
  // helper
 function getEffectiveStatus(b: BranchData): BranchStatus {
  // On unifie les différentes sources possibles
  const s = (b as any).statusBranch ?? b.statusBranche;

  // Normalisation
  const normalized = typeof s === 'string' ? s.toLowerCase() : s;

  // Inactif
  if (
    normalized === 'inactive' ||
    normalized === 'désactivé' ||
    normalized === 'desactive' ||
    normalized === 'disabled' ||
    normalized === false
  ) {
    return 'inactive';
  }

  // Archivé
  if (
    normalized === 'archive' ||
    normalized === 'archived' ||
    normalized === 'suspendu' ||
    normalized === 'suspended'
  ) {
    return 'archive';
  }

  // Actif par défaut
  return 'active';
}

  /* ── Export CSV interne ── */
  const handleExportCSV = (branchesToExport: BranchData[]) => {
    const headers = [
      'Code', 'Nom', 'Adresse', 'Téléphone', 'Email',
      'Caissiers', 'Commis', 'Agents crédit', 'Total',
      'Date ouverture', 'Statut', 'Horaire',
    ];

    const rows = branchesToExport.map(b => {
      const total =
        (b.number_of_tellers ?? 0) +
        (b.number_of_clerks ?? 0) +
        (b.number_of_credit_officers ?? 0);
      return [
        b.branch_code ?? '',
        b.branch_name ?? '',
        b.branch_address ?? '',
        b.branch_phone_number ?? '',
        b.branch_email ?? '',
        b.number_of_tellers ?? 0,
        b.number_of_clerks ?? 0,
        b.number_of_credit_officers ?? 0,
        total,
        b.opening_date ? new Date(b.opening_date).toLocaleDateString('fr-CA') : '',
        b.opening_hour ? 'Oui' : 'Non',
      ];
    });

    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branches_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Handler par défaut pour onBulkAction ── */
  const handleBulkAction = async (action: BranchBulkAction, ids: string[]) => {
    // Si un handler externe est fourni, on délègue
    if (onBulkAction) {
      await onBulkAction(action, ids);
      return;
    }

    // Sinon, comportement par défaut (surtout pour Export qui est UI-only)
    const branchesToProcess = branches.filter(b => ids.includes(b.id));

    if (action === 'export') {
      handleExportCSV(branchesToProcess);
      return;
    }

    // Pour les autres actions, on log — le parent doit gérer
    console.log(`[Bulk] ${action}`, ids);
    alert(`[Mock] Action "${action}" sur ${ids.length} branche(s) — à implémenter côté parent via onBulkAction`);
  };

  /* ── Render ── */
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Onglets ── */}
    <div className="flex items-center px-2 border-b border-gray-100 bg-white">
      {([
        {
          id: 'active' as TabId,
          label: 'Active',
          icon: Wallet,
          active: 'border-[#2E7D32] text-[#1B5E20]',
          badge: 'bg-[#DDEAD5] text-[#1B5E20]',
          count: counts.active ?? 0,
        },
        {
          id: 'inactive' as TabId,
          label: 'Inactive',
          icon: ShieldOff,
          active: 'border-[#355C7D] text-[#355C7D]',
          badge: 'bg-blue-100 text-[#355C7D]',
          count: counts.inactive ?? 0,
        },
        {
          id: 'archive' as TabId,
          label: 'Archive',
          icon: Archive,
          active: 'border-amber-500 text-amber-700',
          badge: 'bg-yellow-100 text-amber-700',
          count: counts.archive ?? 0,
        },
      ]).map((tab) => {
        const Icon = tab.icon;
        const isCurrent = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 ${
              isCurrent
                ? `${tab.active} font-semibold`
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />

            {tab.label}

            {tab.count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                  isCurrent
                    ? tab.badge
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>

      {/* ── Barre sélection multiple ── */}
      {selected.size > 0 && (
        <div className="px-5 py-3 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-sm font-semibold text-[#1B5E20]">
              {selected.size} branche{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <BranchBulkActionDropdown
              selectedCount={selected.size}
              isOpen={dropdownOpen}
              onToggle={() => setDropdownOpen(o => !o)}
              onAction={(action) => setActiveAction(action)}
            />
            <button onClick={() => setSelected(new Set())}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
            {/* ── En-tête colonnes ── */}
      {/* {(isLoading || sorted.length > 0) && ( */}
        <div
          className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
          style={{ display: "grid", gridTemplateColumns: "40px 1.6fr 1.2fr 1.4fr 1fr 1fr 130px" }}
        >
          {/* Checkbox tout sélectionner */}
          <div className="flex items-center justify-center">
            <button
              onClick={toggleAll}
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                allSelected || someSelected
                  ? "bg-[#2E7D32] border-[#2E7D32]"
                  : "bg-white border-gray-300 hover:border-[#2E7D32]"
              }`}
            >
              {(allSelected || someSelected) && (
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              )}
            </button>
          </div>

          {/* Colonnes triables (on garde SORTABLE_COLS) */}
          {/* {SORTABLE_COLS.map(({ label, field }) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left transition-colors text-gray-600 hover:text-[#1B5E20]"
            >
              {label}
              <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
            </button>
          ))}

          {/* Actions */}
          {/* <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">
            Actions
          </span>
        </div> */} 
        {SORTABLE_COLS.map(col => (
          <button key={col.label} onClick={() => col.field && toggleSort(col.field)}
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left transition-colors ${
              col.field ? 'text-gray-600 hover:text-[#1B5E20] cursor-pointer' : 'text-gray-600 cursor-default'
            }`}>
            {col.label}
            {col.field && <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />}
          </button>
        ))}
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">Actions</span>

      </div>
      {/* ── Lignes ── */}
      <div className="divide-y divide-gray-50">

        {isLoading && [...Array(8)].map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Aucune branche {activeTab === "active" ? "active" : "inactive"}
            </p>
            <p className="text-xs text-gray-400">Modifiez vos critères de recherche</p>

          </div>
        )}

        {!isLoading && sorted.map((branch) => {
          const total =
            branch.number_of_tellers +
            branch.number_of_clerks +
            branch.number_of_credit_officers;
          const status     = getEffectiveStatus(branch);
          const cfg = STATUS_CFG[status] ?? STATUS_CFG['active'];

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
                  ? "bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]"
                  : "hover:bg-[#DDEAD5]/10",
              ].join(" ")}
              style={{ gridTemplateColumns: "40px 1.6fr 1.2fr 1.4fr 1fr 1fr 130px" }}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <button onClick={() => toggleRow(branch.id)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit $cCfg.bg} ${cfg.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                {cfg.label}
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

              {/* Activer — seulement si inactive */}
              {branch.statusBranche === "inactive" && (
                <button
                  onClick={() => onActivate(branch)}
                  title="Activer la branche"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
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
      {!isLoading && branches.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span>{" "}
            résultat{sorted.length !== 1 ? "s" : ""} sur cet onglet
          </p>

          <div className="flex items-center gap-1.5">

            {/* Active */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              {counts.active} Active{counts.active !== 1 ? "s" : ""}
            </span>

            {/* Inactive */}
            {counts.inactive > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-[#355C7D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#355C7D]" />
                {counts.inactive} Inactive{counts.inactive !== 1 ? "s" : ""}
              </span>
            )}

            {/* Archive */}
            {counts.archive > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                {counts.archive} Archivée{counts.archive !== 1 ? "s" : ""}
              </span>
            )}

          </div>
        </div>
      )}
      {/* ── Modal d'action groupée ── */}
      <BranchBulkActionModal
        action={activeAction}
        branches={selectedBranches}
        onClose={() => setActiveAction(null)}
        onConfirm={async (action, eligibleIds) => {
          await handleBulkAction(action, eligibleIds);
          setSelected(new Set());
          setActiveAction(null);
        }}
      />
    </div>
  );
};

export default BranchTable;