import { Holiday } from "@/app/components/holidays/validations";
import { DepartmentCode } from "@/app/data/haitiLocations";
//C:\Users\alma2\Documents\Final Project\caposa-ui\types\branche.ts
// export interface OpeningHour {
//   id: string;
//   schedule: string;
// }
export interface OpeningHour {
  id: string;
  name?: string;        // pour l'afficher dans le message
  schedule: string;
  is_default: boolean;  // ← le flag clé
}

export interface Branch {
  name: any;
  id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  statusBranche: "active" | "inactive"| "archive";
  department_code: DepartmentCode;
  city: string;
  number_of_posts: number;
  number_of_tellers: number;
  number_of_clerks: number;
  number_of_credit_officers: number;
  opening_date: string;
  opening_hour: string;
  holidays?: string[];
  opening_hour_details?: OpeningHour;
  holidays_details?: Holiday[];
  created_at?: string;
  updated_at?: string;
  total_staff: number;
  full_address: string;
}
