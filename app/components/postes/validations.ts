import { z } from 'zod';

export const postSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  deposit: z.boolean(),
  withdrawal: z.boolean(),
  transfer: z.boolean(),  // ← anglais (cohérent avec l'API)
});

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
export type PostDataBase = z.infer<typeof postSchema>;

export interface PostData {
  id: string;
  name: string;
  description: string;
  deposit: boolean;
  withdrawal: boolean;
  transfer: boolean;          // ← corrigé : transfer (pas transfer)
  post_name?: string;         // optionnel pour rétrocompatibilité
  created_at?: string;
  updated_at?: string;
}