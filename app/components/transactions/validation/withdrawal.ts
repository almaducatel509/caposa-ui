import { z } from "zod";

/** Modes de retrait */
export const WithdrawalMethod = z.enum(["cash", "check", "transfer"]);
export type WithdrawalMethod = z.infer<typeof WithdrawalMethod>;

export const TransferType = z.enum(["internal", "interac", "wire"]);
export type TransferType = z.infer<typeof TransferType>;

export const withdrawalSchema = z
  .object({
    // Identifiant du compte débité
    idCompte: z.string().min(1, "Compte requis"),

    // Métadonnées transaction
    typeTransaction: z.literal("WITHDRAWAL"),
    codeAutorisation: z.string().min(1, "Code d'autorisation requis"),

    // Montant (accepte string → number)
    montantTransaction: z.coerce.number().gt(0, "Montant doit être > 0"),

    // Méthode
    method: WithdrawalMethod,

    // Raison libre (optionnelle)
    reason: z.string().optional().nullable(),

    // --- Retrait par CHÈQUE ---
    payeeName: z.string().optional().nullable(), // bénéficiaire
    issueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu AAAA-MM-JJ")
      .optional()
      .nullable(),
    memo: z.string().optional().nullable(),

    // --- Retrait par TRANSFERT ---
    transferType: TransferType.optional(), // internal / interac / wire
    toAccountId: z.string().optional().nullable(), // requis si internal
    externalRecipient: z.string().optional().nullable(), // requis si interac/wire
    reference: z.string().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    // Règles pour CHECK
    if (val.method === "check") {
      if (!val.payeeName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bénéficiaire requis", path: ["payeeName"] });
      }
      if (!val.issueDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date d'émission requise (AAAA-MM-JJ)", path: ["issueDate"] });
      }
    }

    // Règles pour TRANSFER
    if (val.method === "transfer") {
      if (!val.transferType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type de transfert requis", path: ["transferType"] });
      } else if (val.transferType === "internal") {
        if (!val.toAccountId) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compte destination requis (transfert interne)", path: ["toAccountId"] });
        }
        if (val.toAccountId && val.toAccountId === val.idCompte) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compte source et destination doivent être différents", path: ["toAccountId"] });
        }
      } else {
        // interac / wire
        if (!val.externalRecipient) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destinataire externe requis", path: ["externalRecipient"] });
        }
      }
    }
  });

export type WithdrawalFormValidated = z.infer<typeof withdrawalSchema>;
