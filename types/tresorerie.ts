// Types pour le module Trésorerie

export interface CashHandover {
  id: string;
  amount: number;
  handed_by: string;          // employee_id
  verified_by: string;        // employee_id
  received_by: string;        // employee_id
  
  // Signatures numériques
  handed_by_signature: string;
  verified_by_signature: string;
  received_by_signature: string;
  
  // Métadonnées
  branch_id: string;
  handover_date: string;
  created_at: string;
  status: 'draft' | 'confirmed' | 'locked';
  notes?: string;
  
  // Audit
  is_locked: boolean;
}
 

export interface CashSession {
  id: string;
  employee_id: string;
  branch_id: string;
  opening_amount: number;
  closing_amount?: number;
  difference?: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
}

export interface CashMovement {
  id: string;
  session_id?: string;
  employee_id: string;
  branch_id: string;
  type: 'cash_in' | 'cash_out' | 'transfer_in' | 'transfer_out';
  amount: number;
  description: string;
  reference?: string;
  signed_by: string;
  created_at: string;
  is_locked: boolean;
}

export interface VaultDeclaration {
  id: string;
  branch_id: string;
  declaration_date: string;
  physical_amount: number;
  reserve_amount: number;
  sealed_envelopes_amount: number;
  total_vault: number;
  declared_by: string;
  created_at: string;
}

export interface DailyClosing {
  id: string;
  branch_id: string;
  closing_date: string;
  cash_total: number;
  vault_total: number;
  physical_total: number;
  theoretical_total: number;
  difference: number;
  comment?: string;
  closed_by: string;
  created_at: string;
  is_locked: boolean;
}

export interface Reconciliation {
  id: string;
  daily_closing_id: string;
  branch_id: string;
  reconciliation_date: string;
  theoretical_cash: number;
  declared_cash: number;
  difference: number;
  status: 'pending' | 'validated' | 'rejected';
  explanation?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity: 'cash_handover' | 'cash_session' | 'cash_movement' | 'vault_declaration' | 'daily_closing' | 'reconciliation';
  entity_id: string;
  action: AuditAction;
  performed_by: string;
  timestamp: string;
  before_state?: object;
  after_state?: object;
  ip_address?: string;
  user_agent?: string;
}

export enum AuditAction {
  HANDOVER_CREATED = 'handover_created',
  SIGNATURE_ADDED = 'signature_added',
  HANDOVER_CONFIRMED = 'handover_confirmed',
  HANDOVER_LOCKED = 'handover_locked',
  MODIFICATION_ATTEMPTED = 'modification_attempted',
  SESSION_OPENED = 'session_opened',
  SESSION_CLOSED = 'session_closed',
  MOVEMENT_CREATED = 'movement_created',
  CLOSING_PERFORMED = 'closing_performed',
  RECONCILIATION_VALIDATED = 'reconciliation_validated',
  RECONCILIATION_REJECTED = 'reconciliation_rejected'
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email?: string;
  branch_id?: string;
}

export interface TreasuryStats {
  cashAvailable: number;
  vaultBalance: number;
  todayInflow: number;
  todayOutflow: number;
  pendingReconciliation: number;
  lastHandover?: {
    date: string;
    amount: number;
    handedBy: string;
    receivedBy: string;
  };
}

interface HandoverData {
  amount: number;
  handedBy: string;
  verifiedBy: string;
  receivedBy: string;
  notes?: string;
}

interface Signatures {
  handedBy: boolean;
  verifiedBy: boolean;
  receivedBy: boolean;
}

