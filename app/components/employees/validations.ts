import { z } from "zod";
import { postSchema } from "../postes/validations";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);
export const step1Schema = z.object({
  password: z.string().min(3, 'Password must be at least 8 characters long'),
  confirm_password: z.string().min(3),
  email: z.string().email('Invalid email format'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(1, 'User name is required'),
  date_of_birthday: z.string().min(1, "Date de naissance est requise").date(),
  phone_number: z.string().regex(/^\d+$/, 'Phone number must only contain digits'),
  address: z.string().min(1, 'Address is required'),
  gender: z.string().min(1, "Sélection du sexe est requise"),
  //(It's for transaction)payment_ref: z.string().min(1, 'Payment reference is required'),
  photo_url: imageSchema.refine((file ) => file.size > 0, "Une photo est requise"),
  posts: z.array(postSchema), // Validation pour les objets post
});
// Schéma pour Step2Data
export const step2Schema = step1Schema; // Structure similaire pour Step2Data

// Schéma pour Step3Data (vide pour l'instant)
export const step3Schema = z.object({});

export const formSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

export interface Step1Data extends z.infer<typeof step1Schema> {}
export interface Step2Data extends z.infer<typeof step2Schema> {
  step1: any;
}
export interface Step3Data extends z.infer<typeof step3Schema> {}

export type EmployeeFormData = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
};

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;



