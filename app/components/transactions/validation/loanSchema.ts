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

export const loanPurposes = [
  "achat_marchandises",
  "fonds_roulement",
  "construction",
  "reparation_maison",
  "plantation",
  "elevage",
  "scolarite",
  "urgence",
  "equipement",
] as const;

export type LoanPurpose = typeof loanPurposes[number];  

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
export interface LoanData {
  // Identity
  id_loan: string;
  id_member: string;
  member_name: string;
  account_number?: string;

  // Loan conditions
  loan_type: LoanType;
  purpose: LoanPurpose;
  collateral: CollateralType;
  amount: number;
  duration_months: number;
  interest_rate: number;
  repayment_frequency: RepaymentFrequency;
  fees?: number;
  comment?: string;
  notes?: string;

  // State
  status: LoanStatus;
  rejection_reason?: string;
  cancellation_reason?: string;

  // Dates
  created_at: string;          // ← OBLIGATOIRE : set on insert by Django (auto_now_add)
  approved_at?: string;        // set when supervisor approves
  disbursed_at?: string;       // set when caissier disburses
  start_date?: string;         // set on disbursement (often = disbursed_at)
  end_date?: string;           // computed from start_date + duration_months
  closed_at?: string;          // set on close (rembourse/rejete/annule)
  next_payment_date?: string;  // computed by backend for active loans

  // Actors
  processed_by?: string;
  validated_by?: string;
  assigned_to?: string;
  loan_officer?: string;
  caisse_id?: string;
  caisse_numero?: string;
  session_id?: string;

  // Backend-computed (never stored)
  monthly_payment: number;
  total_amount: number;
  payments_made: number;
  total_paid?: number;
  remaining_balance: number;
  late_days: number;
  is_late?: boolean;
  progress_pct?: number;
}

// Interface utilisée par le formulaire (certaines valeurs optionnelles)
export type LoanFormData = Partial<LoanData>;

// 🧰 Erreurs de validation génériques
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type LoanFormErrors = FormErrors<LoanFormData>;
export const loanSchema = z.object({
  id_member: z.string().min(1, "Le membre est requis."),

  loan_type: z.enum(loanTypes, {
    errorMap: () => ({ message: "Le type de prêt est requis." }),
  }),

  amount: z
    .number({ required_error: "Le montant est requis." })
    .min(100, "Le montant minimum est de 100."),

  duration_months: z
    .number({ required_error: "La durée est requise." })
    .min(1, "La durée minimale est de 1 mois.")
    .max(360, "La durée maximale est de 360 mois."),

  interest_rate: z
    .number({ required_error: "Le taux d'intérêt est requis." })
    .min(0, "Le taux ne peut pas être négatif.")
    .max(100, "Le taux ne peut pas dépasser 100%."),

  purpose: z.enum(loanPurposes, {
    errorMap: () => ({ message: "Le but du prêt est requis." }),
  }),

  collateral: z.enum(collateralTypes, {
    errorMap: () => ({ message: "Le type de garantie est requis." }),
  }),

  repayment_frequency: z.enum(repaymentFrequencies, {
    errorMap: () => ({ message: "La fréquence de remboursement est requise." }),
  }),

  status: z.enum(loanStatuses).optional(),

  created_at: z.string().min(1, "La date de demande est requise."),

  start_date: z.string().optional(),

  end_date: z.string().optional(),

  comment: z
    .string()
    .max(500, "Le commentaire ne peut pas dépasser 500 caractères.")
    .optional(),

  fees: z
    .number({ required_error: "Les frais sont requis." })
    .optional(),
});
// // ✅ Validation Zod principale
// export const loanSchema = z.object({
//   id_member: z.string().min(1, "Le membre est requis."),

//   typePret: z.enum(loanTypes, {
//     errorMap: () => ({ message: "Le type de prêt est requis." }),
//   }),

//   montantDemande: z
//     .number({ invalid_type_error: "Montant invalide." })
//     .min(100, "Le montant minimum est de 100."),

//   dureeMois: z
//     .number({ invalid_type_error: "Durée invalide." })
//     .min(1)
//     .max(360, "La durée ne peut pas dépasser 360 mois."),

//   tauxInteret: z
//     .number({ invalid_type_error: "Taux invalide." })
//     .min(0)
//     .max(100),

//   // Champs ajoutés
//   but: z.enum(loanPurposes, {
//     errorMap: () => ({ message: "Le but du prêt est requis." }),
//   }),

//   garantie: z.enum(collateralTypes, {
//     errorMap: () => ({ message: "La garantie est requise." }),
//   }),

//   frequenceRemboursement: z.enum(repaymentFrequencies, {
//     errorMap: () => ({ message: "La fréquence de remboursement est requise." }),
//   }),

//   statut: z.enum(loanStatuses).optional(),
//   dateDemande: z.string().min(1, "La date de demande est requise."),
//   dateDebut: z.string().optional(),
//   dateFin: z.string().optional(),
//   commentaire: z.string().max(500).optional(),
//   frais: z.number().optional(),
// });

// Fonction utilitaire de validation sécurisée
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
