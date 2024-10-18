import { z } from "zod";

// Définition du schéma de validation pour les horaires d'ouverture et de fermeture
export const openingHoursSchema = z.object({
    monday_open: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    monday_close: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    tuesday_open: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    tuesday_close: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    wednesday_open: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    wednesday_close: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    thursday_open: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    thursday_close: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    friday_open: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    friday_close: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    saturday_open: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    saturday_close: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    sunday_open: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
    sunday_close: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm"),
});

// Définition du type des horaires d'ouverture basé sur le schéma Zod
export type OpeningHours = z.infer<typeof openingHoursSchema>;

// Définition des messages d'erreur possibles pour chaque jour
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

export const formSchema = z.object({ 
  step1: openingHoursSchema,
});

export type Step1Data = z.infer<typeof openingHoursSchema>;
export type Step2Data = z.infer<typeof openingHoursSchema>;
export type Step3Data = z.infer<typeof openingHoursSchema>;
