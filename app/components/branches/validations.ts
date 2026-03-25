import { z } from "zod";
import { HAITI_DEPARTMENTS, DepartmentCode } from "@/app/data/haitiLocations";

/* ─── Ré-export pour compatibilité des imports existants ─────────────────── */
export type { DepartmentCode };

/* ─── Interfaces API ─────────────────────────────────────────────────────── */

export interface OpeningHour {
  id:       string;
  schedule: string;
}

export interface Holiday {
  id:          string;
  date:        string;
  description: string;
}

/* ─── Enum Zod généré depuis haitiLocations.ts (source unique) ───────────── */

const DEPARTMENT_CODES = HAITI_DEPARTMENTS.map((d) => d.code) as [
  DepartmentCode,
  ...DepartmentCode[]
];

/* =====================================================
   1️⃣ Schéma BASE — Création / Édition (branche inactive)
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

  /*
   * opening_hour et holidays sont OPTIONNELS à la création.
   * Ils deviennent obligatoires uniquement dans branchActivationSchema.
   * Flux : créer d'abord → assigner horaire → activer.
   */
  opening_hour: z
    .string()
    .uuid("L'identifiant de l'horaire doit être un UUID valide")
    .optional(),

  holidays: z
    .array(z.string().uuid("L'identifiant du jour férié doit être un UUID valide"))
    .optional(),

  /*
   * status persisté en base : "inactive" | "active" uniquement.
   * L'état intermédiaire "needs_activation" (horaire assigné, pas encore activée)
   * est calculé côté frontend via getEffectiveStatus() dans BranchTable/BranchCard.
   * Il n'est jamais envoyé à l'API.
   */
  status: z.enum(["inactive", "active"]).default("inactive"),
});

/* =====================================================
   2️⃣ Schéma ACTIVATION — requis pour activer la branche
===================================================== */

export const branchActivationSchema = branchBaseSchema
  .extend({
    opening_hour: z
      .string()
      .uuid("L'horaire d'ouverture est requis pour l'activation"),
    holidays: z
      .array(z.string().uuid("L'identifiant du jour férié doit être un UUID valide"))
      .min(1, "Au moins un jour férié est requis pour l'activation"),
  })
  .refine((data) => data.status === "active", {
    message: "Le statut doit être 'active' pour appliquer cette validation",
    path:    ["status"],
  });

/* =====================================================
   3️⃣ Schéma dynamique (utilitaire)
===================================================== */

export const branchSchemaByMode = (mode: "create" | "activate") =>
  mode === "activate" ? branchActivationSchema : branchBaseSchema;

/* =====================================================
   Types TypeScript
===================================================== */

/** Données du formulaire (création / édition) */
export type BranchFormData = z.infer<typeof branchBaseSchema>;

/** Données du formulaire pour l'activation */
export type BranchActivationFormData = z.infer<typeof branchActivationSchema>;

/**
 * Données complètes renvoyées par l'API.
 *
 * opening_hour est optionnel : une branche peut exister sans horaire assigné.
 * Quand absent → état UI "missing_schedule".
 * Quand présent + status inactive → état UI "needs_activation".
 * Quand présent + status active → état UI "active".
 */
export interface BranchData {
  id:          string;
  branch_code: string;

  branch_name:         string;
  branch_address:      string;
  branch_phone_number: string;
  branch_email:        string;

  /** Persisté en base : "inactive" | "active" */
  status: "active" | "inactive";

  department_code: DepartmentCode;
  city:            string;

  number_of_posts:           number;
  number_of_tellers:         number;
  number_of_clerks:          number;
  number_of_credit_officers: number;

  opening_date: string;

  /** Optionnel — absent si créée sans horaire */
  opening_hour?: string;
  holidays?:     string[];

  /** Données peuplées par l'API (populate) */
  opening_hour_details?: OpeningHour;
  holidays_details?:     Holiday[];

  created_at?: string;
  updated_at?: string;
}

export type BranchFromAPI = BranchData & { id: string };

/** Gestion des messages d'erreur de formulaire */
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;