/**
 * mock.ts
 * ───────
 * ⚠️ MOCK_HOLIDAYS et MOCK_BRANCHES ont été retirés — remplacés par
 *    fetchHolidays() (app/lib/api/holidays.ts) et fetchBranches()
 *    (app/lib/api/branches.ts). Ne reste ici que le mock des horaires
 *    d'ouverture, qui n'a pas encore d'équivalent API branché.
 *
 * 📍 app/components/OpeningHours/mock.ts
 */

import { OpeningHours } from "./components/OpeningHours/validations";

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
  }
];