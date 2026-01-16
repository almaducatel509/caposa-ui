import { z } from "zod";
// 🧾 Types de base
export const transferTypes = ["interne", "externe"] as const;
export type TransferType = typeof transferTypes[number];

export type TransferFormData = Partial<TransferData>;
export type TransferFormErrors = Partial<Record<keyof TransferFormData, string>>;

export interface TransferData {
  id_transfer: string;
  id_member: string; // celui qui initie
  account_source: string;
  account_destination: string;
  typeTransfert: TransferType;
  montant: number;
  dateTransfert: string;
  description?: string;
  reference?: string;
}

export const transferSchema = z.object({
  id_member: z.string().min(1, "Le membre est requis."),
  account_source: z.string().min(1, "Le compte source est requis."),
  account_destination: z
    .string()
    .min(1, "Le compte destination est requis.")
    .refine((val, ctx) => val !== ctx.parent.account_source, {
      message: "Le compte source et destination doivent être différents.",
    }),
  typeTransfert: z.enum(transferTypes, {
    errorMap: () => ({ message: "Le type de transfert est requis." }),
  }),
  montant: z
    .number({ invalid_type_error: "Montant invalide." })
    .min(1, "Le montant doit être supérieur à 0."),
  dateTransfert: z.string().optional(),
  description: z.string().max(500).optional(),
  reference: z.string().optional(),
});

export function validateTransferWithZod(data: any) {
  const result = transferSchema.safeParse(data);
  if (!result.success) {
    const errors: TransferFormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof TransferFormData;
      errors[key] = issue.message;
    }
    return { isValid: false, errors };
  }
  return { isValid: true, errors: {} };
}
