import { z } from 'zod';

/* ─────────────────────────────────────────────
 * Types de dépôt supportés par CAPOSA
 * ───────────────────────────────────────────── */
export const DepositSubtype = z.enum(['cash', 'check']);


export type DepositStatus =
  | 'encaisse'
  | 'en_attente'
  | 'en_cours'
  | 'echoue'
  | 'annule';

export type SessionStatut = 'ouverte' | 'fermée';

export type DepositSubtype = 'cash' | 'check'; // adapte si tu as d'autres valeurs

export interface DepositData {
  id:                 number;
  idCompte:           string;
  codeAutorisation:   string;
  montantTransaction: number;
  depositSubtype:     DepositSubtype;
  source:             string;
  description?:       string;
  holdPeriod:         number;
  status:             DepositStatus;
  created_at:         string;
  member_name:        string;
  processed_by:       string;
  validated_by:       string;
  caisse_numero:      string;
  caisse_id:          string;
  session_id:         string;
  session_statut:     SessionStatut;

  // Champs chèque / MICR (ajoutés mais optionnels → pas de casse)
  checkNumber?:       string;
  issuingBank?:       string;
  checkIssuerName?:   string;
  checkDate?:         string;

  micrSequence?:      string;
  bankCode?:          string;
  accountNumberMicr?: string;
  branchCode?:        string;
  productCode?:       string;

  beneficiary?:       string;
  amountWords?:       string;
  issuePlace?:        string;
}

/**
 * ⚠️ On garde ce type tel quel pour ne rien casser ailleurs.
 * Il reste utilisé là où tu l’utilises déjà.
 */
export type DepositFormData = DepositFormValidated;
/* ─────────────────────────────────────────────
 * Schéma INPUT du formulaire (ce que l'user saisit)
 * ───────────────────────────────────────────── */
export const depositFormBaseSchema = z.object({
  idCompte:           z.string().min(1, 'Compte requis'),
  typeTransaction:    z.literal('DEPOSIT').optional(),
  codeAutorisation:   z.string().min(1, "Code d'autorisation requis"),
  montantTransaction: z.number().positive('Montant invalide'),
  depositSubtype:     z.enum(['cash', 'check']),
  source:             z.string().min(1, 'Source requise'),
  description:        z.string().nullable().optional(),

  // Chèque
  checkNumber:        z.string().nullable().optional(),
  issuingBank:        z.string().nullable().optional(),
  checkIssuerName:    z.string().nullable().optional(),
  checkDate:          z.string().nullable().optional(),

  // MICR
  micrSequence:       z.string().nullable().optional(),
  bankCode:           z.string().nullable().optional(),
  accountNumberMicr:  z.string().nullable().optional(),
  branchCode:         z.string().nullable().optional(),
  productCode:        z.string().nullable().optional(),

  // Supplémentaires
  beneficiary:        z.string().nullable().optional(),
  amountWords:        z.string().nullable().optional(),
  issuePlace:         z.string().nullable().optional(),

});

/* Le schéma utilisé par le formulaire = base + superRefine */
export const depositSchema = depositFormBaseSchema.superRefine((data, ctx) => {
  if (data.depositSubtype === 'check') {
    const requiredFields = [
      ['checkNumber',       'Numéro du chèque requis'],
      ['issuingBank',       'Banque émettrice requise'],
      ['checkIssuerName',   "Nom de l'émetteur requis"],
      ['micrSequence',      'Numéro séquentiel MICR requis'],
      ['bankCode',          'Code banque requis'],
      ['accountNumberMicr', 'Numéro de compte MICR requis'],
      ['branchCode',        'Code succursale requis'],
      ['productCode',       'Code produit requis'],
      ['beneficiary',       'Bénéficiaire requis'],
      ['amountWords',       'Montant en lettres requis'],
      ['issuePlace',        "Lieu d'émission requis"],
    ] as const;

    for (const [field, message] of requiredFields) {
      const value = (data as any)[field];
      if (!String(value ?? '').trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message,
        });
      }
    }
  }
  // (la branche cash interdisant les champs check, tu peux la garder ou la virer
  //  — vu que tu envoies déjà null pour ces champs côté cash, elle ne déclenchera pas)
});

export type DepositFormValidated = z.infer<typeof depositSchema>;

/* ─────────────────────────────────────────────
 * Schéma COMPLET (données serveur) — pour les listes, détails, etc.
 * ───────────────────────────────────────────── */
export const depositFullSchema = depositFormBaseSchema.extend({
  id:             z.number(),
  status:         z.enum(['encaisse', 'en_attente', 'en_cours', 'echoue', 'annule']),
  created_at:     z.string(),
  member_name:    z.string(),
  processed_by:   z.string(),
  validated_by:   z.string(),
  caisse_numero:  z.string(),
  caisse_id:      z.string(),
  session_id:     z.string(),
  session_statut: z.enum(['ouverte', 'fermée']),
});

/* ─────────────────────────────────────────────
 * Update schema
 * ───────────────────────────────────────────── */
export const depositUpdateSchema = depositFormBaseSchema
  .partial()
  .extend({
    raison_de_modification: z.string()
      .min(5, 'La raison doit contenir au moins 5 caractères')
      .max(500, 'Raison trop longue'),
  });

export type DepositUpdateValidated = z.infer<typeof depositUpdateSchema>;
