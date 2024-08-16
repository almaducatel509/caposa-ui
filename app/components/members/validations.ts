import { z } from "zod";
const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 && file.type.startsWith("image/")
).nullable();
export const step1Schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  gender: z.string().min(1),
  date_of_birthday: z.string().min(1).date(),
  id_number: z.string().min(1),
  phone_number: z.string().min(6),
  email: z.string().email(),
  address: z.string().min(4),
  city: z.string().min(2),
  department: z.string().min(4),
  // photo_url: imageSchema.refine((file) => file.size > 0, "Required"),
});

export const step2Schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const step3Schema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
});

export const formSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type FormData = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
};

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
