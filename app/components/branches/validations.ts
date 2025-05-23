// Dans votre fichier validations.ts, ajoutez ces interfaces

import { z } from 'zod';

// Interface pour les heures d'ouverture
export interface OpeningHour {
  id: string;
  schedule: string;
  // Ajouter d'autres champs si nécessaire
}

// Interface pour les jours fériés
export interface Holiday {
  id: string;
  date: string;
  description: string;
  // Ajouter d'autres champs si nécessaire
}

export const branchSchema = z.object({
  branch_name: z.string().min(1, 'Branch name is required'),
  branch_address: z.string().min(1, 'Branch address is required'),
  branch_phone_number: z.string().min(1, 'Branch phone number is required'),
  branch_email: z.string().email('Invalid email format'),
  number_of_posts: z.number().min(1, 'Number of posts must be at least 1'),
  number_of_tellers: z.number().min(1, 'Number of tellers must be at least 1'),
  number_of_clerks: z.number().min(1, 'Number of clerks must be at least 1'),
  number_of_credit_officers: z.number().min(1, 'Number of credit officers must be at least 1'),
  opening_date: z.string().min(1, 'Opening date is required'),
  opening_hour: z.string().uuid('Opening hour must be a valid UUID'),
  holidays: z.array(z.string().uuid('Holiday must be a valid UUID')).min(1, 'At least one holiday is required'),
});

// Type de base pour les données de branche
export type BranchDataBase = z.infer<typeof branchSchema>;

// Interface étendue qui inclut les champs facultatifs retournés par l'API
export interface BranchData extends BranchDataBase {
  id?: string;
  branch_code?: string;
  created_at?: string;
  updated_at?: string;
}

// Type pour les erreurs
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;