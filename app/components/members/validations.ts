import { z } from "zod";

// ==================== SCHÉMA ZOD SIMPLE ====================

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

// ✅ Schéma membre simple avec Zod
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
    membership_tier: z.string().min(1, "Niveau d'adhésion requis"),
    monthly_income: z.number().nonnegative("Revenu mensuel invalide").optional(),
    monthly_expenses: z.number().nonnegative("Dépenses mensuelles invalides").optional(),
    income_source: z.string().min(1, "Source de revenu requise"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

// ==================== TYPES SIMPLES ====================

export type MemberFormData = z.infer<typeof memberSchema>;

// ✅ Type d'erreur corrigé
export type ErrorMessages<T> = Partial<Record<keyof T, string>> & {
  general?: string; // Maintenant autorisé
};

// ==================== INTERFACE MEMBER DATA SIMPLE ====================

export interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birthday: string;
  id_number: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  department: string;
  photo_profil?: string | null;
  account_type: string;
  account_number: string;
  initial_balance: number;
  membership_tier: string;
  monthly_income?: number;
  monthly_expenses?: number;
  income_source: string;
  created_at: string;
  updated_at: string;
  // Legacy compatibility
  membership_type?: string;
  date_of_birth?: string;
}

// ==================== FONCTIONS UTILITAIRES SIMPLES ====================

// Formater le genre
export const formatGender = (gender: string): string => {
  switch (gender?.toLowerCase()) {
    case 'm': return 'Masculin';
    case 'f': return 'Féminin';
    default: return 'Autre';
  }
};

// Statut du membre
export const getMemberStatus = (member: MemberData): string => {
  if (!member) return 'Inconnu';
  return member.initial_balance >= 0 ? 'Actif' : 'Solde négatif';
};

// Calculer l'âge
export const calculateAge = (dateOfBirth: string): number | null => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  return today.getFullYear() - birthDate.getFullYear();
};

// Formater le solde
export const formatBalance = (balance: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(balance);
};

// Formater le tier d'adhésion
export const formatMembershipTier = (tier: string): string => {
  const labels: { [key: string]: string } = {
    basic: 'Basique',
    standard: 'Standard',
    premium: 'Premium',
    vip: 'VIP'
  };
  return labels[tier] || tier;
};

// Couleur du tier
export const getMembershipColor = (tier: string) => {
  const colors: { [key: string]: string } = {
    basic: 'default',
    standard: 'primary',
    premium: 'secondary',
    vip: 'warning'
  };
  return colors[tier] || 'default';
};

// Formater le type de compte
export const formatAccountType = (type: string): string => {
  const labels: { [key: string]: string } = {
    savings: 'Épargne',
    checking: 'Courant',
    investment: 'Investissement',
    loan: 'Prêt'
  };
  return labels[type] || type;
};

// ==================== VALIDATION SIMPLE ====================
export const validateMemberForm = (data: Partial<MemberFormData>): ErrorMessages<MemberFormData> => {
  try {
    memberSchema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ErrorMessages<MemberFormData> = {};
      
      error.errors.forEach((err) => {
        const path = err.path[0] as keyof MemberFormData;
        errors[path] = err.message;
      });
      
      return errors;
    }
    
    return { general: 'Erreur de validation inconnue' };
  }
};
