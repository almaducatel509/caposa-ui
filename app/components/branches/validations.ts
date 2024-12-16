import { z } from 'zod';

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

export const validateFields = (data: BranchData) => {
  const errors: string[] = [];

  // Vérifiez les chaînes obligatoires
  if (!data.branch_name) errors.push("Branch name is required.");
  if (!data.branch_address) errors.push("Branch address is required.");
  if (!data.branch_phone_number) errors.push("Branch phone number is required.");
  if (!data.branch_email || !/\S+@\S+\.\S+/.test(data.branch_email)) {
    errors.push("Branch email is invalid or missing.");
  }

  // Vérifiez les nombres
  if (data.number_of_posts <= 0) errors.push("Number of posts must be greater than 0.");
  if (data.number_of_tellers <= 0) errors.push("Number of tellers must be greater than 0.");
  if (data.number_of_clerks <= 0) errors.push("Number of clerks must be greater than 0.");
  if (data.number_of_credit_officers <= 0) errors.push("Number of credit officers must be greater than 0.");

  // Vérifiez la date
  if (!data.opening_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.opening_date)) {
    errors.push("Opening date must be in YYYY-MM-DD format.");
  }

  // Vérifiez l'UUID pour `opening_hour`
  if (!data.opening_hour || !/^[0-9a-fA-F-]{36}$/.test(data.opening_hour)) {
    errors.push("Opening hour must be a valid UUID.");
  }

  // Vérifiez les UUID dans `holidays`
  if (!Array.isArray(data.holidays) || data.holidays.length === 0) {
    errors.push("Holidays must contain at least one valid UUID.");
  } else if (data.holidays.some((id) => !/^[0-9a-fA-F-]{36}$/.test(id))) {
    errors.push("Holidays must be an array of valid UUIDs.");
  }

  return errors;
};

export interface BranchData extends z.infer<typeof branchSchema> {};

// Generic type for handling error messages
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;
