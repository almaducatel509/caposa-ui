import { z } from "zod";

// Schéma de validation pour les horaires
export const openingHoursSchema = z.object({
  monday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
  tuesday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
  wednesday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
  thursday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
  friday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
});

// Type dérivé du schéma Zod
export type OpeningHours = z.infer<typeof openingHoursSchema>;

// Type pour les messages d'erreur
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
