import { z } from "zod";

/** Sous-types simples pour une coop */
export const DepositSubtype = z.enum(["cash", "check", "transfer", "other"]);
export type DepositSubtype = z.infer<typeof DepositSubtype>;

export const depositSchema = z
  .object({
    // Uniquement ce que le front contrôle
    idCompte: z.string().min(1, "Compte requis"),

    typeTransaction: z.literal("DEPOSIT"),
    codeAutorisation: z.string().min(1, "Code d'autorisation requis"),

    // Montant: accepte string -> converti number
    montantTransaction: z.coerce.number().gt(0, "Montant doit être > 0"),

    depositSubtype: DepositSubtype,
    source: z.string().min(1, "Source du dépôt requise"),
    description: z.string().optional().nullable(),

    // Virement
    transferReference: z.string().optional().nullable(),
    senderName: z.string().optional().nullable(),

    // Estimations côté UI (le serveur doit revalider)
    requiresVerification: z.boolean().optional(),
    holdPeriod: z.coerce.number().min(0).optional(),
    availableImmediately: z.coerce.number().min(0).optional(),
  })
  export const DepositStatus = z.enum(["completed", "pending", "processing", "failed"]);
export type DepositStatus = z.infer<typeof DepositStatus>;

export type DepositFormValidated = z.infer<typeof depositSchema>;
