
// Réponse attendue du backend
export interface CreateDepositResponse {
  id: string;
  reference: string;
  account_id: string;
  amount: number;
  currency: string;
  deposit_type: "cash" | "check" | "transfer" | "other";
  source?: string | null;
  description?: string | null;
  hold_days?: number;
  available_immediately?: number;
  available_on?: string | null;
  new_balance?: number;
  created_at: string;  // ISO UTC
  created_by?: string;
}
/**
 * sessionValidation.ts
 * ─────────────────────────────────────────────────────────────────
 * Schémas Zod pour :
 *   • Enregistrement d'une caisse
 *   • Ouverture de session
 *   • Fermeture de session
 *
 * Identifiant caissier : username (déjà unique dans employeeSchema)
 *   → Pas de doublon possible, lié directement à la table User.
 *   → Le backend peut faire user = User.objects.get(username=...)
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

  devise: z
    .enum(['HTG', 'USD'], {
      errorMap: () => ({ message: 'Devise invalide (HTG ou USD)' }),
    })
    .default('HTG'),

  solde_initial: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(0, 'Le solde ne peut pas être négatif'),

  actif: z.boolean().default(true),
});

export type CaisseFormValues = z.infer<typeof CaisseSchema>;

// ─── Ouverture de session ────────────────────────────────────────
// username : identifiant unique issu de employeeSchema.user.username
// Le backend résout l'employé via User.objects.get(username=username)

export const OpenSessionSchema = z.object({
  username: z
    .string()
    .min(1, 'Le nom d\'utilisateur est requis')
    .max(150, 'Username trop long')
    .regex(
      /^[\w.@+-]+$/,
      'Username invalide (lettres, chiffres, @, ., +, -, _ seulement)'
    ),

  numero_caisse: z
    .string()
    .min(1, 'Le numéro de caisse est requis')
    .regex(/^C-\d{2,4}$/, 'Format attendu : C-01, C-02…'),

  superviseur: z
    .string()
    .min(1, 'Le superviseur est requis')
    .max(150, 'Trop long'),

  montant_ouverture: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(1, "Le montant d'ouverture doit être positif"),

  id_responsable_cash: z
    .string()
    .min(1, "L'ID responsable cash est requis")
    .max(150, 'ID trop long'),
});

export type OpenSessionFormValues = z.infer<typeof OpenSessionSchema>;

// ─── Fermeture de session ────────────────────────────────────────

export const CloseSessionSchema = z.object({
  montant_fermeture: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(0, 'Le montant ne peut pas être négatif'),

  note: z
    .string()
    .max(200, 'Note trop longue')
    .optional(),
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