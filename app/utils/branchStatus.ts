// src/app/dashboard/branches/utils/branchStatus.ts

import { BranchData } from "../components/branches/validations";

export type BranchStatus = "active" | "inactive" | "archive";

/**
 * Source de vérité : le statut renvoyé par Django (`statusBranche`).
 * Le front ne recalcule plus le statut à partir de l'horaire ou des jours fériés.
 */
export function getEffectiveStatus(b: BranchData): BranchStatus {
  const raw = (b as any).statusBranche ?? (b as any).statusBranch;
  const s = typeof raw === "string" ? raw.toLowerCase() : "";

  if (["archive", "archived", "suspendu", "suspended"].includes(s)) return "archive";
  if (s === "active" || s === "actif") return "active";
  return "inactive";
}

/** Une branche est active si Django le dit. */
export function isBranchActive(b: BranchData): boolean {
  return getEffectiveStatus(b) === "active";
}

/**
 * Points de configuration manquants — purement informatifs.
 * Ils s'affichent comme avertissement, sans changer le statut.
 * (Zéro jour férié est une situation valide : aucun férié à observer.)
 */
export function getBranchConfigWarnings(b: BranchData): string[] {
  const warnings: string[] = [];
  if (!b.opening_hour) warnings.push("Aucun horaire d'ouverture assigné.");
  if ((b.holidays?.length ?? 0) === 0) warnings.push("Aucun jour férié assigné.");
  return warnings;
}