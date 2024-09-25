import { z } from "zod";
import { postSchema } from "../postes/validations";
import { step1Schema } from "../branches/validations";

// Schéma pour valider un fichier d'image
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.string(),
  team: z.string(),
  status: z.string(),
  age: z.string(), // Consider using z.number() if age should be numeric
  avatar: z.string(),
  email: z.string().email("Invalid email address"),
});
const fileSchema = z.instanceof(File, { message: "Required" }).nullable();
const imageSchema = fileSchema.refine(
  (file) => file === null || (file && file.size > 0 && file.type.startsWith("image/")),
  { message: "Le fichier doit être une image valide et ne peut pas être vide" }
);

export const Step1Data = z.object({
  first_name: z.string().min(1, "Prénom est requis"),
  last_name: z.string().min(1, "Nom est requis"),
  gender: z.string().min(1, "Sélection du sexe est requise"),
  date_of_birthday: z.string().min(1, "Date de naissance est requise"),
  id_number: z.string().min(1, "Numéro d'identité est requis"),
  phone_number: z.string().min(6, "Téléphone est requis"),
  email: z.string().email("Email invalide"),
  address: z.string().min(4, "Adresse est requise"),
  city: z.string().min(2, "Ville est requise"),
  department: z.string().min(4, "Département est requis"),
  photo_url: imageSchema.refine(
    (file) => file !== null && file.size > 0,
    "Une photo est requise"
  ),
  user: userSchema, // Défini dans un fichier séparé
  branch: step1Schema, // Défini dans un fichier séparé
  posts: (postSchema), // Défini dans un fichier séparé
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

// Error messages type
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
