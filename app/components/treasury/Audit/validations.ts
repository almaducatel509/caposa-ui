import z from "zod";
//Audit
export const reconciliationSchema = z.object({
  id: z.string().uuid().optional(),
  branch_id: z.string(),

  date: z.string().or(z.date()),

  theoretical_cash: z.number().nonnegative(),
  declared_cash: z.number().nonnegative(),
  difference: z.number(),

  explanation: z.string().optional(),

  status: z.enum(["pending", "validated", "rejected"]).default("pending"),

  validated_by: z.string().optional(),
  validated_at: z.string().or(z.date()).optional(),
});

export const auditLogSchema = z.object({
  id: z.string().uuid().optional(),

  action: z.enum([
    "create",
    "update",
    "delete",
    "validate",
    "reject",
    "close_day",
    "declare_vault",
    "cash_movement",
  ]),

  entity: z.enum([
    "cash_movement",
    "vault_declaration",
    "daily_closing",
    "reconciliation",
  ]),

  entity_id: z.string(),

  performed_by: z.string(),
  branch_id: z.string(),

  timestamp: z.string().or(z.date()).optional(),
  details: z.string().optional(),
});

export interface Reconciliation {
  id?: string;
  branch_id: string;

  date: string | Date;

  theoretical_cash: number;
  declared_cash: number;
  difference: number;

  explanation?: string;

  status: "pending" | "validated" | "rejected";

  validated_by?: string;
  validated_at?: string | Date;
}

export interface AuditLog {
  id?: string;

  action:
    | "create"
    | "update"
    | "delete"
    | "validate"
    | "reject"
    | "close_day"
    | "declare_vault"
    | "cash_movement";

  entity:
    | "cash_movement"
    | "vault_declaration"
    | "daily_closing"
    | "reconciliation";

  entity_id: string;

  performed_by: string;
  branch_id: string;

  timestamp?: string | Date;
  details?: string;
}
