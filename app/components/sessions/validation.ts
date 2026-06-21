/**
 * sessionValidation.ts
 * ─────────────────────────────────────────────────────────────────
 * Schémas Zod pour :
 *   • Enregistrement de caisse
 *   • Ouverture de session  (tous les champs)
 *   • Fermeture de session  (tous les champs)
 * ─────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

// ─── Enregistrement de caisse ────────────────────────────────────

export const CaisseSchema = z.object({
  numero_caisse: z
    .string()
    .min(1, 'Le numéro de caisse est requis')
    .regex(/^C-\d{2,4}$/, 'Format attendu : C-01, C-02, C-100…'),

  nom_caisse: z
    .string()
    .min(2, 'Le nom de la caisse est requis')
    .max(60, 'Nom trop long'),

  localisation: z
    .string()
    .min(2, 'La localisation est requise')
    .max(100, 'Localisation trop longue'),

  branch: z
    .string()
    .uuid('Agence invalide'),

  solde_initial: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(0, 'Le solde ne peut pas être négatif'),

  actif: z.boolean().default(true),
});

export type CaisseFormValues = z.infer<typeof CaisseSchema>;

// ─── Ouverture de session ────────────────────────────────────────

export const OpenSessionSchema = z.object({
  // Identité
  username: z
    .string()
    .min(1, "Le nom d'utilisateur est requis")
    .max(150, 'Username trop long')
    .regex(/^[\w.@+-]+$/, 'Username invalide'),

  numero_caisse: z
    .string()
    .min(1, 'Le numéro de caisse est requis')
    .regex(/^C-\d{2,4}$/, 'Format attendu : C-01, C-02…'),

  branch: z
    .string()
    .uuid('Agence invalide — sélectionnez une agence'),


  // Autorisation
  superviseur: z
    .string()
    .min(1, 'Le superviseur est requis')
    .max(150, 'Trop long'),

  id_responsable_cash: z
    .string()
    .min(1, "L'ID responsable cash est requis")
    .max(150, 'Trop long'),

  // Montant
  montant_ouverture: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(1, "Le montant d'ouverture doit être positif"),
});

export type OpenSessionFormValues = z.infer<typeof OpenSessionSchema>;

// ─── Fermeture de session ────────────────────────────────────────

export const CloseSessionSchema = z.object({
  // Montant compté physiquement par le caissier
  montant_fermeture: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(0, 'Le montant ne peut pas être négatif'),

  // Commentaire obligatoire si écart détecté — géré côté UI
  note_fermeture: z
    .string()
    .max(500, 'Note trop longue')
    .optional(),

  // Checklist fin de journée
  remise_effectuee: z
    .boolean({ required_error: 'Confirmez la remise' }),

  reconciliation_effectuee: z
    .boolean({ required_error: 'Confirmez la réconciliation' }),
});

export type CloseSessionFormValues = z.infer<typeof CloseSessionSchema>;

// ─── Helper générique ────────────────────────────────────────────

export function validateForm<T extends z.ZodTypeAny>(
  schema: T,
  values: unknown
):
  | { success: true;  data: z.infer<T> }
  | { success: false; errors: Partial<Record<string, string>> } {
  const result = schema.safeParse(values);
  if (result.success) return { success: true, data: result.data };

  const errors: Partial<Record<string, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}