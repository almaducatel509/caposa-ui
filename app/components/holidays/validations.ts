// import { z } from 'zod';

// // Define the validation schema for holidays
// export const holidaySchema = z.object({
//     date: z
//       .string()
//       .min(1, "La date est requise")
//       .refine(date => /^\d{4}-\d{2}-\d{2}$/.test(date), {
//         message: "La date doit être au format AAAA-MM-JJ",
//       }),
//     description: z.string().min(6, "La description de la date est requise"),
//     //status: "active" | "archived"

// });
// export type HolidayDataBase = z.infer<typeof holidaySchema>;

// // Interface étendue qui inclut les champs facultatifs retournés par l'API
// export interface HolidayData extends HolidayDataBase {
//   id: string; // ✅ facultatif pour la création, requis côté API si besoin
//   branch_code?: string;
//   created_at?: string;
//   updated_at?: string;
// }
// // Generic type for handling error messages
// export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
import { z } from 'zod';

// Define the validation schema for holidays
export const holidaySchema = z.object({
  date: z
    .string()
    .min(1, "La date est requise")
    .refine(date => /^\d{4}-\d{2}-\d{2}$/.test(date), {
      message: "La date doit être au format AAAA-MM-JJ",
    }),
  
  description: z.string().min(6, "La description de la date est requise"),
  
  type: z.enum(["ferie", "local", "interne", "election", "maintenance","autre"])
    .default("ferie"),
  
  scope: z.enum(["national", "regional", "branch","autre"])
    .default("national"),
  
  branch_code: z.string().optional(),
});

export type HolidayDataBase = z.infer<typeof holidaySchema>;

// Interface étendue qui inclut les champs facultatifs retournés par l'API
// export interface HolidayData extends HolidayDataBase {
//   id: string;
//   created_at?: string;
//   updated_at?: string;
// }
export interface HolidayData extends HolidayDataBase {
  id: string;
  date: string;
  description: string;
  type: "ferie" | "local" | "interne" | "election" | "maintenance" | "autre"; // obligatoire
  scope: "national" | "regional" | "branch" | "autre"; // obligatoire
  branch_code?: string;
  created_at?: string;
  updated_at?: string;
}

// Generic type for handling error messages
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;