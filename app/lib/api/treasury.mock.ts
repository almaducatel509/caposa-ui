// ─── treasury.mock.ts ─────────────────────────────────────────────────────────
//
//  SOURCE DE VÉRITÉ UNIQUE — les deux pages piochent ici.
//
//  Quand l'API est prête, remplacer ce fichier par :
//    export const fetchRemises  = (status) => fetch(`/api/treasury/handovers?status=${status}`).then(r => r.json())
//    export const fetchDashboard = ()        => fetch('/api/treasury/dashboard').then(r => r.json())
//    export const fetchReconReport = ()      => fetch('/api/treasury/reconciliation/start', { method: 'POST' }).then(r => r.json())
//
//  Les composants n'ont pas besoin de changer — ils appellent ces fonctions.

import { SessionReconciliation, ReconciliationReport } from '@/types/reconciliation.types';
import { Remise } from '@/types/remise';
import {
  TreasuryDashboard,
  CurrencyCode,
} from '@/types/tresorerie';

// ─── 1. Remises (source primaire) ─────────────────────────────────────────────
//
//  Chaque remise = une session fermée par une caissière.
//  statut 'archived' = remise validée par le trésorier → alimente la réconciliation.

export const MOCK_REMISES_PENDING: Remise[] = [
  // Ces remises sont en attente de décision du trésorier
  // Elles ne sont PAS encore dans la réconciliation
];

export const MOCK_REMISES_ARCHIVED: Remise[] = [
  {
    id: 'REM-041',
    session_id: 'SES-0041',
    date: '2026-05-29',
    time: '17h30',
    opening_amount: 50_000,
    amount: 80_000,
    anomaly: true,
    late_days: 0,
    cashier:     { name: 'Marie Dupont',    initials: 'MD' },
    verified_by: { name: 'Jean Dupont',     initials: 'JD' },
    decision: 'approved',
    decided_at: '09h54',
    decided_by: 'Réginald T.',
    anomalie_decision: {
      resolution: 'imputed',
      note: 'Billet déchiré non signalé. Imputé à la caissière.',
    },
  },
  {
    id: 'REM-043',
    session_id: 'SES-0043',
    date: '2026-05-29',
    time: '17h45',
    opening_amount: 50_000,
    amount: 45_200,
    anomaly: false,
    late_days: 0,
    cashier:     { name: 'Sophie Lavoie',   initials: 'SL' },
    verified_by: { name: 'Luc Gagnon',      initials: 'LG' },
    decision: 'approved',
    decided_at: '09h54',
    decided_by: 'Réginald T.',
  },
  {
    id: 'REM-044',
    session_id: 'SES-0044',
    date: '2026-05-28',
    time: '17h15',
    opening_amount: 50_000,
    amount: 112_500,
    anomaly: true,
    late_days: 0,
    cashier:     { name: 'Claire Bergeron', initials: 'CB' },
    verified_by: { name: 'Paul Martin',     initials: 'PM' },
    decision: 'approved',
    decided_at: '09h53',
    decided_by: 'Réginald T.',
    anomalie_decision: {
      resolution: 'justified',
      note: 'Frais bancaire de 500 HTG confirmé par relevé.',
      amount: 500,
    },
  },
];

// ─── 2. Réconciliation (dérivée des remises archived) ─────────────────────────
//
//  Règle métier :
//    session.cash_reel      = remise.amount  (ce que la caissière a remis physiquement)
//    session.cash_theorique = calculé par le backend selon les transactions de la session
//    session.ecart          = cash_reel - cash_theorique
//
//  Le backend fait : SELECT SUM(cash_theorique), SUM(cash_reel) FROM sessions WHERE date = today AND branch_id = X
//  Ici on simule ce calcul directement depuis les remises.

const buildSession = (
  remise: Remise,
  cash_theorique: number,
  ecarts: SessionReconciliation['ecarts'],
): SessionReconciliation => {
  const cash_reel = remise.amount;
  const ecart     = cash_reel - cash_theorique;
  return {
    session_id:       remise.session_id,
    cashier_name:     remise.cashier.name,
    cashier_initials: remise.cashier.initials,
    cash_ouverture:   50_000,          // fonds de caisse standard (viendra de session.opening_amount)
    cash_theorique,
    cash_reel,
    ecart,
    statut: ecarts.some(e => e.statut === 'en_attente')
      ? 'ecart'
      : ecart !== 0 ? 'explique' : 'ok',
    ecarts,
  };
};

export const MOCK_RECONCILIATION: ReconciliationReport = (() => {
  // Sessions construites depuis les remises archivées
  const sessions: SessionReconciliation[] = [

    // Marie Dupont — SES-0041 — écart de −30 HTG
    buildSession(MOCK_REMISES_ARCHIVED[0], 107_130, [
      {
        id: 'ECR-001',
        source: 'comptage',
        label: 'Cash en caisse — Comptage final',
        attendu: 0, reel: 30, ecart: -30,
        statut: 'en_attente',
      },
      {
        id: 'ECR-002',
        source: 'bordereau',
        label: 'Bordereau BDP-2026-002',
        attendu: 0, reel: 20, ecart: -20,
        statut: 'explique',
        note: 'Frais bancaire de 20 HTG déduit automatiquement par la banque. Confirmé par email.',
      },
    ]),

    // Sophie Lavoie — SES-0043 — aucun écart
    buildSession(MOCK_REMISES_ARCHIVED[1], 45_200, []),

    // Claire Bergeron — SES-0044 — aucun écart
    buildSession(MOCK_REMISES_ARCHIVED[2], 112_500, []),
  ];

  const total_theorique = sessions.reduce((s, r) => s + r.cash_theorique, 0);
  const total_reel      = sessions.reduce((s, r) => s + r.cash_reel,      0);
  const total_ouverture = sessions.reduce((s, r) => s + r.cash_ouverture, 0);
  const ecart_total     = total_reel - total_theorique;

  return {
    date:         '2026-05-29',
    branch_id:    'br-pap',
    branch_name:  'Agence Port-au-Prince',
    sessions,
    total_ouverture,
    total_theorique,
    total_reel,
    ecart_total,
    can_submit: sessions.every(s => s.ecarts.every(e => e.statut !== 'en_attente')),
  };
})();

// ─── 3. Dashboard ─────────────────────────────────────────────────────────────
export const MOCK_DASHBOARD: TreasuryDashboard = {
  branch_id:   'br-pap',
  branch_name: 'Agence Port-au-Prince',
  cash_balance: {
    cash_physical:       487_500,
    bank_accounts:     3_240_000,
    total_consolidated: 3_727_500,
    reference_currency: 'HTG' as CurrencyCode,
  },
  generated_at: '2026-05-26T11:05:00',
} as TreasuryDashboard;

// ─── 4. Pending count (pour la cloche dans TreasuryOverview) ─────────────────
export const MOCK_PENDING_COUNT = MOCK_REMISES_PENDING.length;