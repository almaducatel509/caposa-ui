import { z } from "zod";

// ─── Zod schema OpeningHours────────────────────────────────────────────────────────────────
const TIME_RANGE = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
 
const requiredDay = z
  .string()
  .min(1, "Ce champ est obligatoire")
  .regex(TIME_RANGE, "Format invalide, utilisez HH:mm-HH:mm");
 
const optionalDay = z
  .string()
  .refine(
    (v) => v === "" || TIME_RANGE.test(v),
    "Format invalide, utilisez HH:mm-HH:mm"
  )
  .optional();
 
export const openingHoursSchema = z.object({
  monday:    requiredDay,
  tuesday:   requiredDay,
  wednesday: requiredDay,
  thursday:  requiredDay,
  friday:    requiredDay,
  saturday:  optionalDay,
  sunday:    optionalDay,
});
 
export type OpeningHours = z.infer<typeof openingHoursSchema>;
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

// ─── Domain types ──────────────────────────────────────────────────────────────
export type DepartmentCode =
  | "OUEST" | "NORD" | "SUD" | "ARTIBONITE" | "CENTRE"
  | "GRAND_ANSE" | "NIPPES" | "NORDEST" | "NORD_OUEST" | "SUDEST";

export interface OpeningHourDetail {
  id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday?: string | null;
  sunday?: string | null;
}

export interface BranchData {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  status: "active" | "inactive";
  department_code: DepartmentCode;
  city: string;
  opening_hour?: string;
  opening_hour_details?: OpeningHourDetail;
}

// ─── Opening hours domain type ─────────────────────────────────────────────────
export type OpeningHoursStatus = "active" | "paused" | "vacation";

export interface OpeningHrs {
  id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string | null;
  sunday: string | null;
  created_at: string;
  updated_at: string;
  status: OpeningHoursStatus;
}

export interface OpeningHoursStats {
  total: number;
  active: number;
  paused: number;
  vacation: number;
}

// ─── API → domain mapper ───────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertToOpeningHours = (apiData: any): OpeningHrs => ({
  id: apiData.id,
  monday: apiData.monday,
  tuesday: apiData.tuesday,
  wednesday: apiData.wednesday,
  thursday: apiData.thursday,
  friday: apiData.friday,
  saturday: apiData.saturday ?? null,
  sunday: apiData.sunday ?? null,
  created_at: apiData.created_at,
  updated_at: apiData.updated_at,
  status: apiData.status ?? "active",
});

// ─── Stats calculator ──────────────────────────────────────────────────────────
export const computeStats = (hours: OpeningHrs[]): OpeningHoursStats => ({
  total:    hours.length,
  active:   hours.filter(h => h.status === "active").length,
  paused:   hours.filter(h => h.status === "paused").length,
  vacation: hours.filter(h => h.status === "vacation").length,
});