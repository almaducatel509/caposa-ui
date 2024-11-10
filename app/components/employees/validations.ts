import { z } from "zod";
import { postSchema } from "../postes/validations";

// Schéma de validation de fichier (non nullable)

const fileSchema = z.instanceof(File, { message: "Une photo est requise" });
const imageSchema = fileSchema.refine(
  (file) =>file.type.startsWith("image/")
);
// Schéma de l'utilisateur
export const userSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirm_password: z.string().min(6, "La confirmation du mot de passe est requise"),
  email: z.string().email("Adresse e-mail invalide"),
});

export const step1Schema = z.object({
  user: userSchema,
  first_name: z.string().min(1, "Prénom est requis"),
  last_name: z.string().min(1, "Nom est requis"),
  gender: z.string().min(1, "Sélection du sexe est requise"),
  date_of_birthday: z.string().min(1, "Date de naissance est requise").date(),
  phone_number: z.string().min(6, "Téléphone est requis"),
  address: z.string().min(4, "Adresse est requise"),
  payment_ref: z.string().optional(),
  city: z.string().min(2, "Ville est requise"),
  department: z.string().min(4, "Département est requis"),
  photo_url: imageSchema.refine((file ) => file.size > 0),
  posts: z.array(postSchema), // Validation pour les objets post
});

// Schéma pour Step2Data
export const step2Schema = step1Schema; // Structure similaire pour Step2Data

// Schéma pour Step3Data (vide pour l'instant)
export const step3Schema = z.object({});

// Schéma principal pour employeeFormSchema


export const formSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

export type EmployeeFormData = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
};

// Type de messages d'erreur récursif pour gérer les structures imbriquées
export type ErrorMessages<T> = {
  [K in keyof T]?: T[K] extends object ? ErrorMessages<T[K]> : string;
};


