import axios from 'axios';
import { z } from 'zod';

const FormSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  date_of_birthday: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  ville: z.string().min(1, 'Ville is required'),
  departement: z.string().min(1, 'Departement is required'),
  accountType: z.string().min(1, 'Account type is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  currentBalance: z.number().positive('Current balance must be a positive number'),
  securityInfo: z.string().optional(),
  preferences: z.array(z.string()).optional(),
  status: z.enum(['active', 'desactive']),
  identityPhoto: z.instanceof(File).refine((file) => file.size > 0, {
    message: 'Identity photo is required',
  }),
})

export type State = {
    errors?: {
      [key: string]: string[];
    };
    message?: string | null;
};


export const departments = [
  { key: "artibonite", label: "Artibonite" },
  { key: "centre", label: "Centre" },
  { key: "grandAnse", label: "Grand'Anse" },
  { key: "nippes", label: "Nippes" },
  { key: "nord", label: "Nord" },
  { key: "nordEst", label: "Nord-Est" },
  { key: "nordOuest", label: "Nord-Ouest" },
  { key: "ouest", label: "Ouest" },
  { key: "sud", label: "Sud" },
  { key: "sudEst", label: "Sud-Est" }
];


export async function createMember(formData: FormData) {
  // Prepare data for insertion into the database
  // axios.post('/${process.env.BASE_ROUTE}/users/', {
  //   username :"polo",
  //   email :'polo@gmail.com'
  // })
  // .then(function (response) {
  //   console.log(response);
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });
  
    // Validate form using Zod
    const validatedFields = FormSchema.safeParse({
      member_id: formData.get('memberId') as string, // Ajout du champ memberId
      first_name: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      date_of_birthday: new Date(formData.get('dateOfBirth') as string), // Conversion en date
      address: formData.get('address') as string,
      phone: formData.get('phone') as string, // Ajout du champ phone
      gender: formData.get('gender') ? formData.get('gender') as string : '', // Ajout du champ gender avec vérification
      ville: formData.get('ville') as string, // Ajout du champ ville
      account_type: formData.get('accountType') as string,
      account_number: formData.get('accountNumber') as string,
      current_balance: parseFloat(formData.get('currentBalance') as string), // Conversion en nombre
      security_info: formData.get('securityInfo') as string,
      preferences: (formData.get('preferences') as string).split(','), // Supposant que les préférences sont séparées par des virgules
      status: formData.get('status') as 'active' | 'desactive',
      identity_hoto: formData.get('identityPhoto') as File, // Ajout du champ identityPhoto
      demande_pecifique: formData.get('demandeSpecifique') as 'prêt' | 'retrait' | 'transfert', // Décommentez si nécessaire
});
    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Member.',
        };
      }
  

}