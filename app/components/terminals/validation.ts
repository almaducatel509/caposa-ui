import { z } from 'zod';

export const CaisseCreateSchema = z.object({
  nom_caisse: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  branch:     z.string().uuid('Veuillez sélectionner une agence'),
  poste:      z.string().optional(),
  actif:      z.boolean().default(true),
});

export type CaisseCreateValues = z.infer<typeof CaisseCreateSchema>;

export function validateCaisseForm(data: unknown) {
  const parsed = CaisseCreateSchema.safeParse(data);
  if (parsed.success) return { success: true as const, data: parsed.data };

  const errors: Partial<Record<keyof CaisseCreateValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof CaisseCreateValues;
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false as const, errors };
}