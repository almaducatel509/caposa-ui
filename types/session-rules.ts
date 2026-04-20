/**
 * @/types/session-rules.ts
 * ─────────────────────────────────────────────────────────────────
 * Types pour la règle d'ouverture de session :
 *   • Vérification horaires / jours fériés / jours fermés
 *   • Réponse du endpoint GET /api/sessions/can-open/
 * ─────────────────────────────────────────────────────────────────
 */

/** Raisons possibles d'un refus d'ouverture */
export type CloseReason =
  | 'holiday'        // Jour férié dans le calendrier
  | 'closed_day'     // Jour fermé dans l'horaire (ex: dimanche)
  | 'outside_hours'; // Hors plage horaire (ex: après 16h)

/** Créneau d'ouverture courant (si canOpen = true) */
export interface OpeningWindow {
  opensAt: string;   // ISO : "2026-04-20T08:00:00Z"
  closesAt: string;  // ISO : "2026-04-20T16:00:00Z"
}

/** Réponse du endpoint GET /api/sessions/can-open/ */
export interface CanOpenResponse {
  canOpen: boolean;

  /** Message d'information affiché à l'utilisateur */
  message: string;

  /** Raison du refus (uniquement si canOpen = false) */
  reason?: CloseReason;

  /** Créneau d'ouverture courant (uniquement si canOpen = true) */
  currentWindow?: OpeningWindow;

  /** Date/heure de la prochaine ouverture (uniquement si canOpen = false) */
  nextOpeningAt?: string; // ISO

  /** Nom du jour férié (uniquement si reason = "holiday") */
  holidayName?: string;
}