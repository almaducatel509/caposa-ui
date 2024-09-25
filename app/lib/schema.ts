import { z } from 'zod'

export const FormDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  memberId: z.string().min(1, "ID number is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  address: z.string().min(1, "Address is required"),
  department: z.string().min(1, "Departement is required"),
  ville: z.string().min(1, 'Ville is required'),
  bankBranch: z.string().min(1, "Bank branch is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  uploadLetter: z.any().refine(file => file?.size > 0, "Letter of introduction is required"),
  accountType: z.string().min(1, 'accountType is required'),
  demandeSpecifique: z.string().min(1, 'phone is required'),
  currentBalance:z.string().min(1, 'currentBalance is required'),
  identityPhoto: z.instanceof(File).refine((file) => file.size > 0, {
    message: 'Identity photo is required',
  }),
})


// Define the schema for branch form data
export const BranchFormDataSchema = z.object({
  opening_hours: z.object({
    sunday: z.string().min(1, "Sunday hours are required"),
    monday: z.string().min(1, "Monday hours are required"),
    tuesday: z.string().min(1, "Tuesday hours are required"),
    wednesday: z.string().min(1, "Wednesday hours are required"),
    thursday: z.string().min(1, "Thursday hours are required"),
    friday: z.string().min(1, "Friday hours are required"),
    saturday: z.string().min(1, "Saturday hours are required"),
  }),
  holidays: z.object({
    date: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  branch_name: z.string().min(1, "Branch name is required"),
  branch_address: z.string().min(1, "Branch address is required"),
  branch_phone_number: z.string().min(1, "Branch phone number is required"),
  branch_email: z.string().min(1, "Branch email is required").email("Invalid email format"),
  branch_manager_id: z.string().min(1, "Branch manager ID is required"),
  branch_code: z.string().min(1, "Branch code is required"),
  number_of_posts: z.number().min(1, "Number of posts is required"),
  number_of_tellers: z.number().min(1, "Number of tellers is required"),
  number_of_clerks: z.number().min(1, "Number of clerks is required"),
  number_of_credit_officers: z.number().min(1, "Number of credit officers is required"),
  opening_date: z.string().min(1, "Opening date is required"),
});