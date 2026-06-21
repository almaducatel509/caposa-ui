// src/app/dashboard/sessions/utils/sessionEligibility.ts

import type { OpeningHour } from "@/types/branche";
import { isBranchActive } from "./branchStatus";
import { BranchData } from "../components/branches/validations";
import { Holiday } from "../components/holidays/validations";

/* ─── Types ──────────────────────────────────────────────────────────── */

export type SessionEligibilityReason =
  | "OK"
  | "BRANCH_NOT_CONFIGURED"
  | "BRANCH_ARCHIVED"
  | "HOLIDAY"
  | "OUTSIDE_HOURS";

export interface SessionEligibility {
  eligible: boolean;
  reason: SessionEligibilityReason;
  requiresOverride?: boolean;
  details?: string;
}

/* ─── Helper principal ───────────────────────────────────────────────── */

/**
 * Détermine si une session peut être ouverte MAINTENANT dans une branche.
 * 
 * Retourne :
 *  - eligible: true              → ouverture directe
 *  - requiresOverride: true       → nécessite l'approbation du directeur
 *  - eligible: false sans override → blocage total (branche archivée/non configurée)
 * 
 * ⚠️  Cette vérification est informative côté front uniquement.
 *     Le backend DOIT refaire la même vérification et logger la tentative.
 *     Voir : apps/sessions/services.py → check_branch_eligibility()
 */
export function canOpenSessionNow(
  branch: BranchData,
  now: Date,
  hours: OpeningHour,
  holidays: Holiday[]
): SessionEligibility {
  // 1. Branche pas configurée → blocage total
  if (!isBranchActive(branch)) {
    return {
      eligible: false,
      reason: "BRANCH_NOT_CONFIGURED",
      details: "Cette branche n'a pas ses horaires ou jours fériés configurés.",
    };
  }

  // 2. Branche archivée → blocage total
  if ((branch as any).statusBranche === "archive") {
    return {
      eligible: false,
      reason: "BRANCH_ARCHIVED",
      details: "Cette branche est archivée et ne peut plus être utilisée.",
    };
  }

  // 3. Jour férié → override possible
  const isHoliday = holidays.some(
    (h) => new Date(h.date).toDateString() === now.toDateString()
  );
  if (isHoliday) {
    return {
      eligible: false,
      reason: "HOLIDAY",
      requiresOverride: true,
      details: "Aujourd'hui est un jour férié. Approbation du directeur requise.",
    };
  }

  // 4. Hors horaires → override possible
  if (!isWithinHours(now, hours)) {
    return {
      eligible: false,
      reason: "OUTSIDE_HOURS",
      requiresOverride: true,
      details: "Nous sommes hors des horaires d'ouverture. Approbation requise.",
    };
  }

  // 5. Tout est OK
  return { eligible: true, reason: "OK" };
}

/* ─── Helpers privés ─────────────────────────────────────────────────── */

function isWithinHours(now: Date, hours: OpeningHour): boolean {
  const dayKeys = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday",
  ] as const;

  const dayKey = dayKeys[now.getDay()] as keyof OpeningHour;
  const range = hours[dayKey] as string | undefined; // ex: "08:00-17:00"

  if (!range || range === "00:00-00:00") return false;

  const [start, end] = range.split("-");
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= toMinutes(start) && currentMinutes <= toMinutes(end);
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}