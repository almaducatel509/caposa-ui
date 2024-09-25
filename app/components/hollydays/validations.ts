import { z } from "zod";
// validations.ts or validations.js


// Définition du schéma de validation pour les jours fériés
export const holidaySchema = z.object({
    date: z.date(),
    description: z.string(), // Exemple : "Jour de l'Indépendance"
});

// Interface pour les jours fériés spécifiques
export interface Holiday extends z.infer<typeof holidaySchema> {}

// Utilisation du schéma pour valider un jour férié
const exampleHoliday: Holiday = {
    date: new Date("2024-07-04"),
    description: "Jour de l'Indépendance",
};
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
