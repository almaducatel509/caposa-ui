import { z } from "zod";

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
});

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

// ================= SCHEMA AVEC VALIDATION CONDITIONNELLE =================
export const holidaySchema = baseHolidaySchema.superRefine((data, ctx) => {
  if (data.scope === "branch" && !data.branch_code) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le code de branche est requis quand la portée est 'Succursale'",
      path: ["branch_code"],
    });
  }
});

// ================= SCHEMAS POUR CRÉATION/ÉDITION =================
export const holidayCreateSchema = baseHolidaySchema.omit({ id: true });
export const holidayUpdateSchema = baseHolidaySchema.required({ id: true });


export interface HolidayData {
  id: string;
  date: string;
  description: string;
  type: "ferie" | "local" | "interne" | "election" | "maintenance" | "autre";
  scope: "national" | "regional" | "branch" | "autre";
  branch_code?: string;
  comment?: string;
  modified_by?: string;
  created_at?: string;
  updated_at?: string;
}
// Form data interface (what the form uses)
export interface HolidayFormData {
  id?: string;               // facultatif en création
  date: string;              // requis
  description: string;       // requis
  type: "ferie" | "local" | "interne" | "election" | "maintenance" | "autre";
  scope: "national" | "regional" | "branch" | "autre";
  branch_code?: string;      // requis seulement si scope = "branch"
  comment?: string;          // requis seulement si modification sensible
}

// Vérifie si branch_code est requis
export const isBranchCodeRequired = (scope: string): boolean => {
  return scope === "branch";
};

// Vérifie si un commentaire est requis (modification sensible)
export const isCommentRequired = (
  originalHoliday: HolidayData,
  updatedHoliday: Partial<HolidayData>
): boolean => {
  return (
    (updatedHoliday.type !== undefined &&
      updatedHoliday.type !== originalHoliday.type) ||
    (updatedHoliday.scope !== undefined &&
      updatedHoliday.scope !== originalHoliday.scope) ||
    (updatedHoliday.date !== undefined &&
      updatedHoliday.date !== originalHoliday.date)
  );
};

// 🎯 Résumé ultra‑compact
// ✔️ Ce que tu peux faire :
// Valider les données

// Structurer les types

// Gérer les constantes

// Appliquer des règles métier simples

// Construire des formulaires robustes

// Gérer les erreurs UI

// Séparer proprement ton architecture

// ❌ Ce que tu ne peux pas faire :
// Validation métier avancée (DB, permissions, conflits)

// Audit automatique

// Logique API

// Logique d’affichage

// Règles dépendantes d’autres entités