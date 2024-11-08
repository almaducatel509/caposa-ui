import { z } from "zod";
import { postSchema } from "../postes/validations";

export const userSchema = z.object({
  username: z.string(),
  password: z.string(),
  confirm_password: z.string(),
  email: z.string().email("Invalid email address"),
});
const fileSchema = z.instanceof(File, { message: "Required" }).nullable();
const imageSchema = fileSchema.refine(
  (file) => file === null || (file && file.size > 0 && file.type.startsWith("image/")),
  { message: "Le fichier doit être une image valide et ne peut pas être vide" }
);

export const Step1Data = z.object({
  user: userSchema,
  first_name: z.string().min(1, "Prénom est requis"),
  last_name: z.string().min(1, "Nom est requis"),
  gender: z.string().min(1, "Sélection du sexe est requise"),
  date_of_birth: z.date(),
  phone_number: z.string().min(6, "Téléphone est requis"),
  address: z.string().min(4, "Adresse est requise"),
  payment_ref: z.string().optional(),
  city: z.string().min(2, "Ville est requise"),
  department: z.string().min(4, "Département est requis"),
  photo_url: imageSchema, // Use imageSchema here
  posts: z.array(postSchema) // Include full post objects in posts
});

// Validation schema for step 2
export const Step2Data = Step1Data; // Assuming same structure

// Validation schema for step 3 (empty object for now)
export const Step3Data = z.object({});

export const employeeFormSchema = z.object({
  step1: Step1Data,
  step2: Step2Data,
  step3: Step3Data,
});

export type Step1Data = z.infer<typeof Step1Data>;
export type Step2Data = z.infer<typeof Step2Data>;
export type Step3Data = z.infer<typeof Step3Data>;

export type EmployeeFormData = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
};

// Define specific error messages structure for user
type UserErrors = {
  
  username: string;
  password: string;
  confirm_password: string;
  email: string;
};

// Recursive ErrorMessages type that checks for nested structures
export type ErrorMessages<T> = {
  [K in keyof T]?: T[K] extends object ? (K extends 'user' ? UserErrors : ErrorMessages<T[K]>) : string;
};