import { z } from "zod";
const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
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
  photo_url: imageSchema.refine((file ) => file.size > 0, "Une photo est requise"),
});

export const step2Schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  account_type: z.string().min(1, "Account type is required"),
  account_number: z.string().min(1, "Account number is required"),
  current_balance: z.number().nonnegative("Current balance must be a positive number"),
  loan_type: z.string().optional(),
  loan_amount: z.number().nonnegative("Loan amount must be a positive number").optional(),
  interest_rate: z.number().min(0, "Interest rate must be at least 0%").optional(),
  loan_duration: z.string().optional(),
  payment_frequency: z.string().optional(),
  security_question: z.string().optional(),
  security_answer: z.string().optional(),
  additional_accounts: z.string().optional(),
  monthly_income: z.number().nonnegative("Monthly income must be a positive number").optional(),
  monthly_expenses: z.number().nonnegative("Monthly expenses must be a positive number").optional(),
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
