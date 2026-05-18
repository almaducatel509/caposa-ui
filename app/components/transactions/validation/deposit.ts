import { z } from 'zod';

/* ─────────────────────────────────────────────
 * Types de dépôt supportés par CAPOSA
 * ───────────────────────────────────────────── */
export const DepositSubtype = z.enum(['cash', 'check']);
export type DepositSubtype = z.infer<typeof DepositSubtype>;

/* ─────────────────────────────────────────────
 * Status
 * ───────────────────────────────────────────── */
export const DepositStatus = z.enum([
  'encaisse', 'en_attente', 'en_cours', 'echoue', 'annule'
]);
export type DepositStatus = z.infer<typeof DepositStatus>;

/* ─────────────────────────────────────────────
 * Base schema (ZodObject pur)
 * ───────────────────────────────────────────── */
const depositBaseSchema = z.object({
  idCompte:             z.string().min(1, 'Compte requis'),
  typeTransaction:      z.literal('DEPOSIT'),
  codeAutorisation:     z.string().min(1, "Code d'autorisation requis"),
  montantTransaction:   z.coerce.number().gt(0, 'Montant doit être > 0'),

  depositSubtype:       DepositSubtype,

  /* Informations générales */
  source:               z.string().min(1, 'Source du dépôt requise'),
  description:          z.string().optional().nullable(),
/* Informations chèque */
  checkNumber:          z.string().optional().nullable(),
  issuingBank:          z.string().optional().nullable(),
  checkIssuerName:      z.string().optional().nullable(),
  checkDate:            z.string().optional().nullable(),

  /* Informations MICR */
  micrSequence:        z.string().optional().nullable(),
  bankCode:            z.string().optional().nullable(),
  accountNumberMicr:   z.string().optional().nullable(),
  branchCode:          z.string().optional().nullable(),
  productCode:         z.string().optional().nullable(),

  /* Champs supplémentaires */
  beneficiary:         z.string().optional().nullable(),
  amountWords:         z.string().optional().nullable(),
  issuePlace:          z.string().optional().nullable(),

  /* Options système */
  requiresVerification: z.boolean().optional(),
  holdPeriod:           z.coerce.number().min(0).optional(),
  availableImmediately: z.coerce.number().min(0).optional(),

  /* Traçabilité API */
  session_id:           z.string().optional(),
  processed_by:         z.string().optional(),
  validated_by:         z.string().optional(),
  caisse_numero:        z.string().optional(),
  caisse_id:            z.string().optional(),
});

/* ─────────────────────────────────────────────
 * Schéma final avec validation métier
 * ───────────────────────────────────────────── */
export const depositSchema = depositBaseSchema.superRefine((data, ctx) => {
  /* Dépôt par chèque → champs obligatoires */
  if (data.depositSubtype === 'check') {
    const requiredFields: Array<[keyof typeof depositBaseSchema._type, string]> = [
      ['checkNumber', 'Numéro du chèque requis'],
      ['issuingBank', 'Banque émettrice requise'],
      ['checkIssuerName', "Nom de l'émetteur requis"],

      // MICR
      ['micrSequence', 'Numéro séquentiel MICR requis'],
      ['bankCode', 'Code banque requis'],
      ['accountNumberMicr', 'Numéro de compte MICR requis'],
      ['branchCode', 'Code succursale requis'],
      ['productCode', 'Code produit requis'],

      // Supplémentaires
      ['beneficiary', 'Bénéficiaire requis'],
      ['amountWords', 'Montant en lettres requis'],
      ['issuePlace', "Lieu d'émission requis"],
    ];

    for (const [field, message] of requiredFields) {
      if (!String(data[field] ?? '').trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message,
        });
      }
    }


  }

  /* Dépôt cash → champs chèque interdits */
  if (data.depositSubtype === 'cash') {
   const forbiddenFields: Array<keyof typeof depositBaseSchema._type> = [
  'checkNumber',
  'issuingBank',
  'checkIssuerName',
  'checkDate',
  'micrSequence',
  'bankCode',
  'accountNumberMicr',
  'branchCode',
  'productCode',
  'beneficiary',
  'amountWords',
  'issuePlace',
];

for (const field of forbiddenFields) {
  if (data[field]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [field],
      message: 'Ce champ ne doit pas être fourni pour un dépôt cash',
    });
  }
}


    for (const field of forbiddenFields) {
      if (data[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: 'Ce champ ne doit pas être fourni pour un dépôt cash',
        });
      }
    }
  }
});


export type DepositFormValidated = z.infer<typeof depositSchema>;

/* ─────────────────────────────────────────────
 * Update schema (partial fonctionne maintenant)
 * ───────────────────────────────────────────── */
export const depositUpdateSchema = depositBaseSchema
  .partial()
  .extend({
    raison_de_modification: z.string()
      .min(5, 'La raison doit contenir au moins 5 caractères')
      .max(500, 'Raison trop longue'),
  });

export type DepositUpdateValidated =
  z.infer<typeof depositUpdateSchema>;
