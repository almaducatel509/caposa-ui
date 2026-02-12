import { z } from "zod";

// ===== ENCAISSE / COFFRE =====

export const cashMovementSchema = z.object({
  id: z.string().uuid().optional(),
  branch_id: z.string().min(1, "Succursale requise"),
  employee_id: z.string().min(1, "Employé requis"),

  type: z.enum(["cash_in", "cash_out", "transfer_in", "transfer_out"]),
  amount: z.number().positive("Le montant doit être strictement positif"),

  source: z.enum([
    "member_transaction",
    "bank_deposit",
    "internal_transfer",
    "correction",
  ]),

  description: z.string().optional(),
  reference_document: z.string().optional(), // Numéro de bordereau

  created_at: z.coerce.date().default(() => new Date()),
  signed_by: z.string().min(1, "Signature requise"),
  
  // Nouveau : pour traçabilité
  is_locked: z.boolean().default(false), // Verrouillé après clôture
}).refine(
  (data) => {
    // R2.4 : Validation des sources selon le type
    if (data.type === "cash_in" && data.source === "correction") {
      return data.description !== undefined;
    }
    return true;
  },
  { message: "Une correction doit avoir une description" }
);

export const vaultDeclarationSchema = z.object({
  id: z.string().uuid().optional(),
  branch_id: z.string().min(1),
  employee_id: z.string().min(1),

  physical_amount: z.number().nonnegative("Montant physique invalide"),
  reserve_amount: z.number().nonnegative().default(0),
  sealed_envelopes_amount: z.number().nonnegative().default(0),

  // R2.10 : Calcul automatique du total
  total_vault: z.number().nonnegative().optional(),

  declared_at: z.coerce.date().default(() => new Date()),
  signed_by: z.string().min(1, "Signature requise"),
  
  // Nouveau : pour unicité quotidienne
  declaration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
}).transform((data) => ({
  ...data,
  total_vault: data.physical_amount + data.reserve_amount + data.sealed_envelopes_amount,
}));

export const dailyClosingSchema = z.object({
  id: z.string().uuid().optional(),
  branch_id: z.string().min(1),
  employee_id: z.string().min(1),

  cash_total: z.number().nonnegative("Encaisse invalide"),
  vault_total: z.number().nonnegative("Coffre invalide"),
  physical_total: z.number().nonnegative(),

  theoretical_total: z.number().nonnegative(),
  difference: z.number(),

  // R2.14 : Commentaire obligatoire si écart
  comment: z.string().optional(),

  closed_at: z.coerce.date().default(() => new Date()),
  signed_by: z.string().min(1),
  
  // Nouveau : statut de la clôture
  is_validated: z.boolean().default(false),
  closing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine(
  (data) => {
    if (Math.abs(data.difference) > 0 && !data.comment) {
      return false;
    }
    return true;
  },
  { 
    message: "Un commentaire est obligatoire en cas d'écart",
    path: ["comment"]
  }
).transform((data) => ({
  ...data,
  physical_total: data.cash_total + data.vault_total,
}));

// ===== RÉCONCILIATION =====

export const reconciliationSchema = z.object({
  id: z.string().uuid().optional(),
  branch_id: z.string().min(1),
  daily_closing_id: z.string().uuid("Clôture liée requise"), // Nouveau

  date: z.coerce.date(),

  theoretical_cash: z.number().nonnegative(),
  declared_cash: z.number().nonnegative(),
  difference: z.number(),

  // R3.4 : Explication obligatoire si rejet
  explanation: z.string().optional(),
  supporting_document: z.string().optional(), // URL/référence pièce justificative

  status: z.enum(["pending", "validated", "rejected"]).default("pending"),

  validated_by: z.string().optional(),
  validated_at: z.coerce.date().optional(),
  
  // Nouveau : pour escalade
  escalated_to: z.string().optional(), // ID superviseur
  escalation_reason: z.string().optional(),
}).refine(
  (data) => {
    // R3.4 : Explication obligatoire si rejet
    if (data.status === "rejected" && !data.explanation) {
      return false;
    }
    return true;
  },
  {
    message: "Une explication est obligatoire pour un rejet",
    path: ["explanation"]
  }
).refine(
  (data) => {
    // R3.7 : Traçabilité validation
    if (data.status !== "pending" && (!data.validated_by || !data.validated_at)) {
      return false;
    }
    return true;
  },
  {
    message: "La validation doit être tracée (par qui et quand)",
    path: ["validated_by"]
  }
);

// ===== AUDIT =====

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
    "escalate", // Nouveau
    "export_report", // Nouveau
  ]),

  entity: z.enum([
    "cash_movement",
    "vault_declaration",
    "daily_closing",
    "reconciliation",
    "overview_report", // Nouveau
  ]),

  entity_id: z.string().min(1),

  performed_by: z.string().min(1, "Utilisateur requis"),
  branch_id: z.string().min(1),

  timestamp: z.coerce.date().default(() => new Date()),
  details: z.string().optional(),
  
  // Nouveau : pour audit avancé
  ip_address: z.string().ip().optional(),
  user_role: z.string().optional(),
  before_state: z.record(z.any()).optional(), // État avant modification
  after_state: z.record(z.any()).optional(),  // État après modification
}).refine(
  (data) => {
    // R4.4 : Détails obligatoires pour certaines actions
    const requiresDetails = ["delete", "reject", "escalate"];
    if (requiresDetails.includes(data.action) && !data.details) {
      return false;
    }
    return true;
  },
  {
    message: "Des détails sont requis pour cette action",
    path: ["details"]
  }
);

// ===== TYPES TYPESCRIPT =====

export type CashMovement = z.infer<typeof cashMovementSchema>;
export type VaultDeclaration = z.infer<typeof vaultDeclarationSchema>;
export type DailyClosing = z.infer<typeof dailyClosingSchema>;
export type Reconciliation = z.infer<typeof reconciliationSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;

// ===== CONSTANTES MÉTIER =====

export const TREASURY_CONSTANTS = {
  MAX_DAILY_CLOSING_DIFFERENCE: 1000, // Seuil alerte écart (en unité monétaire)
  MIN_VAULT_AMOUNT: 10000, // Seuil minimum coffre
  MAX_VAULT_AMOUNT: 500000, // Seuil maximum coffre
  PRINT_THRESHOLD: 5000, // Montant à partir duquel imprimer bordereau
  AUDIT_RETENTION_YEARS: 7,
  TOLERANCE_PERCENTAGE: 0.5, // 0.5% de tolérance sur écarts
} as const;