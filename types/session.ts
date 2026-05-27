// types/session.ts
import type { EmployeeData } from '@/app/components/employees/validations';
import { Branch } from './branche';

export interface Session {
  id: string;
  employee_id: string;
  branch_id: string;
  terminal_id?: string;
  opened_at: string;            // ISO
  closed_at?: string;           // ISO, null si session encore ouverte
  status: 'open' | 'closed';
  opening_amount?: number;      // fonds de caisse initial
  closing_amount?: number;      // montant compté à la fermeture

  // Objets joints (optionnels — backend les inclut sur demande)
  employee?: EmployeeData;
  branch?: Branch;
  created_at?: string;
  updated_at?: string;
}