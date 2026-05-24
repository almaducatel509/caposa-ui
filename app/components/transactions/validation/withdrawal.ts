import { z } from "zod";

export const withdrawalSchema = z.object({
  // Identifiant du compte débité
  idCompte: z.string().min(1, "Compte requis"),

  // Métadonnées transaction
  typeTransaction: z.literal("WITHDRAWAL"),
  codeAutorisation: z.string().min(1, "Code d'autorisation requis"),

  // Montant (accepte string → number)
  montantTransaction: z.coerce.number().gt(0, "Montant doit être > 0"),

  // Raison libre (optionnelle)
  reason: z.string().optional().nullable(),
});

export type WithdrawalFormValidated = z.infer<typeof withdrawalSchema>;