// src/app/dashboard/branches/utils/branchStatus.ts

import { BranchData } from "../components/branches/validations";



export type BranchStatus = "active" | "inactive" | "archive";

/**
 * Détermine si une branche est configurée et opérationnelle.
 * Une branche est active si elle a un horaire ET des jours fériés définis.
 */
export function isBranchActive(b: BranchData): boolean {
  return !!b.opening_hour && (b.holidays?.length ?? 0) > 0;
}

/**
 * Statut effectif de la branche, avec prise en compte de l'archivage manuel.
 */
export function getEffectiveStatus(b: BranchData): BranchStatus {
  const manual = (b as any).statusBranch ?? b.statusBranche;
  const normalized = typeof manual === "string" ? manual.toLowerCase() : manual;

  // Archivage manuel explicite
  if (["archive", "archived", "suspendu", "suspended"].includes(normalized)) {
    return "archive";
  }

  // Logique métier locale
  return isBranchActive(b) ? "active" : "inactive";
}
