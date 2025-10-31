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

    // Chèque
    checkNumber: z.string().optional().nullable(),
    checkBank: z.string().optional().nullable(),
    checkDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu AAAA-MM-JJ")
      .optional()
      .nullable(),

    // Virement
    transferReference: z.string().optional().nullable(),
    senderName: z.string().optional().nullable(),

    // Estimations côté UI (le serveur doit revalider)
    requiresVerification: z.boolean().optional(),
    holdPeriod: z.coerce.number().min(0).optional(),
    availableImmediately: z.coerce.number().min(0).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.depositSubtype === "check") {
      if (!val.checkNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Numéro de chèque requis", path: ["checkNumber"] });
      if (!val.checkBank)   ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Banque émettrice requise", path: ["checkBank"] });
      if (!val.checkDate)   ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date du chèque requise (AAAA-MM-JJ)", path: ["checkDate"] });
    }
    if (val.depositSubtype === "transfer") {
      if (!val.transferReference) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Référence du virement requise", path: ["transferReference"] });
      if (!val.senderName)        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nom de l'expéditeur requis", path: ["senderName"] });
    }
    if (val.depositSubtype === "other") {
      const hasDetail = (val.source?.trim().length ?? 0) > 0 || (val.description?.trim().length ?? 0) > 0;
      if (!hasDetail) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Précise la source ou ajoute une description pour 'Autre'", path: ["source"] });
    }
  });

export type DepositFormValidated = z.infer<typeof depositSchema>;
