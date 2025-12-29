import { DepartmentCode } from "@/app/data/haitiLocations";

export interface OpeningHour {
  id: string;
  schedule: string;
}

export interface Holiday {
  id: string;
  date: string;
  description: string;
}

export interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  status: "active" | "inactive";
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
}
