import { z } from 'zod';

// Define the schema for the salary range
const salaryRangeSchema = z.object({
  min: z.number().nonnegative("Minimum salary must be a non-negative number"),
  max: z.number().nonnegative("Maximum salary must be a non-negative number"),
}).refine(data => data.min <= data.max, {
  message: "Minimum salary must be less than or equal to maximum salary",
  path: ["min"],
});

// Define the schema for the Post interface
export const postSchema = z.object({
  post_id: z.string().min(0,"Post ID is required"),
  post_name: z.string().min(6,"Post name is required"),
  post_description: z.string().min(6,"Post description is required"),
  responsibilities: z.string(z.string()).min(10,"Responsibilities are required"),
  is_active: z.boolean(),
});
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

// Define the type for the Post interface
export type Post = z.infer<typeof postSchema>;
