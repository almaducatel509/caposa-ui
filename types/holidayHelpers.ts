/**
 * holidayHelpers.ts — v3
 *
 * `pending_assignment` a été supprimé du modèle Holiday côté Django
 * (migration schedules.0003_remove_holiday_pending_assignment).
 * Plus de notion de brouillon : un férié s'applique selon son scope.
 *
 * `isPending` / `pending` / `isPendingAssignment` sont conservés pour ne pas
 * casser les composants qui les lisent encore ; ils valent toujours false / 0.
 */

import { Holiday, HolidayScope } from "@/app/components/holidays/validations";
import type { Branch } from "@/types/branche";

export function isHolidayAppliedToBranch(
  holiday: Holiday,
  branch: Branch
): boolean {
  switch (holiday.scope) {
    case "national":
      return true;
    case "regional":
      return branch.department_code === holiday.branch_code;
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

/** @deprecated plus de brouillons — toujours false */
export function isPendingAssignment(_holiday: Holiday): boolean {
  return false;
}

export interface GroupedHoliday {
  id: string;
  date: string;
  description: string;
  type: Holiday["type"];
  records: Holiday[];
  effectiveScope: HolidayScope;
  /** @deprecated plus de brouillons — toujours false */
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
    } else {
      map.set(key, {
        id: h.id,
        date: h.date,
        description: h.description,
        type: h.type,
        records: [h],
        effectiveScope: h.scope,
        isPending: false,
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
  if (group.records.some((r) => r.scope === "national")) {
    return allBranches;
  }

  const concerned = new Set<string>();
  for (const record of group.records) {
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
  /** @deprecated plus de brouillons — toujours 0 */
  pending: number;
  /** Fériés sans aucune branche effective (anomalie) */
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
  let unassigned = 0;

  for (const g of groups) {
    if (new Date(g.date) >= today) upcoming++;
    if (getBranchesForGroup(g, allBranches).length === 0) unassigned++;
  }

  return {
    total: groups.length,
    upcoming,
    pending: 0,
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