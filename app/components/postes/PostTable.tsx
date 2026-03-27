"use client";

import React, { useState, useMemo } from "react";
import {
  Eye, Pencil, Trash2,
  ChevronDown, ChevronUp, ChevronsUpDown,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  ShieldOff,
} from "lucide-react";
import { PostData } from "./validations";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface Post extends PostData {
  description: any;
  deposit: any;
  withdrawal: any;
  transfert: any;
  id: string;
  name: string;
}

export interface PostTableProps {
  posts:      Post[];
  isLoading:  boolean;
  onEdit:     (p: Post) => void;
  onDelete:   (p: Post) => void;
  onView?:    (p: Post) => void;
}

/* ─── Permission badges ──────────────────────────────────────────────────── */

function PermBadge({ label, icon: Icon, active, color }: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  color: string;
}) {
  if (!active) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border"
      style={{ backgroundColor: color + "18", color, borderColor: color + "30" }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

/* ─── Sort icon ──────────────────────────────────────────────────────────── */

function SortIcon({ field, sortField, sortDir }: {
  field: string; sortField: string; sortDir: "asc" | "desc";
}) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === "asc"
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function SkeletonRow() {
  return (
    <div className="grid items-center px-5 py-3.5 border-b border-gray-50"
      style={{ gridTemplateColumns: "40px 2fr 3fr 1fr 120px" }}>
      <div className="w-4 h-4 rounded bg-gray-100 animate-pulse mx-auto" />
      <div className="h-3.5 w-32 bg-gray-100 animate-pulse rounded" />
      <div className="h-3 w-48 bg-gray-100 animate-pulse rounded" />
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => <div key={i} className="h-5 w-14 bg-gray-100 animate-pulse rounded-lg" />)}
      </div>
      <div className="flex gap-1 justify-center">
        {[...Array(2)].map((_, i) => <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />)}
      </div>
    </div>
  );
}

/* ─── Composant principal ────────────────────────────────────────────────── */

const PostTable: React.FC<PostTableProps> = ({
  posts, isLoading, onEdit, onDelete, onView,
}) => {
  const [sortField, setSortField] = useState<keyof Post>("name");
  const [sortDir,   setSortDir]   = useState<"asc" | "desc">("asc");
  const [selected,  setSelected]  = useState<Set<string>>(new Set());

  /* ── Tri ── */
  const toggleSort = (field: keyof Post) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sorted = useMemo(() =>
    [...posts].sort((a, b) => {
      const va = String(a[sortField] ?? "").toLowerCase();
      const vb = String(b[sortField] ?? "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 :  1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    }),
    [posts, sortField, sortDir]
  );

  /* ── Sélection ── */
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(sorted.map(p => p.id)));

  const toggleRow = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const SORTABLE_COLS: { label: string; field: keyof Post }[] = [
    { label: "Nom du poste",  field: "name"        },
    { label: "Description",   field: "description" },
    { label: "Permissions",   field: "deposit"     },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Header colonnes ── */}
      <div
        className="grid items-center px-5 py-3 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]"
        style={{ gridTemplateColumns: "40px 2fr 3fr 1fr 120px" }}
      >
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
            <ShieldOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">Aucun poste configuré</p>
          </div>
        )}

        {!isLoading && sorted.map((post) => {
          const isSelected = selected.has(post.id);
          const permCount = [post.deposit, post.withdrawal, post.transfert].filter(Boolean).length;

          return (
            <div
              key={post.id}
              className={[
                "grid items-center px-5 py-3 transition-colors",
                isSelected ? "bg-[#DDEAD5]/20" : "hover:bg-[#DDEAD5]/10",
              ].join(" ")}
              style={{ gridTemplateColumns: "40px 2fr 3fr 1fr 120px" }}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRow(post.id)}
                  className="w-3.5 h-3.5 accent-[#2E7D32] cursor-pointer"
                />
              </div>

              {/* Nom */}
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{post.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {permCount} permission{permCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-2 pr-4">{post.description}</p>

              {/* Permissions */}
              <div className="flex flex-wrap gap-1.5">
                <PermBadge label="Dépôt"    icon={ArrowDownToLine}  active={post.deposit}    color="#2E7D32" />
                <PermBadge label="Retrait"  icon={ArrowUpFromLine}  active={post.withdrawal} color="#D4AF37" />
                <PermBadge label="Transfert" icon={ArrowLeftRight}  active={post.transfert}  color="#355C7D" />
                {!post.deposit && !post.withdrawal && !post.transfert && (
                  <span className="text-xs text-gray-400 italic">Aucune</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 justify-center">
                {onView && (
                  <button onClick={() => onView(post)} title="Voir"
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => onEdit(post)} title="Modifier"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-[#DDEAD5] hover:text-[#1B5E20] transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(post)} title="Supprimer"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer sélection ── */}
      {selected.size > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#DDEAD5]/20 flex items-center justify-between">
          <p className="text-xs text-[#1B5E20] font-medium">
            {selected.size} poste{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}
          </p>
          <button onClick={() => setSelected(new Set())}
            className="text-xs text-gray-500 hover:text-gray-700 underline">
            Désélectionner tout
          </button>
        </div>
      )}
    </div>
  );
};

export default PostTable;