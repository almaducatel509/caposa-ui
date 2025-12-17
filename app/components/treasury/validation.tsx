import { z } from 'zod';

export const treasurySchema = z.object({
  id: z.string().uuid().optional(),
  member_id: z.string(),
  branch_id: z.string(),
  employee_id: z.string(),
  totalCash: z.number().optional(),
  loan_id: z.string().optional(),
  type: z.enum(['deposit', 'withdrawal', 'transfer', 'loan']),
  amount: z.number().nonnegative(),
  status: z.enum(['pending', 'completed', 'failed', 'processing']),
  description: z.string().optional(),
  created_at: z.string().or(z.date()).optional(),
  updated_at: z.string().or(z.date()).optional(),
});


// Types
export interface TreasuryData {
  id: string;
  member_id: string;
  branch_id: string;
  employee_id: string;
  loan_id?: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  description: string;
  created_at: string;
  updated_at?: string;
  totalCash: number;
}

export interface TreasuryOperation {
  id: string;
  transaction_id?: string;
  type: 'cash_in' | 'cash_out' | 'transfer';
  amount: number;
  date: string;
  description: string;
  performed_by: string;
  status: 'completed' | 'pending';

  // 🔗 Relations
  member_id?: string;
  account_number?: string;
  employee_id?: string;
  branch_id?: string;
  loan_id?: string;
}
