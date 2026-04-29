import { z } from "zod";

// ================= TYPES UNION (source unique) =================
export type HolidayType =
  | "ferie"
  | "local"
  | "interne"
  | "election"
  | "maintenance"
  | "autre";

export type HolidayScope = "national" | "regional" | "branch" | "autre";

// ================= SCHEMA DE BASE =================
export const baseHolidaySchema = z.object({
  id: z.string().optional(),

  date: z
    .string()
    .min(1, "La date est requise")
    .refine((date) => /^\d{4}-\d{2}-\d{2}$/.test(date), {
      message: "La date doit être au format AAAA-MM-JJ",
    }),

  description: z
    .string()
    .min(6, "La description doit contenir au moins 6 caractères")
    .max(100, "La description ne peut pas dépasser 100 caractères"),

  type: z
    .enum(["ferie", "local", "interne", "election", "maintenance", "autre"])
    .default("ferie"),

  scope: z
    .enum(["national", "regional", "branch", "autre"])
    .default("national"),

  branch_code: z.string().optional(),

  comment: z
    .string()
    .min(10, "Le commentaire doit contenir au moins 10 caractères")
    .max(500, "Le commentaire ne peut pas dépasser 500 caractères")
    .optional(),

  modified_by: z.string().optional(),

  /**
   * 🎯 true tant que le férié n'a pas été assigné via AssignBranchesModal.
   * Un brouillon ne bloque AUCUN caissier.
   */
  pending_assignment: z.boolean().default(true),
});

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

// ================= SCHEMA AVEC VALIDATION CONDITIONNELLE =================
export const holidaySchema = baseHolidaySchema.superRefine((data, ctx) => {
  if (
    !data.pending_assignment &&
    data.scope === "branch" &&
    !data.branch_code
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le code de branche est requis quand la portée est 'Succursale'",
      path: ["branch_code"],
    });
  }
});

export const holidayCreateSchema = baseHolidaySchema.omit({ id: true });
export const holidayUpdateSchema = baseHolidaySchema.required({ id: true });

// ================= INTERFACES =================

/** Type principal pour un jour férié — utilisé partout dans l'app */
export interface HolidayData {
  id: string;
  date: string;
  description: string;
  type: HolidayType;
  scope: HolidayScope;
  branch_code?: string;
  comment?: string;
  modified_by?: string;
  created_at?: string;
  updated_at?: string;
  pending_assignment: boolean;
}

/**
 * Alias `Holiday = HolidayData`.
 * Permet aux anciens fichiers qui importent `Holiday` de continuer à fonctionner
 * tant que tout n'a pas été migré.
 */
export type Holiday = HolidayData;

export interface HolidayFormData {
  id?: string;
  date: string;
  description: string;
  type: HolidayType;
  scope: HolidayScope;
  branch_code?: string;
  comment?: string;
  pending_assignment?: boolean;
}

// ================= LABELS =================

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  ferie: "Férié",
  local: "Local",
  interne: "Interne",
  election: "Élection",
  maintenance: "Maintenance",
  autre: "Autre",
};

export const HOLIDAY_SCOPE_LABELS: Record<HolidayScope, string> = {
  national: "National",
  regional: "Régional",
  branch: "Succursale",
  autre: "Autre",
};

// ================= HELPERS =================

export const isPendingAssignment = (
  holiday: HolidayData | HolidayFormData
): boolean => holiday.pending_assignment === true;

export const isBranchCodeRequired = (
  scope: string,
  pendingAssignment: boolean
): boolean => {
  if (pendingAssignment) return false;
  return scope === "branch";
};

export const isCommentRequired = (
  originalHoliday: HolidayData,
  updatedHoliday: Partial<HolidayData>
): boolean => {
  if (originalHoliday.pending_assignment) return false;
  return (
    (updatedHoliday.type !== undefined &&
      updatedHoliday.type !== originalHoliday.type) ||
    (updatedHoliday.scope !== undefined &&
      updatedHoliday.scope !== originalHoliday.scope) ||
    (updatedHoliday.date !== undefined &&
      updatedHoliday.date !== originalHoliday.date)
  );
};