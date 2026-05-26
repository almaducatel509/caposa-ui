// types/treasury.ts
// ─────────────────────────────────────────────────────────────────
// Types pour le dashboard Trésorerie.
// Alignés sur les modèles backend Django (snake_case anglais).
//
// Endpoint cible : GET /api/treasury/dashboard/?branch=<uuid>
// Le backend retourne un objet TreasuryDashboard pré-agrégé pour la branche.
// ─────────────────────────────────────────────────────────────────

// ─── Enums partagés ──────────────────────────────────────────────

export type CurrencyCode = 'HTG' | 'USD' | 'CAD';

export type SessionStatus = 'open' | 'closed';
export type CashboxStatus = 'open' | 'closed';

export type AlertType =
  | 'LOW_CASH'              // Cashbox proche du seuil minimum
  | 'RECONCILIATION_DELAY'  // Session fermée non réconciliée > 24h
  | 'ANOMALY'               // Écart (discrepancy) détecté
  | 'PENDING_VALIDATION'    // Transaction en attente de validation
  | 'UNCLOSED_SESSION';     // Session laissée ouverte hors horaires

export type AlertSeverity = 'critical' | 'warning' | 'info';

// ─── Option de filtre branche (UI) ───────────────────────────────
// Construit côté front à partir de fetchBranches() → BranchData[]

export interface BranchOption {
  id: string;          // UUID de la branche
  name: string;        // branch_name
  city: string;        // ville (pour disambiguer dans la recherche)
}

// ─── Résumés d'entités (versions allégées pour le dashboard) ─────

export interface SessionSummary {
  id: string;
  cashier_username: string;
  cashier_name: string;
  branch_id: string;
  branch_name: string;
  status: SessionStatus;
  opened_at: string;
  closed_at: string | null;
  total_deposits: number;
  total_withdrawals: number;
  total_transfers: number;
  discrepancy: number;
  reconciled: boolean;
}

export interface CashboxSummary {
  id: string;
  cashbox_number: string;
  branch_id: string;
  branch_name: string;
  currency: CurrencyCode;
  status: CashboxStatus;
  opening_balance: number;
  current_balance: number;
  closing_balance: number | null;
  threshold_min: number;
  discrepancy: number | null;
  session_id: string | null;
}

export interface AccountSummary {
  id: string;
  account_number: string;
  account_name: string;
  branch_id: string | null;     // null = compte central, pas lié à une branche
  currency: CurrencyCode;
  balance: number;
  is_active: boolean;
}

// ─── Sections du dashboard ───────────────────────────────────────

export interface CashBalance {
  cash_physical: number;
  bank_accounts: number;
  total_consolidated: number;
  reference_currency: CurrencyCode;
}

export interface DailyFlow {
  date: string;
  total_deposits: number;
  total_withdrawals: number;
  total_transfers: number;
  net_variation: number;
}

export interface LiquidityForecast {
  available_today: number;
  required_tomorrow: number;
  gap: number;
}

export interface TreasuryAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  related_entity: string | null;
  related_entity_id: string | null;
  branch_id: string | null;        // null = alerte transversale
  created_at: string;
  action_url: string | null;
}

export interface SessionsOverview {
  open_sessions: number;
  unreconciled_sessions: number;
  anomaly_sessions: number;
}

export interface CurrencyPosition {
  currency_code: CurrencyCode;
  available_amount: number;
  internal_rate: number;
  rate_date: string;
}

// ─── Réponse complète de l'API ───────────────────────────────────

export interface TreasuryDashboard {
  branch_id: string;               // branche pour laquelle ces données sont calculées
  branch_name: string;
  cash_balance: CashBalance;
  daily_flow: DailyFlow;
  liquidity_forecast: LiquidityForecast;
  alerts: TreasuryAlert[];
  sessions_overview: SessionsOverview;
  currency_positions: CurrencyPosition[];
  generated_at: string;
}