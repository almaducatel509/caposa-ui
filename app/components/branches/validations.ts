import { z } from "zod";
import { HAITI_DEPARTMENTS, DepartmentCode } from "@/app/data/haitiLocations";
import type { Branch } from "@/types/branche";

export type { DepartmentCode };

const DEPARTMENT_CODES = HAITI_DEPARTMENTS.map((d) => d.code) as [
  DepartmentCode,
  ...DepartmentCode[]
];

// ─── Schémas Zod ────────────────────────────────────────────────────────────

export const branchBaseSchema = z.object({
  branch_name:         z.string().min(1, "Le nom de la branche est requis"),
  branch_address:      z.string().min(1, "L'adresse est requise"),
  branch_phone_number: z.string().min(1, "Le numéro de téléphone est requis"),
  branch_email:        z.string().email("Format d'email invalide"),
  department_code:     z.enum(DEPARTMENT_CODES, {
    errorMap: () => ({ message: "Sélectionnez un département valide" }),
  }),
  city:         z.string().min(1, "La ville est requise"),
  opening_date: z.string().min(1, "La date d'ouverture est requise"),

  // Optionnel à la création — le frontend envoie l'UUID si "horaire standard"
  // est sélectionné, null/undefined si l'utilisateur choisit "Personnaliser".
  // Le backend détermine le status final en fonction de la présence de ce champ.
  opening_hour: z
    .string()
    .uuid("L'identifiant de l'horaire doit être un UUID valide")
    .optional()
    .nullable(),

  // SUPPRIMÉ : holidays[]
  // Les jours fériés ne sont PLUS envoyés à la création.
  // Le backend les assigne automatiquement via signal post_save :
  //   - National  → toutes les branches actives
  //   - Régional  → branches de la même région
  //   - Local     → assignation manuelle uniquement
  // Voir : CONTRAT_BACKEND_branch_creation.md

  status: z.enum(["inactive", "active", "archive"]).default("inactive"),

  number_of_posts:           z.number().int().min(0).default(0),
  number_of_tellers:         z.number().int().min(0).default(0),
  number_of_clerks:          z.number().int().min(0).default(0),
  number_of_credit_officers: z.number().int().min(0).default(0),
});

// ─── Schema edit (tous les champs optionnels) ────────────────────────────────

export const branchUpdateSchema = branchBaseSchema.partial();

// ─── Schema activation manuelle (unitaire, pas bulk) ────────────────────────
// Utilisé si on veut valider côté client qu'une branche a bien un horaire
// avant de l'envoyer en "active". Le bulk activate a sa propre logique dans
// BranchBulkActionModal.

export const branchActivationSchema = branchBaseSchema
  .extend({
    opening_hour: z
      .string()
      .uuid("L'horaire d'ouverture est requis pour l'activation"),
  })
  .refine((data) => data.status === "active", {
    message: "Le statut doit être 'active' pour appliquer cette validation",
    path: ["status"],
  });

// ─── Sélecteur de schéma par mode ───────────────────────────────────────────

export const branchSchemaByMode = (mode: "create" | "edit" | "activate") => {
  if (mode === "activate") return branchActivationSchema;
  if (mode === "edit")     return branchUpdateSchema;
  return branchBaseSchema;
};

// ─── Types exportés ─────────────────────────────────────────────────────────

export type BranchFormData           = z.infer<typeof branchBaseSchema>;
export type BranchActivationFormData = z.infer<typeof branchActivationSchema>;
export type BranchUpdateFormData     = z.infer<typeof branchUpdateSchema>;

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

/**
 * BranchData = ce que les composants UI manipulent.
 * = Branch (API brute) + champs calculés côté front.
 */
export interface BranchData extends Branch {
  total_staff:  number;  // tellers + clerks + credit_officers
  full_address: string;  // `${branch_address}, ${city}`
}