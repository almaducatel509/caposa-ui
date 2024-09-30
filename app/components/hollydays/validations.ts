import { z } from "zod";
// validations.ts or validations.js


// Définition du schéma de validation pour les jours fériés
export const holidaySchema = z.object({
    date: z.string().min(6, "La date de est requise"),
    description: z.string().min(6, "Description est requise"), // Exemple : "Jour de l'Indépendance"
});

// Interface pour les jours fériés spécifiques  

export interface Holiday extends z.infer<typeof holidaySchema> {}

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
