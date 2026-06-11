import { z } from "zod";
import { HAITI_DEPARTMENTS, DepartmentCode } from "@/app/data/haitiLocations";
import type { Branch } from "@/types/branche";

export type { DepartmentCode };

const DEPARTMENT_CODES = HAITI_DEPARTMENTS.map((d) => d.code) as [
  DepartmentCode,
  ...DepartmentCode[]
];

// ─── Schémas Zod ────────────────────────────────────────────────────────
export const branchBaseSchema = z.object({
  branch_name:         z.string().min(1, "Le nom de la branche est requis"),
  branch_address:      z.string().min(1, "L'adresse est requise"),
  branch_phone_number: z.string().min(1, "Le numéro de téléphone est requis"),
  branch_email:        z.string().email("Format d'email invalide"),
  department_code:     z.enum(DEPARTMENT_CODES, {
    errorMap: () => ({ message: "Sélectionnez un département valide" }),
  }),
  city: z.string().min(1, "La ville est requise"),
  opening_date:    z.string().min(1, "La date d'ouverture est requise"),
  opening_hour:    z.string().uuid("L'identifiant de l'horaire doit être un UUID valide").optional(),
  holidays:        z.array(z.string().uuid("L'identifiant du jour férié doit être un UUID valide")).optional(),
  status:          z.enum(["inactive", "active", "archive"]).default("inactive"),
  // Dans branchBaseSchema, ajouter :
  number_of_posts:           z.number().int().min(0).default(0),
  number_of_tellers:         z.number().int().min(0).default(0),
  number_of_clerks:          z.number().int().min(0).default(0),
  number_of_credit_officers: z.number().int().min(0).default(0),
});

export const branchActivationSchema = branchBaseSchema
  .extend({
    opening_hour: z.string().uuid("L'horaire d'ouverture est requis pour l'activation"),
    holidays: z.array(z.string().uuid("L'identifiant du jour férié doit être un UUID valide"))
      .min(1, "Au moins un jour férié est requis pour l'activation"),
  })
  .refine((data) => data.status === "active", {
    message: "Le statut doit être 'active' pour appliquer cette validation",
    path: ["status"],
  });

export const branchUpdateSchema = branchBaseSchema.partial();

export const branchSchemaByMode = (mode: "create" | "edit" | "activate") => {
  if (mode === "activate") return branchActivationSchema;
  if (mode === "edit")     return branchUpdateSchema;
  return branchBaseSchema;
};

// ─── Types ──────────────────────────────────────────────────────────────
export type BranchFormData            = z.infer<typeof branchBaseSchema>;
export type BranchActivationFormData  = z.infer<typeof branchActivationSchema>;
export type BranchUpdateFormData      = z.infer<typeof branchUpdateSchema>;

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

/**
 * BranchData = ce que les composants UI manipulent.
 * = Branch (API brute) + champs calculés côté front.
 */
export interface BranchData extends Branch {
  total_staff: number;     // tellers + clerks + credit_officers
  full_address: string;    // `${branch_address}, ${city}`
}