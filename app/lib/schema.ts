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
