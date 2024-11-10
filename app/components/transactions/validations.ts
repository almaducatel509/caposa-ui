// validations.ts
import { z } from 'zod';

// Schéma de validation pour Transaction
export const transactionSchema = z.object({
  idTransaction: z.string().min(1, "ID Transaction est requis"),
  idCompte: z.string().min(1, "ID Compte est requis"),
  idEmploye: z.string().min(1, "ID Employé est requis"),
  noCompte: z.string().min(1, "Numéro de Compte est requis"),
  idCredit: z.string().nullable(),
  typeTransaction: z.string().min(1, "Type de Transaction est requis"),
  codeAutorisation: z.string().min(1, "Code d'Autorisation est requis"),
  montantTransaction: z.number().min(0, "Montant doit être positif"),
});

// TypeScript type pour Transaction
export type Transaction = z.infer<typeof transactionSchema>;
