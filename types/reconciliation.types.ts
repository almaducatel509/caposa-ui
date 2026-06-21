// ─── Types Réconciliation ──────────────────────────────────────────────────
//
//  La réconciliation N'EST PAS une action du trésorier — c'est une vue de
//  santé automatique, en lecture seule, qui agrège ce qui a déjà été décidé
//  à l'étape Remise (par terminal/session). Aucun écart n'est "à traiter"
//  ici : un écart présent est déjà justifié ou imputé (voir Handover).
//
//  API shape attendue :
//  GET /api/treasury/reconciliation/?branch=<uuid>&date=YYYY-MM-DD
//    → ReconciliationReport
//    → 200 avec sessions: [] si aucune remise n'existe encore pour la branche/date
//      (PAS une erreur — c'est un état normal en début de journée)

export type HandoverDecision = 'approved' | 'rejected';

export interface SessionReconciliation {
  session_id: string;
  cashier_name: string;
  cashier_initials: string;
  cash_ouverture: number;     // fonds donné le matin (Handover.opening_amount)
  cash_theorique: number;     // attendu selon transactions système
  cash_fermeture: number;     // réellement remis le soir (Handover.amount)
  ecart: number;               // cash_fermeture - cash_theorique, déjà tranché en remise
  decision: HandoverDecision;  // déjà décidé en remise — affiché en lecture seule
}

export interface ReconciliationReport {
  date: string;                 // 'YYYY-MM-DD'
  branch_id: string;
  branch_name: string;
  total_ouverture: number;
  total_fermeture: number;
  total_theorique: number;
  ecart_total: number;
  sessions: SessionReconciliation[];
}