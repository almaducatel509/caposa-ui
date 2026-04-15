import { z } from 'zod';

export const DepositSubtype = z.enum(['cash', 'check', 'transfer', 'other']);
export type DepositSubtype = z.infer<typeof DepositSubtype>;

// ✅ Aligné sur STATUS_CFG
export const DepositStatus = z.enum([
  'decaisse', 'en_attente', 'en_cours', 'echoue', 'annule'
]);
export type DepositStatus = z.infer<typeof DepositStatus>;

export const depositSchema = z.object({
  idCompte:             z.string().min(1, 'Compte requis'),
  typeTransaction:      z.literal('DEPOSIT'),
  codeAutorisation:     z.string().min(1, "Code d'autorisation requis"),
  montantTransaction:   z.coerce.number().gt(0, 'Montant doit être > 0'),
  depositSubtype:       DepositSubtype,
  source:               z.string().min(1, 'Source du dépôt requise'),
  description:          z.string().optional().nullable(),
  transferReference:    z.string().optional().nullable(),
  senderName:           z.string().optional().nullable(),
  requiresVerification: z.boolean().optional(),
  holdPeriod:           z.coerce.number().min(0).optional(),
  availableImmediately: z.coerce.number().min(0).optional(),
  // Traçabilité — renvoyée par l'API, pas saisie par l'utilisateur
  session_id:           z.string().optional(),
  processed_by:         z.string().optional(),
  validated_by:         z.string().optional(),
  caisse_numero:        z.string().optional(),
  caisse_id:            z.string().optional(),
});

export type DepositFormValidated = z.infer<typeof depositSchema>;

// ✅ Schéma update — pour EditDepositModal
export const depositUpdateSchema = depositSchema
  .partial()
  .extend({
    raison_de_modification: z.string()
      .min(5, 'La raison doit contenir au moins 5 caractères')
      .max(500, 'Raison trop longue'),
  });

export type DepositUpdateValidated = z.infer<typeof depositUpdateSchema>;