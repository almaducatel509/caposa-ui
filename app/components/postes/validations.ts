import { z } from 'zod';

// Define the schema based on the API structure
export const postSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  deposit: z.boolean(),
  withdrawal: z.boolean(),
  transfer: z.boolean(),
});

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

// Define the type for the Post interface
export type Post = z.infer<typeof postSchema>;
