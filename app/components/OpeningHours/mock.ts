/**
 * mock.ts
 * ───────
 * Source de données mock pour le calendrier de jours fériés.
 *
 * ⚠️ Tous les types Holiday viennent de holidays/validations.ts
 *    (source UNIQUE de vérité).
 *
 * 📍 Chemin du fichier dans le projet :
 *    app/components/OpeningHours/mock.ts
 *
 * 📍 Chemin de validations.ts (cible des imports) :
 *    app/components/holidays/validations.ts
 */

// ── Ré-exports des types depuis la source unique ────────────────────────
// Permet aux anciens imports `import { Holiday } from "@/.../mock"` de fonctionner.
export type {
  Holiday,
  HolidayData,
  HolidayType,
  HolidayScope,
} from "@/app/components/holidays/validations";

// ── Import LOCAL pour typer MOCK_HOLIDAYS ───────────────────────────────
// 🎯 IMPORTANT : ce import doit pointer vers holidays/, PAS branches/
import type { Holiday } from "@/app/components/holidays/validations";

// ── Mock branches ───────────────────────────────────────────────────────
export interface MockBranch {
  branch_code: string;
  branch_name: string;
  city?: string;
  department_code?: string;
}

export const MOCK_BRANCHES: MockBranch[] = [
  { branch_code: "PAP-001", branch_name: "Port-au-Prince Centre", city: "Port-au-Prince", department_code: "OUEST" },
  { branch_code: "CAP-001", branch_name: "Cap-Haïtien",          city: "Cap-Haïtien",     department_code: "NORD" },
  { branch_code: "CAY-001", branch_name: "Les Cayes",            city: "Les Cayes",       department_code: "SUD" },
  { branch_code: "GON-001", branch_name: "Gonaïves",             city: "Gonaïves",        department_code: "ARTIBONITE" },
  { branch_code: "JAC-001", branch_name: "Jacmel",               city: "Jacmel",          department_code: "SUD-EST" },
];

// ── Mock holidays — TOUS conformes à HolidayData (avec pending_assignment) ─
export const MOCK_HOLIDAYS: Holiday[] = [
  {
    id: "h-001",
    date: "2025-01-01",
    description: "Jour de l'An / Indépendance",
    type: "ferie",
    scope: "national",
    pending_assignment: false,
    comment: "Fête nationale haïtienne",
    created_at: "2024-12-01T00:00:00Z",
  },
  {
    id: "h-002",
    date: "2025-01-02",
    description: "Jour des Aïeux",
    type: "ferie",
    scope: "national",
    pending_assignment: false,
    created_at: "2024-12-01T00:00:00Z",
  },
  {
    id: "h-003",
    date: "2025-05-18",
    description: "Jour du Drapeau",
    type: "ferie",
    scope: "national",
    pending_assignment: false,
    created_at: "2024-12-01T00:00:00Z",
  },
  {
    id: "h-004",
    date: "2025-08-20",
    description: "Fête patronale du Cap",
    type: "local",
    scope: "branch",
    branch_code: "CAP-001",
    pending_assignment: false,
    comment: "Spécifique à la branche Cap-Haïtien",
    created_at: "2024-12-01T00:00:00Z",
  },
  {
    id: "h-005",
    date: "2025-12-25",
    description: "Noël",
    type: "ferie",
    scope: "national",
    pending_assignment: false,
    created_at: "2024-12-01T00:00:00Z",
  },
  // Brouillon (en attente d'assignation)
  {
    id: "h-006",
    date: "2025-11-18",
    description: "Bataille de Vertières",
    type: "ferie",
    scope: "national",
    pending_assignment: true,
    created_at: "2025-01-15T00:00:00Z",
  },
];

import { OpeningHours } from "./validations";

export const MOCK_OPENING_HOURS: OpeningHours[] = [
  {
    monday: "08:00-17:00",
    tuesday: "08:00-17:00",
    wednesday: "08:00-17:00",
    thursday: "08:00-17:00",
    friday: "08:00-17:00",
  },
  {
    monday: "09:00-16:00",
    tuesday: "09:00-16:00",
    wednesday: "09:00-16:00",
    thursday: "09:00-16:00",
    friday: "09:00-16:00",
    // samedi/dimanche optionnels → tu peux les omettre
  }
];