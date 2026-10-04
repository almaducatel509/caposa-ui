import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// RETRAIT : `pending_assignment`
//   Décision produit : un jour férié existe dès sa création, l'assignation
//   aux branches n'est plus trackée comme un état à part. Le nombre de
//   branches concernées est affiché en frontend via getApplicableBranches().
//
// DETTE TECHNIQUE RÉSOLUE (déjà en place) : `branch_code` surchargé
//   → department_code (regional) / branch_code (branch|autre), deux champs distincts.
// ─────────────────────────────────────────────────────────────────────────────

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

  /** Code département (OUEST, NORD...) — rempli si scope === 'regional' */
  department_code: z.string().optional(),
  /** Code de branche réel — rempli si scope === 'branch' | 'autre' */
  branch_code: z.string().optional(),

  comment: z
    .string()
    .min(10, "Le commentaire doit contenir au moins 10 caractères")
    .max(500, "Le commentaire ne peut pas dépasser 500 caractères")
    .optional(),

  modified_by: z.string().optional(),
});

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

// ================= SCHEMA AVEC VALIDATION CONDITIONNELLE =================
export const holidaySchema = baseHolidaySchema.superRefine((data, ctx) => {
  // scope='regional' exige department_code
  if (data.scope === "regional" && !data.department_code) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le code département est requis quand la portée est 'Régional'",
      path: ["department_code"],
    });
  }

  // scope='branch' ou 'autre' exige branch_code
  if ((data.scope === "branch" || data.scope === "autre") && !data.branch_code) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le code de branche est requis quand la portée est 'Succursale' ou 'Autre'",
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
  /** Rempli si scope === 'regional' */
  department_code?: string;
  /** Rempli si scope === 'branch' | 'autre' */
  branch_code?: string;
  comment?: string;
  modified_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Alias `Holiday = HolidayData`.
 * Permet aux anciens fichiers qui importent `Holiday` de continuer à fonctionner.
 */
export type Holiday = HolidayData;

export interface HolidayFormData {
  id?: string;
  date: string;
  description: string;
  type: HolidayType;
  scope: HolidayScope;
  department_code?: string;
  branch_code?: string;
  comment?: string;
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
