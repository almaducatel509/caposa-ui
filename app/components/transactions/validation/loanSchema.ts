"use client";
import { z } from "zod";

// 🧾 Types de données de base
export const loanTypes = [
  "commerce",
  "logement",
  "agriculture",
  "elevage",
  "equipement",
  "scolaire",
  "personnel",
] as const;
export type LoanType = typeof loanTypes[number];

export const collateralTypes = [
  "epargne_bloquee",
  "caution_solidaire",
  "betail",
  "terrain",
  "materiel",
  "aucune",
] as const;
export type CollateralType = typeof collateralTypes[number];

export const repaymentFrequencies = [
  "mensuel",
  "hebdomadaire",
  "saisonnier",
] as const;
export type RepaymentFrequency = typeof repaymentFrequencies[number];

export const loanStatuses = [
  "en_attente",
  "approuve",
  "rejete",
  "decaisse",
  "rembourse",
  "annule",
] as const;
export type LoanStatus = typeof loanStatuses[number];

// ─── LoanData (objet complet retourné par le backend) ───────────────────────
export interface LoanData {
  // Identity
  id_loan: string;
  id_member: string;
  member_name: string;
  account_number?: string;
  phone_number?: string;

  // Loan conditions
  loan_type: LoanType;
  collateral: CollateralType;
  amount: number;
  duration_months: number;
  interest_rate: number;
  repayment_frequency: RepaymentFrequency;
  comment?: string;
  notes?: string;

  // State (gérés par Django)
  status: LoanStatus;
  rejection_reason?: string;
  cancellation_reason?: string;

  // Dates (gérées par Django)
  created_at: string;
  approved_at?: string;
  disbursed_at?: string;
  start_date?: string;
  end_date?: string;
  closed_at?: string;
  next_payment_date?: string;

  // Actors
  processed_by?: string;
  validated_by?: string;
  assigned_to?: string;
  loan_officer?: string;
  caisse_id?: string;
  caisse_numero?: string;
  session_id?: string;

  // Backend-computed
  monthly_payment: number;
  total_amount: number;
  payments_made: number;
  total_paid?: number;
  remaining_balance: number;
  late_days: number;
  is_late?: boolean;
  progress_pct?: number;
}

// Type utilisé par le formulaire
export type LoanFormData = Partial<LoanData>;

// Erreurs de validation
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type LoanFormErrors = FormErrors<LoanFormData>;

// ─── Schéma Zod minimal ─────────────────────────────────────────────────────
export const loanSchema = z.object({
  id_member: z.string().min(1, "Le membre est requis."),

  loan_type: z.enum(loanTypes, {
    errorMap: () => ({ message: "Le type de prêt est requis." }),
  }),

  amount: z
    .number({ required_error: "Le montant est requis." })
    .min(100, "Le montant minimum est de 100 HTG."),

  duration_months: z
    .number({ required_error: "La durée est requise." })
    .min(1, "La durée minimale est de 1 mois.")
    .max(360, "La durée maximale est de 360 mois."),

  interest_rate: z
    .number({ required_error: "Le taux d'intérêt est requis." })
    .min(0, "Le taux ne peut pas être négatif.")
    .max(100, "Le taux ne peut pas dépasser 100%."),

  collateral: z.enum(collateralTypes, {
    errorMap: () => ({ message: "La garantie est requise." }),
  }),

  repayment_frequency: z.enum(repaymentFrequencies, {
    errorMap: () => ({ message: "La fréquence de remboursement est requise." }),
  }),

  comment: z
    .string()
    .max(500, "Le commentaire ne peut pas dépasser 500 caractères.")
    .optional(),
});

// Validation Zod (seule fonction nécessaire — fini validateLoanForm)
export function validateLoanWithZod(data: any) {
  const result = loanSchema.safeParse(data);
  if (!result.success) {
    const errors: LoanFormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof LoanFormData;
      errors[key] = issue.message;
    }
    return { isValid: false, errors };
  }
  return { isValid: true, errors: {} };
}