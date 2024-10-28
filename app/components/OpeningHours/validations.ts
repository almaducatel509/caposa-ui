import { z } from "zod";

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
  });

export type OpeningHours = z.infer<typeof openingHoursSchema>;

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

export const formSchema = z.object({ 
  step1: openingHoursSchema,
});

export type Step1Data = z.infer<typeof openingHoursSchema>;
export type Step2Data = z.infer<typeof openingHoursSchema>;
export type Step3Data = z.infer<typeof openingHoursSchema>;

//In your POST request, you can construct the payload from formData like this: 
//const formattedData = {
//   monday: `${formData.monday_open}-${formData.monday_close}`,
//   tuesday: `${formData.tuesday_open}-${formData.tuesday_close}`,
//   // Repeat for all days
// };
