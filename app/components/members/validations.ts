import { z } from "zod";
const fileSchema = z.instanceof(File, { message: "Une photo est requise" });
const imageSchema = fileSchema.refine(
  (file) =>file.type.startsWith("image/")
);
export const step1Schema = z.object({
  first_name: z.string().min(1, "Prénom est requis"),
  last_name: z.string().min(1,"Nom est requis"),
  gender: z.string().min(1, "Sélection du sexe est requise"),
  date_of_birthday: z.string().min(1, "Date de naissance est requise").date(),
  id_number: z.string().min(1, "Numéro d'identité est requis"),
  phone_number: z.string().min(6,"Téléphone est requis"),
  email: z.string().email("Email invalide"),
  address: z.string().min(4,"Adresse est requise"),
  city: z.string().min(2, "Ville est requise"),
  department: z.string().min(4, "Département est requis"),
  photo_url: imageSchema.refine((file ) => file.size > 0),
});
export const step2Schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirm_password: z.string().min(6, "Confirm password must be at least 6 characters long"),
    account_type: z.string().min(1, "Account type is required"),
    account_number: z.string().min(1, "Account number is required"),
    initial_balance: z.number().nonnegative("Initial balance must be a positive number"),
    membership_tier: z.string().min(1, "Sélection du sexe est requise"),
    monthly_income: z.number().nonnegative("Monthly income must be a positive number").optional(),
    monthly_expenses: z.number().nonnegative("Monthly expenses must be a positive number").optional(),
    income_source: z.string().min(1, "Income source is required"),
    // referred_by: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords must match",
    path: ["confirm_password"], // Afficher l'erreur sur le champ confirm_password
  });

// gerer la date de la creation du compte vous pouvez utiliser un champ avec DEFAULT CURRENT_TIMESTAMP.

export const step3Schema = z.object({});

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
