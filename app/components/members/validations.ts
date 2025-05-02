import { z } from "zod";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

// ✅ Nouveau schéma unifié
export const memberSchema = z
  .object({
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
    photo_profil: imageSchema.optional().nullable(),
    password: z.string().min(6, "Mot de passe requis"),
    confirm_password: z.string().min(6, "Confirmation du mot de passe requise"),
    account_type: z.string().min(1, "Type de compte requis"),
    account_number: z.string().min(1, "Numéro de compte requis"),
    initial_balance: z.number().nonnegative("Solde initial invalide"),
    membership_tier: z.string().min(1, "Niveau d’adhésion requis"),
    monthly_income: z.number().nonnegative("Revenu mensuel invalide").optional(),
    monthly_expenses: z.number().nonnegative("Dépenses mensuelles invalides").optional(),
    income_source: z.string().min(1, "Source de revenu requise"),
    // referred_by: z.string().optional(), // à activer si besoin
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

export type MemberFormData = z.infer<typeof memberSchema>;
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
