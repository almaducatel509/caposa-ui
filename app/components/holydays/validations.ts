import { z } from 'zod';

// Define the validation schema for holidays
export const holidaySchema = z.object({
    holyday_date: z
      .string()
      .min(1, "La date est requise")
      .refine(date => /^\d{4}-\d{2}-\d{2}$/.test(date), {
        message: "La date doit être au format AAAA-MM-JJ",
      }),
    holyday_description: z.string().min(6, "La description de la date est requise"),
});

// Specific interface for holidays
export interface Holiday extends z.infer<typeof holidaySchema> {}

// Generic type for handling error messages
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
