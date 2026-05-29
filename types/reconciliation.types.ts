//reconciliation.types.ts — tous les types + les commentaires d'API endpoints.
// ─── Types Réconciliation ──────────────────────────────────────────────────
//
//  API shape attendue :
//  GET  /api/treasury/reconciliation/status       → ReconciliationStatus
//  POST /api/treasury/reconciliation/start        → ReconciliationReport
//  GET  /api/treasury/reconciliation/:date        → ReconciliationReport
//  POST /api/treasury/reconciliation/ecart/:id/explain → Ecart (mis à jour)

export type EcartStatut = 'en_attente' | 'explique' | 'accepte';
export type EcartSource = 'comptage' | 'transaction' | 'bordereau' | 'autre';

export interface Ecart {
  id: string;
  source: EcartSource;
  label: string;               // ex : "Cash en caisse — Comptage final"
  attendu: number;
  reel: number;
  ecart: number;               // reel - attendu (négatif = manque)
  statut: EcartStatut;
  note?: string;               // explication du trésorier
}

export interface SessionReconciliation {
  session_id: string;
  cashier_name: string;
  cashier_initials: string;
  cash_ouverture: number;
  cash_theorique: number;      // calculé par le backend selon transactions
  cash_reel: number;           // compté physiquement par la caissière
  ecart: number;               // cash_reel - cash_theorique
  ecarts: Ecart[];             // détail des écarts de cette session
  statut: 'ok' | 'ecart' | 'explique';
}

export interface ReconciliationReport {
  date: string;                // 'YYYY-MM-DD'
  branch_id: string;
  branch_name: string;
  sessions: SessionReconciliation[];
  // Totaux consolidés
  total_ouverture: number;
  total_theorique: number;
  total_reel: number;
  ecart_total: number;
  // Statut global
  can_submit: boolean;         // true quand tous les écarts sont expliqués
  submitted_at?: string;
  submitted_by?: string;
}

export interface ReconciliationStatus {
  can_reconcile: boolean;
  pending_remises: number;     // bloquant si > 0
  date: string;
}