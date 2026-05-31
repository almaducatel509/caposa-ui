"use client";

import { useState, useMemo } from "react";
import {
  Eye, FileDown,
  Check, ChevronUp, ChevronDown, ChevronsUpDown,
  CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Loader2,
} from "lucide-react";

// ============================================================
// RapportsTable.tsx
// ------------------------------------------------------------
// Tableau des rapports officiels enregistrés en base.
// Fonctionnalités :
//   - Tri par colonne (clic sur en-tête)
//   - Badge statut coloré
//   - Bouton 👁 Voir  → page détail du rapport
//   - Bouton PDF      → export jsPDF (géré par le parent)
// ============================================================


// ────────────────────────────────────────────────────────────
// Type : un rapport tel que retourné par GET /api/reports
// ────────────────────────────────────────────────────────────
export interface RapportRow {
  id:              string;        // ex: "RPT-001"
  type:            string;        // ex: "solvabilite"
  type_label:      string;        // ex: "Solvabilité"
  periode_libelle: string;        // ex: "Mars 2026"
  statut:          "conforme" | "alerte" | "critique";
  genere_par_nom:  string;        // ex: "Jean Dupont"
  genere_le:       string;        // ISO date
  reference:       string;        // ex: "RPT-2026-001"
}

interface RapportsTableProps {
  rapports:      RapportRow[];
  loading?:      boolean;
  onVoir:        (r: RapportRow) => void;
  onExportPdf:   (r: RapportRow) => void;
}


// ────────────────────────────────────────────────────────────
// Config statut → couleurs + icône
// ────────────────────────────────────────────────────────────
const STATUT_CFG: Record<RapportRow["statut"], {
  label: string;
  bg:    string;
  text:  string;
  dot:   string;
  Icon:  React.ElementType;
}> = {
  conforme: {
    label: "Conforme",
    bg:    "bg-green-100",
    text:  "text-green-800",
    dot:   "bg-green-600",
    Icon:  CheckCircle2,
  },
  alerte: {
    label: "À surveiller",
    bg:    "bg-amber-100",
    text:  "text-amber-800",
    dot:   "bg-amber-500",
    Icon:  AlertTriangle,
  },
  critique: {
    label: "Critique",
    bg:    "bg-red-100",
    text:  "text-red-800",
    dot:   "bg-red-500",
    Icon:  XCircle,
  },
};


// ────────────────────────────────────────────────────────────
// Colonnes : libellé affiché + clé de tri
// ────────────────────────────────────────────────────────────
const COLS: { label: string; field: keyof RapportRow }[] = [
  { label: "Référence",   field: "reference"       },
  { label: "Type",        field: "type_label"      },
  { label: "Période",     field: "periode_libelle" },
  { label: "Statut",      field: "statut"          },
  { label: "Généré par",  field: "genere_par_nom"  },
  { label: "Date",        field: "genere_le"       },
];

// Largeur de la grille CSS
const GRID = "1.4fr 1.4fr 1.2fr 1.2fr 1.4fr 1.2fr 100px";


// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit",
  });
}


// ────────────────────────────────────────────────────────────
// SortIcon — flèche dans l'en-tête de colonne
// ────────────────────────────────────────────────────────────
function SortIcon({
  field, sortField, sortDir,
}: {
  field:     string;
  sortField: string;
  sortDir:   "asc" | "desc";
}) {
  if (sortField !== field)
    return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />;
  return sortDir === "asc"
    ? <ChevronUp   className="h-3.5 w-3.5 text-green-700" />
    : <ChevronDown className="h-3.5 w-3.5 text-green-700" />;
}


// ────────────────────────────────────────────────────────────
// RapportsTable — composant principal
// ────────────────────────────────────────────────────────────
export default function RapportsTable({
  rapports,
  loading = false,
  onVoir,
  onExportPdf,
}: RapportsTableProps) {

  // ── État tri ──────────────────────────────────────────────
  const [sortField, setSortField] = useState<keyof RapportRow>("genere_le");
  const [sortDir,   setSortDir]   = useState<"asc" | "desc">("desc");

  function toggleSort(field: keyof RapportRow) {
    if (sortField === field) {
      // Même colonne → on inverse la direction
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      // Nouvelle colonne → tri ascendant par défaut
      setSortField(field);
      setSortDir("asc");
    }
  }

  // ── Liste triée (recalculée seulement si rapports/tri change) ─
  const sorted = useMemo(() => {
    return [...rapports].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      // Tri par date (comparaison de timestamps)
      if (sortField === "genere_le") {
        return (new Date(a.genere_le).getTime() - new Date(b.genere_le).getTime()) * dir;
      }

      // Tri alphabétique pour tout le reste
      const valA = String(a[sortField] ?? "");
      const valB = String(b[sortField] ?? "");
      return valA.localeCompare(valB, "fr") * dir;
    });
  }, [rapports, sortField, sortDir]);


  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

      {/* ── En-têtes ── */}
      <div
        className="border-b border-gray-200 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] px-5 py-3"
        style={{ display: "grid", gridTemplateColumns: GRID }}
      >
        {COLS.map(col => (
          <button
            key={col.field}
            onClick={() => toggleSort(col.field)}
            className="flex items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:text-green-800"
          >
            {col.label}
            <SortIcon field={col.field} sortField={sortField as string} sortDir={sortDir} />
          </button>
        ))}

        {/* Colonne Actions — pas triable */}
        <span className="text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
          Actions
        </span>
      </div>

      {/* ── Corps ── */}
      <div className="divide-y divide-gray-50">

        {/* État chargement */}
        {loading && (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="h-6 w-6 animate-spin text-green-700" />
          </div>
        )}

        {/* État vide */}
        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <TrendingUp className="h-7 w-7 text-green-700" />
            </div>
            <p className="mb-1 text-sm font-semibold text-gray-900">
              Aucun rapport enregistré
            </p>
            <p className="text-xs text-gray-400">
              Générez une analyse et cliquez sur « Enregistrer comme rapport »
            </p>
          </div>
        )}

        {/* Lignes */}
        {!loading && sorted.map((r, i) => {
          const cfg = STATUT_CFG[r.statut];

          return (
            <div
              key={r.id}
              className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${
                i % 2 === 0
                  ? "bg-white hover:bg-green-50/20"
                  : "bg-gray-50/40 hover:bg-green-50/20"
              }`}
              style={{ gridTemplateColumns: GRID }}
            >

              {/* Référence */}
              <div>
                <p className="font-mono text-xs font-semibold text-gray-700">
                  {r.reference}
                </p>
              </div>

              {/* Type */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {r.type_label}
                </p>
              </div>

              {/* Période */}
              <div>
                <p className="text-sm text-gray-700">{r.periode_libelle}</p>
              </div>

              {/* Statut */}
              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Généré par */}
              <div>
                <p className="text-sm text-gray-700">{r.genere_par_nom}</p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {formatDate(r.genere_le)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatTime(r.genere_le)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">

                {/* Voir le rapport */}
                <button
                  title="Voir"
                  onClick={() => onVoir(r)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>

                {/* Exporter PDF */}
                <button
                  title="Exporter PDF"
                  onClick={() => onExportPdf(r)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-700"
                >
                  <FileDown className="h-3.5 w-3.5" />
                </button>

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {!loading && sorted.length > 0 && (
        <div className="flex items-center border-t border-gray-100 bg-[#F9F9F6] px-5 py-3">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span>{" "}
            rapport{sorted.length !== 1 ? "s" : ""} enregistré{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

    </div>
  );
}