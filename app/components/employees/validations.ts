import { z } from "zod";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

export const employeeSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(3, 'Password must be at least 3 characters long'),
  confirm_password: z.string().min(3, 'Please confirm your password'),
  email: z.string().email('Invalid email format'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  phone_number: z.string().regex(/^\d+$/, 'Phone number must only contain digits'),
  address: z.string().min(1, 'Address is required'),
  gender: z.string().min(1, "Sélection du sexe est requise"),
  payment_ref: z.string().min(1, 'Payment reference is required'),
  branch: z.string().uuid('Branch must be a valid UUID'),
  posts: z.array(z.string().uuid('Post must be a valid UUID')).min(1, 'At least one post is required'),
  photo_profil: imageSchema.optional().nullable(),
})
.refine((data) => data.password === data.confirm_password, {
  path: ['confirm_password'],
  message: 'Passwords must match',
});
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
