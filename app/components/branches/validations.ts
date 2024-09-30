// validations.ts
import { z } from "zod";
import { holidaySchema } from "../hollydays/validations";
import { openingHoursSchema } from "../OpeningHours/validations";

export const step1Schema = z.object({
  branch_id: z.string(),
  branch_name: z.string(),
  branch_address: z.string(),
  branch_phone_number: z.string(),
  branch_email: z.string().email(),
  branch_manager_id: z.string(),
  branch_code: z.string(),
  number_of_posts: z.number(),
  number_of_tellers: z.number(),
  number_of_clerks: z.number(),
  number_of_credit_officers: z.number(),
  opening_date: z.date(),
  opening_hours: openingHoursSchema, // Assuming you import this from another file
  holidays: holidaySchema, // Assuming Holiday is a string type
}); 
export const step2Schema = z.object({
  branch_id: z.string(),
  branch_name: z.string(),
  branch_address: z.string(),
  branch_phone_number: z.string(),
  branch_email: z.string().email(),
  branch_manager_id: z.string(),
  branch_code: z.string(),
  number_of_posts: z.number(),
  number_of_tellers: z.number(),
  number_of_clerks: z.number(),
  number_of_credit_officers: z.number(),
  opening_date: z.date(),
  opening_hours: openingHoursSchema, // Assuming you import this from another file
  holidays: holidaySchema, // Assuming Holiday is a string type
});

export const step3Schema = z.object({})

// Combine all steps into a single form schema
export const formSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

// Define the type for each step
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

// Define the overall form data type
export type FormData = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
};

// Error messages type
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;