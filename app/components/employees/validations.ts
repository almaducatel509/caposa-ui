import { z } from "zod";
import { BranchData } from '@/app/components/branches/validations';
import { PostData }   from '@/app/components/postes/validations';

// ─── Image schema ─────────────────────────────────────────────────────────
const imageSchema = z.union([
  z.instanceof(File).refine((file) => file.type.startsWith("image/"), {
    message: "Le fichier doit être une image",
  }),
  z.string(),
  z.null(),
]).optional();

// ─── Schéma Zod ──────────────────────────────────────────────────────────
export const employeeSchema = z.object({
  user: z.object({
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(3, 'Password must be at least 3 characters long'),
    confirm_password: z.string().min(3, 'Please confirm your password'),
  }).refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords must match',
  }),
  first_name:    z.string().min(1, 'First name is required'),
  last_name:     z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  phone_number:  z.string().regex(/^\d+$/, 'Phone number must only contain digits'),
  address:       z.string().min(1, 'Address is required'),
  gender:        z.string().min(1, "Sélection du sexe est requise"),
  payment_ref:   z.string().min(1, 'Payment reference is required'),
  branch:        z.string().uuid('Branch must be a valid UUID'),
  posts:         z.array(z.string().uuid('Post must be a valid UUID')).min(1, 'At least one post is required'),
  photo_profil:  imageSchema.optional().nullable(),
});

// ─── Types ────────────────────────────────────────────────────────────────
export interface UserInfo {
  email?: string;
  username?: string;
  password?: string;
  confirm_password?: string;
}

export interface EmployeeData {
  id: string;
  username?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  payment_ref: string;
  date_of_birth?: string;
  address?: string;
  gender?: string;
  posts: string[];                    // IDs depuis l'API
  photo_profil?: string | null;
  photo_url?: string | null;
  branch: string;                     // UUID depuis l'API

  // Champs enrichis côté front
  branch_details?: BranchData;
  posts_details?: PostData[];         // ← ⚠️ TABLEAU (un employé a plusieurs postes)
  nomComplet?: string;
  estActif?: boolean;
  statutEmploye?: 'actif' | 'inactif' | 'suspendu' | 'en_attente';

  created_at?: string;
  updated_at?: string;
  user?: UserInfo;
  role?: string;
  name?: string;
}

// Re-export pour les imports existants ailleurs dans le code
export type { BranchData, PostData };

// ─── Form types ──────────────────────────────────────────────────────────
export type EmployeeFormData = {
  user: {
    username: string;
    password: string;
    confirm_password: string;
    email: string;
  };
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
  gender: string;
  payment_ref: string;
  branch: string;
  posts: string[];
  photo_profil?: File | string | null;
  remove_photo?: boolean;
};
// ─── Error messages ──────────────────────────────────────────────────────
export type ErrorMessages<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<any>
      ? string
      : ErrorMessages<T[K]> | string
    : string;
} & {
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
};

// ─── Utility functions ───────────────────────────────────────────────────
export function formatGender(gender?: string) {
  switch (gender?.toLowerCase()) {
    case 'male':
    case 'm':
      return 'Homme';
    case 'female':
    case 'f':
      return 'Femme';
    case 'other':
      return 'Autre';
    default:
      return 'Non spécifié';
  }
}

export function getEmployeeStatus(employee: { statutEmploye?: string }) {
  return employee.statutEmploye || 'active';
}

export function employeeDataToFormData(employee: EmployeeData): EmployeeFormData {
  return {
    user: {
      username: employee.username || employee.user?.username || '',
      email:    employee.user?.email || '',
      password: '',
      confirm_password: '',
    },
    first_name:    employee.first_name || '',
    last_name:     employee.last_name || '',
    date_of_birth: employee.date_of_birth || '',
    phone_number:  employee.phone_number || '',
    address:       employee.address || '',
    gender:        employee.gender || 'M',
    payment_ref:   employee.payment_ref || '',
    branch:        employee.branch || '',
    posts:         employee.posts || [],
    photo_profil:  employee.photo_profil || null,
  };
}
