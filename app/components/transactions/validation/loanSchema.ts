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
  id_loan: string;
  id_member: string;
  typePret: LoanType;
  montantDemande: number; //montantSolicite
  dureeMois: number;
  tauxInteret: number;
  statut: LoanStatus;
  dateDemande: string;
  dateDebut?: string;
  dateFin?: string;

  // Ajouts réalistes
  but: LoanPurpose;
  garantie: CollateralType;
  frequenceRemboursement: RepaymentFrequency;
  //analyseFinanciere: FinancialAnalysis;

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

  // Champs ajoutés
  but: z.enum(loanPurposes, {
    errorMap: () => ({ message: "Le but du prêt est requis." }),
  }),

  garantie: z.enum(collateralTypes, {
    errorMap: () => ({ message: "La garantie est requise." }),
  }),

  frequenceRemboursement: z.enum(repaymentFrequencies, {
    errorMap: () => ({ message: "La fréquence de remboursement est requise." }),
  }),

  statut: z.enum(loanStatuses).optional(),
  dateDemande: z.string().min(1, "La date de demande est requise."),
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
