import { z } from 'zod';

const FormSchema = z.object({
    memberId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.date(),
    address: z.string(),
    phoneNumber: z.string(),
    accountType: z.string(),
    accountNumber: z.string(),
    currentBalance: z.number(),
    securityInfo: z.string(),
    preferences: z.array(z.string()),
    status: z.enum(['active', 'desactive']),
})

export type State = {
    errors?: {
      [key: string]: string[];
    };
    message?: string | null;
};

export async function createMember(formData: FormData) {
    // Validate form using Zod
    const validatedFields = FormSchema.safeParse({
      memberId: formData.get('memberId'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      dateOfBirth: new Date(formData.get('dateOfBirth') as string),
      address: formData.get('address'),
      phoneNumber: formData.get('phoneNumber'),
      accountType: formData.get('accountType'),
      accountNumber: formData.get('accountNumber'),
      currentBalance: parseFloat(formData.get('currentBalance') as string),
      securityInfo: formData.get('securityInfo'),
      preferences: (formData.get('preferences') as string).split(','), // Assuming preferences are comma-separated
      status: formData.get('status') as 'active' | 'desactive',
    });
    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Member.',
        };
      }
  // Prepare data for insertion into the database
  

}