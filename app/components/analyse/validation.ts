export interface AnalyseFinanciere {
  id_analyse: string;
  id_pret: string;

  revenuMensuel: number;
  depensesMensuelles: number;

  capaciteRemboursement: number; // revenu - dépenses
  ratioEndettement: number; // mensualité / revenu

  mensualiteEstimee: number; // calculée selon montant, taux, durée
}

import { z } from "zod";

export const financialAnalysisSchema = z.object({
  id_analyse: z.string().min(1),
  id_pret: z.string().min(1),

  revenuMensuel: z.number().min(0, "Le revenu doit être positif."),
  depensesMensuelles: z.number().min(0, "Les dépenses doivent être positives."),

  capaciteRemboursement: z.number().min(0),
  ratioEndettement: z.number().min(0).max(1),

  mensualiteEstimee: z.number().min(0),
});

export type AnalyseFinanciereForm = z.infer<typeof financialAnalysisSchema>;

export function calculerMensualite(
  montant: number,
  tauxAnnuel: number,
  dureeMois: number
): number {
  const tauxMensuel = tauxAnnuel / 100 / 12;

  if (tauxMensuel === 0) {
    return montant / dureeMois;
  }

  const mensualite =
    montant *
    (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) /
    (Math.pow(1 + tauxMensuel, dureeMois) - 1);

  return Number(mensualite.toFixed(2));
}

export function validerAnalyseFinanciere(data: any) {
  const result = financialAnalysisSchema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[issue.path[0]] = issue.message;
    }
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}
