import { z } from "zod";

// ─── Types de base ──────────────────────────────────────────────

export const transferTypes = [
  "internal", "supplier", "loan_payment",  // valeurs historiques
  "interne", "externe",                     // nouvelles valeurs
] as const;
export type TransferType = typeof transferTypes[number];
export const transferStatuses = [
  "approuve",     // finalisé
  "en_attente",
  "en_cours",
  "echoue",
  "annule",
] as const;

export type TransferStatus = typeof transferStatuses[number];

export type TransferFormData = Partial<TransferData>;
export type TransferFormErrors = Partial<Record<keyof TransferFormData, string>>;

export interface TransferData {
  id:         number;
  id_member:           string;           // celui qui initie
  member_name?:        string;
  account_source:      string;
  account_destination: string;
  destination_name?:   string;           // bénéficiaire (transfert externe)
  typeTransfert:       TransferType;
  montant:             number;
  reference?:          string;
  description?:        string;
  status:             TransferStatus;
  dateTransfert?:      string;
  created_at?:         string;
  processed_by?:       string;
  validated_by?:       string;
  caisse_numero?:      string;
  caisse_id?:          string;
  session_id?:         string;
}

export const transferSchema = z
  .object({
    id_member: z.string().min(1, "Le membre est requis."),
    account_source: z.string().min(1, "Le compte source est requis."),
    account_destination: z.string().min(1, "Le compte destination est requis."),
    typeTransfert: z.enum(transferTypes, {
      errorMap: () => ({ message: "Le type de transfert est requis." }),
    }),
    montant: z
      .number({ invalid_type_error: "Montant invalide." })
      .min(1, "Le montant doit être supérieur à 0."),
    dateTransfert: z.string().optional(),
    description: z.string().max(500).optional(),
    reference: z.string().optional(),
  })
  // ✅ Validation cross-field : au niveau de l'objet, pas sur un champ.
  .refine((data) => data.account_source !== data.account_destination, {
    message: "Le compte source et destination doivent être différents.",
    path: ["account_destination"],
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