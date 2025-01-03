import { z } from "zod";
const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);
export const step1Schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(3, 'Password must be at least 3 characters long'),
  confirm_password: z.string().min(3),
  email: z.string().email('Invalid email format'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birthday: z.string().min(1, 'Date of birth is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  phone_number: z.string().regex(/^\d+$/, 'Phone number must only contain digits'),
  address: z.string().min(1, 'Address is required'),
  gender: z.string().min(1, 'Gender is required'),
  payment_ref: z.string().optional(), // Payment reference is optional
  photo_profil: imageSchema.optional(),
  branch: z.string().uuid('Branch must be a valid UUID'), // Single branch
  posts: z.array(z.string().uuid('Post must be a valid UUID')).min(1, 'At least one post is required'), // Multiple posts
});
// Schéma pour Step2Data
export const step2Schema = step1Schema; // Structure similaire pour Step2Data

// Schéma pour Step3Data (vide pour l'instant)
export const step3Schema = z.object({});

export const formSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

export interface Step1Data extends z.infer<typeof step1Schema> {}
export interface Step2Data extends z.infer<typeof step2Schema> {
  step1: any;
}
export interface Step3Data extends z.infer<typeof step3Schema> {}

export type EmployeeFormData = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
};

export type ErrorMessages<T> = Partial<Record<keyof T, string>>;



