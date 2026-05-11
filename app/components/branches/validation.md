import { z } from "zod";
import { HAITI_DEPARTMENTS, DepartmentCode } from "@/app/data/haitiLocations";
// ─── NOUVEAU : on importe Branch (Cesar) pour étendre ────────────────────
import type { Branch } from "@/types/branche";

export type { DepartmentCode };

// (ne pas redéfinir OpeningHour ici, on importe celui de @/types/branche si besoin)

const DEPARTMENT_CODES = HAITI_DEPARTMENTS.map((d) => d.code) as [
  DepartmentCode,
  ...DepartmentCode[]
];

/* =====================================================
   1️⃣ Schéma BASE — Création / Édition (inchangé)
===================================================== */
export const branchBaseSchema = z.object({
  branch_name:         z.string().min(1, "Le nom de la branche est requis"),
  branch_address:      z.string().min(1, "L'adresse est requise"),
  branch_phone_number: z.string().min(1, "Le numéro de téléphone est requis"),
  branch_email:        z.string().email("Format d'email invalide"),

  department_code: z.enum(DEPARTMENT_CODES, {
    errorMap: () => ({ message: "Sélectionnez un département valide" }),
  }),
  city: z.string().min(1, "La ville est requise"),

  number_of_tellers:         z.number().min(1, "Au moins 1 caissier est requis"),
  number_of_clerks:          z.number().min(1, "Au moins 1 commis est requis"),
  number_of_credit_officers: z.number().min(1, "Au moins 1 agent crédit est requis"),

  opening_date:    z.string().min(1, "La date d'ouverture est requise"),
  number_of_posts: z.number().optional(),

  opening_hour: z
    .string()
    .uuid("L'identifiant de l'horaire doit être un UUID valide")
    .optional(),

  holidays: z
    .array(z.string().uuid("L'identifiant du jour férié doit être un UUID valide"))
    .optional(),

  status: z.enum(["inactive", "active", "archive"]).default("inactive"),
});

/* =====================================================
   2️⃣ Schéma ACTIVATION (inchangé)
===================================================== */
export const branchActivationSchema = branchBaseSchema
  .extend({
    opening_hour: z.string().uuid("L'horaire d'ouverture est requis pour l'activation"),
    holidays: z
      .array(z.string().uuid("L'identifiant du jour férié doit être un UUID valide"))
      .min(1, "Au moins un jour férié est requis pour l'activation"),
  })
  .refine((data) => data.status === "active", {
    message: "Le statut doit être 'active' pour appliquer cette validation",
    path:    ["status"],
  });

/* =====================================================
   3️⃣ Schéma UPDATE — Modification partielle (PATCH)
===================================================== */
export const branchUpdateSchema = branchBaseSchema.partial();

/* =====================================================
   4️⃣ Schéma dynamique
===================================================== */
export const branchSchemaByMode = (mode: "create" | "edit" | "activate") => {
  if (mode === "activate") return branchActivationSchema;
  if (mode === "edit")     return branchUpdateSchema;
  return branchBaseSchema;
};

/* =====================================================
   Types TypeScript
===================================================== */
export type BranchFormData = z.infer<typeof branchBaseSchema>;
export type BranchActivationFormData = z.infer<typeof branchActivationSchema>;
export type BranchUpdateFormData = z.infer<typeof branchUpdateSchema>;

/* =====================================================
   BranchData = Branch HYDRATED pour l'UI
===================================================== */

// ─── Ancienne version (commentée pour référence) ───────────────────────────
// export interface BranchData {
//   id: string;
//   branch_code: string;
//   branch_name: string;
//   ... (28 lignes de duplication)
//   total_staff: number;
//   full_address: string;
// }

// ─── Nouvelle version : on étend Branch (Cesar) avec les champs calculés ──
/**
 * BranchData = Branch après hydratation côté UI.
 *
 * Hérite TOUS les champs de Branch (l'API), et ajoute :
 *   - total_staff   : somme des employés (calculée)
 *   - full_address  : adresse complète formatée (calculée)
 *
 * Créée par hydrateBranch() dans branchesGrid.tsx.
 */
export interface BranchData extends Branch {
  total_staff: number;     // = tellers + clerks + credit_officers
  full_address: string;    // = `${branch_address}, ${city}`
}

// export type BranchFromAPI = Branch;

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;