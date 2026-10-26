// src/app/dashboard/sessions/utils/sessionEligibility.ts

import type { OpeningHour } from "@/types/branche";
import { getEffectiveStatus } from "./branchStatus";
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
 *  - eligible: true                → ouverture directe
 *  - requiresOverride: true        → nécessite l'approbation du directeur
 *  - eligible: false sans override → blocage total (archivée / inactive / sans horaire)
 *
 * ⚠️  Vérification informative côté front uniquement.
 *     Le statut de la branche vient de Django (`statusBranche`).
 */
export function canOpenSessionNow(
  branch: BranchData,
  now: Date,
  hours: OpeningHour | null | undefined,
  holidays: Holiday[]
): SessionEligibility {
  const status = getEffectiveStatus(branch);

  // 1. Branche archivée → blocage total
  if (status === "archive") {
    return {
      eligible: false,
      reason: "BRANCH_ARCHIVED",
      details: "Cette branche est archivée et ne peut plus être utilisée.",
    };
  }

  // 2. Branche inactive selon Django, ou sans horaire → blocage total
  if (status !== "active" || !hours) {
    return {
      eligible: false,
      reason: "BRANCH_NOT_CONFIGURED",
      details: status !== "active"
        ? "Cette branche est inactive."
        : "Cette branche n'a pas d'horaire d'ouverture assigné.",
    };
  }

  // 3. Jour férié → override possible (aucun férié = rien à bloquer)
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