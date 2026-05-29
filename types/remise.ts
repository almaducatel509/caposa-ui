// ─── Types partagés Remise ─────────────────────────────────────────────────
// Fichier central : importer depuis ici dans RemisesTable et AnomalieModal

export type Decision = 'approved' | 'rejected';
export type AnomalieResolution = 'justified' | 'imputed';

export interface AnomalieDecision {
  resolution: AnomalieResolution;  // 'justified' | 'imputed'
  note: string;                    // obligatoire dans les deux cas
  amount?: number;                 // montant justifié (résolution = 'justified' seulement)
}

export interface Remise {
  id: string;
  session_id: string;
  date: string;          // 'YYYY-MM-DD'
  time: string;          // 'HHhMM'
  amount: number;
  anomaly: boolean;
  late_days: number;
  cashier:     { name: string; initials: string };
  verified_by: { name: string; initials: string };
  // Présents après décision
  decision?:          Decision;
  decided_at?:        string;
  decided_by?:        string;
  reject_reason?:     string;
  // Présents si anomalie traitée
  anomalie_decision?: AnomalieDecision;
}

// ─── Shape attendue par l'API ──────────────────────────────────────────────
//
//  GET  /api/treasury/handovers?status=pending   → Remise[]
//  GET  /api/treasury/handovers?status=archived  → Remise[]
//
//  POST /api/treasury/handovers/:id/decide
//    body: { decision: Decision, reject_reason?: string, anomalie?: AnomalieDecision }
//    → Remise (mise à jour)