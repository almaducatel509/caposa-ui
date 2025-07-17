import { z } from "zod";

const imageSchema = z.union([
  z.instanceof(File).refine((file) => file.type.startsWith("image/"), {
    message: "Le fichier doit être une image",
  }),
  z.string(),  // For existing URLs
  z.null()     // For no photo
]).optional();

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
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  phone_number: z.string().regex(/^\d+$/, 'Phone number must only contain digits'),
  address: z.string().min(1, 'Address is required'),
  gender: z.string().min(1, "Sélection du sexe est requise"),
  payment_ref: z.string().min(1, 'Payment reference is required'),
  branch: z.string().uuid('Branch must be a valid UUID'),
  posts: z.array(z.string().uuid('Post must be a valid UUID')).min(1, 'At least one post is required'),
  photo_profil: imageSchema.optional().nullable(),
});

// User interface
export interface UserInfo {
  email?: string;
  username?: string;
  password?: string;
  confirm_password?: string;
}

// Branch details interface
export interface BranchDetails {
  id: string;
  branch_name: string;
  branch_code?: string | null; // ✅ Permet null ET undefined
}

// Post details interface
export interface PostDetails {
  id: string;
  name: string;
  post_name?: string;

}

// Employee data interface (what comes from API)
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
  posts?: string[];
  photo_profil?: string | null;
  photo_url?: string | null;
  branch: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  user?: UserInfo;
  role?: string;
  // Add missing properties for details
  branch_details?: BranchDetails;
  posts_details?: PostDetails[];
  name?: string; // ✅ Ajout pour la propriété enrichie

}

// Branch data interface
export interface BranchData {
  id: string;
  branch_name: string;
  branch_code?: string;
}

// Post data interface
export interface PostData {
  id: string;
  post_name: string;
  name?: string; // Add name property for compatibility
}

// Form data interface (what the form uses)
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
};

// Alternative flat form data structure for easier handling
export type FlatEmployeeFormData = {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
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
};

// Error messages type - supports both nested and flat structures
export type ErrorMessages<T> = {
  [K in keyof T]?: T[K] extends object 
    ? ErrorMessages<T[K]> | string
    : string;
} & {
  // Add specific error fields that might not be in the main type
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
};

// Utility functions
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

export function getEmployeeStatus(employee: { status?: string }) {
  return employee.status || 'active';
}

// Helper function to convert EmployeeData to EmployeeFormData
export function employeeDataToFormData(employee: EmployeeData): EmployeeFormData {
  return {
    user: {
      username: employee.username || employee.user?.username || '',
      email: employee.user?.email || '',
      password: '',
      confirm_password: '',
    },
    first_name: employee.first_name || '',
    last_name: employee.last_name || '',
    date_of_birth: employee.date_of_birth || '',
    phone_number: employee.phone_number || '',
    address: employee.address || '',
    gender: employee.gender || 'M',
    payment_ref: employee.payment_ref || '',
    branch: employee.branch || '',
    posts: employee.posts || [],
    photo_profil: employee.photo_profil || null,
  };
}

// Helper function to convert EmployeeFormData to API structure (keeping nested user object)
export function formDataToApiData(formData: EmployeeFormData): any {
  return {
    user: {
      username: formData.user.username,
      email: formData.user.email,
      password: formData.user.password,
      confirm_password: formData.user.confirm_password,
    },
    first_name: formData.first_name,
    last_name: formData.last_name,
    date_of_birth: formData.date_of_birth,
    phone_number: formData.phone_number,
    address: formData.address,
    gender: formData.gender,
    payment_ref: formData.payment_ref,
    branch: formData.branch,
    posts: formData.posts,
    photo_profil: formData.photo_profil,
  };
}

