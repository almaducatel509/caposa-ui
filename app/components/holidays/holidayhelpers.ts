/**
 * holidayHelpers.ts — v3
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MODIFICATIONS apportées à ce fichier :
 *
 * 1. ADAPTÉ : `branch_code` polymorphe → `department_code` + `branch_code`
 *    Le scope='regional' utilise maintenant `holiday.department_code`
 *    au lieu de `holiday.branch_code`. Plus clair et plus sûr.
 *
 * 2. AJOUTÉ : `getApplicableHolidaysForBranch`
 *    Filtre la liste complète des fériés pour ne garder que ceux qui
 *    s'appliquent à une branche donnée (selon scope + dept + branch).
 *    Utilisé dans la future page d'assignation des fériés à une branche.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type { Branch } from "@/types/branche";
import type { HolidayScope, Holiday } from "@/app/components/holidays/validations";

export function isHolidayAppliedToBranch(
  holiday: Holiday,
  branch: Branch
): boolean {
  // Un brouillon ne s'applique à AUCUNE branche
  if (holiday.pending_assignment) return false;

  switch (holiday.scope) {
    case "national":
      return true;
    case "regional":
      // ─── MODIF : utilise department_code (anciennement branch_code surchargé)
      return branch.department_code === holiday.department_code;
    case "branch":
      return branch.branch_code === holiday.branch_code;
    case "autre":
    default:
      return branch.branch_code === holiday.branch_code;
  }
}

export function getApplicableBranches(
  holiday: Holiday,
  allBranches: Branch[]
): Branch[] {
  return allBranches.filter((b) => isHolidayAppliedToBranch(holiday, b));
}

export function isPendingAssignment(holiday: Holiday): boolean {
  return holiday.pending_assignment === true;
}

// ─────────────────────────────────────────────────────────────────────────
// NOUVEAU : Filtre des fériés applicables à une branche donnée
// ─────────────────────────────────────────────────────────────────────────

/**
 * Filtre les fériés applicables à une branche donnée.
 *
 * Logique :
 *   - National  : toujours applicable (toutes branches)
 *   - Regional  : applicable si holiday.department_code === branch.department_code
 *   - Branch    : applicable si holiday.branch_code === branch.branch_code
 *   - Autre     : par défaut, traité comme branch-level
 *
 * Ignore les fériés en pending_assignment (brouillons).
 *
 * Utilisé dans la page d'assignation des fériés à une branche : on ne
 * propose à l'admin que les fériés qui ont du sens pour CETTE branche.
 */
export function getApplicableHolidaysForBranch(
  allHolidays: Holiday[],
  branch: Branch
): Holiday[] {
  return allHolidays.filter((h) => isHolidayAppliedToBranch(h, branch));
}

export interface GroupedHoliday {
  id: string;
  date: string;
  description: string;
  type: Holiday["type"];
  records: Holiday[];
  effectiveScope: HolidayScope;
  /** true si TOUS les enregistrements du groupe sont en pending_assignment */
  isPending: boolean;
}

export function groupHolidaysByEvent(holidays: Holiday[]): GroupedHoliday[] {
  const map = new Map<string, GroupedHoliday>();

  for (const h of holidays) {
    const key = `${h.date}::${h.description.toLowerCase().trim()}`;
    const existing = map.get(key);

    if (existing) {
      existing.records.push(h);
      existing.effectiveScope = widerScope(existing.effectiveScope, h.scope);
      existing.isPending = existing.isPending && h.pending_assignment;
    } else {
      map.set(key, {
        id: h.id,
        date: h.date,
        description: h.description,
        type: h.type,
        records: [h],
        effectiveScope: h.scope,
        isPending: h.pending_assignment === true,
      });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

const SCOPE_RANK: Record<HolidayScope, number> = {
  national: 3,
  regional: 2,
  branch: 1,
  autre: 0,
};

function widerScope(a: HolidayScope, b: HolidayScope): HolidayScope {
  return SCOPE_RANK[a] >= SCOPE_RANK[b] ? a : b;
}

export function getBranchesForGroup(
  group: GroupedHoliday,
  allBranches: Branch[]
): Branch[] {
  if (group.isPending) return [];

  if (
    group.records.some(
      (r) => !r.pending_assignment && r.scope === "national"
    )
  ) {
    return allBranches;
  }

  const concerned = new Set<string>();
  for (const record of group.records) {
    if (record.pending_assignment) continue;
    for (const branch of allBranches) {
      if (isHolidayAppliedToBranch(record, branch)) {
        concerned.add(branch.branch_code);
      }
    }
  }
  return allBranches.filter((b) => concerned.has(b.branch_code));
}

export interface HolidayStats {
  total: number;
  upcoming: number;
  /** Brouillons en attente d'assignation */
  pending: number;
  /** Fériés assignés mais sans aucune branche effective (anomalie) */
  unassigned: number;
  activeBranches: number;
}

export function computeHolidayStats(
  groups: GroupedHoliday[],
  allBranches: Branch[]
): HolidayStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let upcoming = 0;
  let pending = 0;
  let unassigned = 0;

  for (const g of groups) {
    if (new Date(g.date) >= today) upcoming++;
    if (g.isPending) {
      pending++;
    } else {
      const branches = getBranchesForGroup(g, allBranches);
      if (branches.length === 0) unassigned++;
    }
  }

  return {
    total: groups.length,
    upcoming,
    pending,
    unassigned,
    activeBranches: allBranches.length,
  };
}

export function formatHolidayDate(dateStr: string): string {
  try {
    const d = dateStr.includes("T")
      ? new Date(dateStr)
      : new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getMonthShort(dateStr: string): string {
  try {
    const d = dateStr.includes("T")
      ? new Date(dateStr)
      : new Date(dateStr + "T12:00:00");
    return d
      .toLocaleDateString("fr-FR", { month: "short" })
      .toUpperCase()
      .replace(".", "");
  } catch {
    return "";
  }
}

export function getDayNumber(dateStr: string): string {
  try {
    const d = dateStr.includes("T")
      ? new Date(dateStr)
      : new Date(dateStr + "T12:00:00");
    return String(d.getDate());
  } catch {
    return "";
  }
}

export function isUpcoming(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = dateStr.includes("T")
    ? new Date(dateStr)
    : new Date(dateStr + "T12:00:00");
  return d >= today;
}