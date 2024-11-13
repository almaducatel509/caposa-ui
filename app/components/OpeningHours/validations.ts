import { z } from "zod";

export const openingHoursSchema = z.object({
    monday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
    tuesday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
    wednesday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
    thursday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
    friday: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format invalide, utilisez HH:mm-HH:mm"),
  });

export type OpeningHours = z.infer<typeof openingHoursSchema>;

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

export const formSchema = z.object({ 
  step1: openingHoursSchema,
});

export type Step1Data = z.infer<typeof openingHoursSchema>;
export type Step2Data = z.infer<typeof openingHoursSchema>;
export type Step3Data = z.infer<typeof openingHoursSchema>;

