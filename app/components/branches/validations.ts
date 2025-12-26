import { DepartmentCode } from '@/app/data/haitiLocations';
import { z } from 'zod';

/* =====================================================
   Interfaces API (inchangées)
===================================================== */

export interface OpeningHour {
  id: string;
  schedule: string;
}

export interface Holiday {
  id: string;
  date: string;
  description: string;
}

/* =====================================================
   1️⃣ Schéma BASE – Création / Édition (branche inactive)
===================================================== */

export const branchBaseSchema = z.object({
  branch_name: z.string().min(1, 'Branch name is required'),
  branch_address: z.string().min(1, 'Branch address is required'),
  branch_phone_number: z.string().min(1, 'Branch phone number is required'),
  branch_email: z.string().email('Invalid email format'),

  // 🆕 AJOUT LOCATION - Utilise le type DepartmentCode importé
  department_code: z.enum([
    'OUEST', 'SUDEST', 'NORD', 'NORDEST', 'ARTIBONITE', 
    'CENTRE', 'SUD', 'GRAND_ANSE', 'NORD_OUEST', 'NIPPES'
  ] as const),
  city: z.string().min(1, 'City is required'),
  
  number_of_posts: z.number().min(1, 'Number of posts must be at least 1'),
  number_of_tellers: z.number().min(1, 'Number of tellers must be at least 1'),
  number_of_clerks: z.number().min(1, 'Number of clerks must be at least 1'),
  number_of_credit_officers: z.number().min(1, 'Number of credit officers must be at least 1'),
  opening_date: z.string().min(1, 'Opening date is required'),
  
  // ❗ OPTIONNELS tant que la branche n'est pas activée
  opening_hour: z.string().uuid('Opening hour must be a valid UUID').optional(),
  holidays: z.array(z.string().uuid('Holiday must be a valid UUID')).optional(),

  // état métier
  status: z.enum(['inactive', 'active']).default('inactive'),
});

/* =====================================================
   2️⃣ Schéma ACTIVATION – requis pour activer la branche
===================================================== */

export const branchActivationSchema = branchBaseSchema.extend({
  opening_hour: z.string().uuid('Opening hour is required'),
  holidays: z
    .array(z.string().uuid('Holiday must be a valid UUID'))
    .min(1, 'At least one holiday is required'),
}).refine(
  (data) => data.status === 'active',
  {
    message: 'Branch must be active to apply this validation',
    path: ['status'],
  }
);

/* =====================================================
   3️⃣ Schéma DYNAMIQUE (optionnel mais très pratique)
===================================================== */

export const branchSchemaByMode = (mode: 'create' | 'activate') =>
  mode === 'activate' ? branchActivationSchema : branchBaseSchema;

/* =====================================================
   Types TypeScript
===================================================== */

// Données utilisées dans les formulaires
export type BranchDataBase = z.infer<typeof branchBaseSchema>;

// Données complètes pour activation
export type BranchActivationData = z.infer<typeof branchActivationSchema>;

// Données API
export interface BranchData {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  status: "active" | "inactive";
  
  // Location
  department_code: DepartmentCode;
  city: string;
  
  // Staff
  number_of_posts: number;
  number_of_tellers: number;
  number_of_clerks: number;
  number_of_credit_officers: number;
  
  opening_date: string;
  
  // References
  opening_hour?: string; // UUID reference
  holidays?: string[]; // UUID array
  
  // Détails retournés par l'API (populate)
  opening_hour_details?: OpeningHour;
  holidays_details?: Holiday[];
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

export type BranchFromAPI = BranchData & { id: string };

// Gestion des erreurs
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;