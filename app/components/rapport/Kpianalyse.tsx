"use client";

import { TypeRapport, TYPE_RAPPORT_META, SnapshotRapport, StatutRapport } from "@/types/rapports";
import {
  Save, Loader2, Check, Printer,
  TrendingUp, AlertTriangle,
  CheckCircle2, XCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";


// ============================================================
// kpiAnalyse.tsx
// ------------------------------------------------------------
// Contient tous les blocs UI de la page analyse temporaire :
//   - AnalyseHeader   → titre + boutons Save / Export PDF
//   - KpiPrincipalCard → le KPI principal avec badge statut
//   - KpisDetaillesGrid → grille des indicateurs détaillés
//   - RecommandationsCard → liste de recommandations
// ============================================================


// ────────────────────────────────────────────────────────────
// AnalyseHeader
// ------------------------------------------------------------
// Barre du haut : titre à gauche, boutons à droite.
// Props :
//   type / periodeLibelle → pour le titre
//   isSaving / succesSave → état du bouton Enregistrer
//   canAct               → false pendant le chargement
//   onSave / onExportPdf → callbacks
// ────────────────────────────────────────────────────────────
interface AnalyseHeaderProps {
  type:          TypeRapport;
  periodeLibelle: string;
  isSaving:      boolean;
  succesSave:    boolean;
  canAct:        boolean;        // false quand les données ne sont pas encore là
  onSave:        () => void;
  onExportPdf:   () => void;
  onClose: () => void; 
}

export function AnalyseHeader({
  type,
  periodeLibelle,
  isSaving,
  succesSave,
  canAct,
  onSave,
  onExportPdf, 
  onClose,

}: AnalyseHeaderProps) {
  const meta = TYPE_RAPPORT_META[type];

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">

      {/* Titre */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
          <TrendingUp className="h-5 w-5 text-green-700" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Analyse — {meta.label}
          </h1>
          <p className="text-xs text-gray-500">
            {periodeLibelle} · {meta.description} ·{" "}
            <span className="italic">non sauvegardée</span>
          </p>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex items-center gap-2">

        {/* Export PDF */}
        <button
          onClick={onExportPdf}
          disabled={!canAct}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          <Printer className="h-4 w-4" />
          Exporter PDF
        </button>

        {/* Enregistrer */}
        <button
          onClick={onSave}
          disabled={!canAct || isSaving || succesSave}
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {succesSave ? (
            <>
              <Check className="h-4 w-4" />
              Enregistré
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer rapport
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}


// ────────────────────────────────────────────────────────────
// KpiPrincipalCard
// ------------------------------------------------------------
// Affiche le KPI principal (label, valeur, unité, seuil)
// avec un badge coloré selon le statut.
// ────────────────────────────────────────────────────────────
interface KpiPrincipalCardProps {
  snapshot: SnapshotRapport;
  statut:   StatutRapport;
}

export function KpiPrincipalCard({ snapshot, statut }: KpiPrincipalCardProps) {
  const { label, valeur, unite, seuil } = snapshot.kpiPrincipal;

  // Style du badge selon statut
  const badgeStyle = {
    conforme: "bg-green-100 text-green-800 ring-green-200",
    alerte:   "bg-amber-100 text-amber-800 ring-amber-200",
    critique: "bg-red-100   text-red-800   ring-red-200",
  }[statut];

  // Icône selon statut
  const Icon = {
    conforme: CheckCircle2,
    alerte:   AlertTriangle,
    critique: XCircle,
  }[statut];

  // Libellé du badge
  const badgeLabel = {
    conforme: "Conforme",
    alerte:   "À surveiller",
    critique: "Critique",
  }[statut];

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">

      {/* Ligne titre + badge */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            KPI Principal
          </p>
          <h2 className="mt-1 text-base font-semibold text-gray-900">
            {label}
          </h2>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${badgeStyle}`}>
          <Icon className="h-3.5 w-3.5" />
          {badgeLabel}
        </span>
      </div>

      {/* Valeur principale */}
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-gray-900">
          {valeur.toLocaleString("fr-FR")}
        </span>
        <span className="text-xl text-gray-500">{unite}</span>
      </div>

      {/* Seuil réglementaire */}
      {seuil !== undefined && (
        <p className="mt-1 text-xs text-gray-500">
          Seuil réglementaire : {seuil}{unite}
        </p>
      )}

    </div>
  );
}


// ────────────────────────────────────────────────────────────
// KpisDetaillesGrid
// ------------------------------------------------------------
// Grille 2-3 colonnes avec tous les indicateurs secondaires.
// On filtre les clés absentes pour éviter les cases vides.
// ────────────────────────────────────────────────────────────
interface KpisDetaillesGridProps {
  data: Record<string, number | string>;
}

// Liste fixe : ordre d'affichage + libellés FR + unités
const KPI_ITEMS: { key: string; label: string; unite?: string }[] = [
  { key: "ratioEndettement",    label: "Ratio d'endettement",    unite: "%" },
  { key: "tauxRecouvrement",    label: "Taux de recouvrement",   unite: "%" },
  { key: "capaciteMoyenne",     label: "Capacité moyenne",       unite: "HTG" },
  { key: "creancesDouteuses",   label: "Créances douteuses",     unite: "%" },
  { key: "ratioLiquidite",      label: "Ratio de liquidité"                  },
  { key: "reservesObligatoires",label: "Réserves obligatoires",  unite: "%" },
  { key: "couvertureRisques",   label: "Couverture des risques", unite: "%" },
];

export function KpisDetaillesGrid({ data }: KpisDetaillesGridProps) {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Indicateurs détaillés
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {KPI_ITEMS
          .filter(item => data[item.key] !== undefined)
          .map(item => (
            <div key={item.key} className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {typeof data[item.key] === "number"
                  ? Number(data[item.key]).toLocaleString("fr-FR")
                  : data[item.key]}
                {item.unite && (
                  <span className="ml-1 text-sm text-gray-500">{item.unite}</span>
                )}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}


// ────────────────────────────────────────────────────────────
// RecommandationsCard
// ------------------------------------------------------------
// Liste de recommandations. Couleur de fond selon statut.
// Retourne null si la liste est vide → pas de carte inutile.
// ────────────────────────────────────────────────────────────
interface RecommandationsCardProps {
  items:  string[];
  statut: StatutRapport;
}

export function RecommandationsCard({ items, statut }: RecommandationsCardProps) {
  if (items.length === 0) return null;

  const bg = {
    conforme: "bg-green-50 ring-green-100",
    alerte:   "bg-amber-50 ring-amber-100",
    critique: "bg-red-50   ring-red-100",
  }[statut];

  return (
    <div className={`rounded-2xl p-6 ring-1 ${bg}`}>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Recommandations
      </h3>
      <ul className="space-y-2">
        {items.map((reco, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
            {reco}
          </li>
        ))}
      </ul>
    </div>
  );
}