"use client";
import { z } from "zod";

// 🧾 Types de données de base
export const loanTypes = ["personnel", "immobilier", "auto", "autre"] as const;
export type LoanType = typeof loanTypes[number];

export const loanStatuses = [
  "pending",
  "approved",
  "rejected",
  "disbursed",
  "paid",
  "cancelled",
] as const;
export type LoanStatus = typeof loanStatuses[number];

// 🧱 Interface principale du prêt
export interface LoanData {
  id_loan: string;
  id_member: string;
  typePret: LoanType;
  montantDemande: number;
  dureeMois: number;
  tauxInteret: number;
  statut: LoanStatus;
  dateDemande: string;
  dateDebut?: string;
  dateFin?: string;
  commentaire?: string;
  frais?: number;
}

// Interface utilisée par le formulaire (certaines valeurs optionnelles)
export type LoanFormData = Partial<LoanData>;

// 🧰 Erreurs de validation génériques
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type LoanFormErrors = FormErrors<LoanFormData>;

// ✅ Validation Zod principale
export const loanSchema = z.object({
  id_member: z.string().min(1, "Le membre est requis."),
  typePret: z.enum(loanTypes, {
    errorMap: () => ({ message: "Le type de prêt est requis." }),
  }),
  montantDemande: z
    .number({ invalid_type_error: "Montant invalide." })
    .min(100, "Le montant minimum est de 100."),
  dureeMois: z
    .number({ invalid_type_error: "Durée invalide." })
    .min(1)
    .max(360, "La durée ne peut pas dépasser 360 mois."),
  tauxInteret: z
    .number({ invalid_type_error: "Taux invalide." })
    .min(0)
    .max(100),
  statut: z.enum(loanStatuses).optional(),
  dateDemande: z.string().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  commentaire: z.string().max(500).optional(),
  frais: z.number().optional(),
});

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
