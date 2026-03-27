import AxiosInstance from '@/app/lib/axiosInstance';
import { DashboardData, OpenSessionPayload, CaisseSession, CloseSessionPayload, CaisseTransaction, CaisseAlert } from '@/types/caisse';


/* ─────────────────────────────────────────────────────────────────────────────
 * Toutes les fonctions sont prêtes pour Django.
 * Pour chaque fonction :
 *   1. Décommente la ligne AxiosInstance
 *   2. Supprime le bloc mock en dessous
 * ───────────────────────────────────────────────────────────────────────────── */

/* ─── Dashboard complet ──────────────────────────────────────────────────── */
// GET /api/caisse/dashboard/
export async function fetchDashboard(): Promise<DashboardData> {
  // const { data } = await AxiosInstance.get('/caisse/dashboard/');
  // return data;

  await new Promise(r => setTimeout(r, 400));
  return {
    montant_caisse: 53700,
    sessions: [
      {
        id: 's1', caissier_nom: 'Jean Dupont', numero_caisse: 'C-01',
        superviseur: 'Marie Moreau', montant_ouverture: 50000,
        id_responsable_cash: 'EMP-008', ouverture_at: '08:00',
        fermeture_at: '12:30', montant_fermeture: 62400, statut: 'fermée',
      },
    ],
    transactions: [
      { id: 1, type: 'deposit',     amount: 12500, time: '10:32', note: 'Dépôt client #4821'    },
      { id: 2, type: 'withdrawal',   amount: 3200,  time: '10:18', note: 'Retrait client #3302'  },
      { id: 3, type: 'transfer', amount: 8000,  time: '09:55', note: 'Transfert vers coffre' },
      { id: 4, type: 'deposit',     amount: 5400,  time: '09:41', note: 'Dépôt client #1190'    },
      { id: 5, type: 'withdrawal',   amount: 1750,  time: '09:20', note: 'Retrait client #2287'  },
    ],
    alerts: [
      { id: '1', severity: 'warning', message: 'Remise de 14h non complétée',     time: '14:02' },
      { id: '2', severity: 'error',   message: 'Écart de 250 HTG détecté hier',   time: '09:15' },
      { id: '3', severity: 'info',    message: "Audit prévu à 16h00 aujourd'hui", time: '08:00' },
    ],
  };
}

/* ─── Ouvrir une session ─────────────────────────────────────────────────── */
// POST /api/caisse/sessions/
export async function openSession(payload: OpenSessionPayload): Promise<CaisseSession> {
  // const { data } = await AxiosInstance.post('/caisse/sessions/', payload);
  // return data;

  await new Promise(r => setTimeout(r, 600));
  return {
    ...payload,
    id:          `s${Date.now()}`,
    ouverture_at: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    statut:      'ouverte',
  };
}

/* ─── Fermer une session ─────────────────────────────────────────────────── */
// PATCH /api/caisse/sessions/:id/close/
export async function closeSession(
  sessionId: string,
  payload: CloseSessionPayload
): Promise<CaisseSession> {
  // const { data } = await AxiosInstance.patch(
  //   `/caisse/sessions/${sessionId}/close/`, payload
  // );
  // return data;

  await new Promise(r => setTimeout(r, 600));
  return {
    id: sessionId, caissier_nom: 'Jean Dupont', numero_caisse: 'C-01',
    superviseur: 'Marie Moreau', montant_ouverture: 50000,
    id_responsable_cash: 'EMP-008', ouverture_at: '08:00',
    fermeture_at: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    montant_fermeture: payload.montant_fermeture,
    statut: 'fermée',
  };
}

/* ─── Refresh partiel (transactions + alertes) ───────────────────────────── */
// GET /api/caisse/transactions/?date=today
export async function fetchTransactions(): Promise<CaisseTransaction[]> {
  // const { data } = await AxiosInstance.get('/caisse/transactions/', { params: { date: 'today' } });
  // return data;

  await new Promise(r => setTimeout(r, 300));
  return [
    { id: 1, type: 'deposit',     amount: 12500, time: '10:32', note: 'Dépôt client #4821'    },
    { id: 2, type: 'withdrawal',   amount: 3200,  time: '10:18', note: 'Retrait client #3302'  },
    { id: 3, type: 'transfer', amount: 8000,  time: '09:55', note: 'Transfert vers coffre' },
    { id: 4, type: 'deposit',     amount: 5400,  time: '09:41', note: 'Dépôt client #1190'    },
    { id: 5, type: 'withdrawal',   amount: 1750,  time: '09:20', note: 'Retrait client #2287'  },
  ];
}

// GET /api/caisse/alerts/
export async function fetchAlerts(): Promise<CaisseAlert[]> {
  // const { data } = await AxiosInstance.get('/caisse/alerts/');
  // return data;

  await new Promise(r => setTimeout(r, 200));
  return [
    { id: '1', severity: 'warning', message: 'Remise de 14h non complétée',     time: '14:02' },
    { id: '2', severity: 'error',   message: 'Écart de 250 HTG détecté hier',   time: '09:15' },
    { id: '3', severity: 'info',    message: "Audit prévu à 16h00 aujourd'hui", time: '08:00' },
  ];
}