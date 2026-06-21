/**
 * caisse.ts  —  API layer caisse
 * ─────────────────────────────────────────────────────────────────
 * Source unique de vérité pour tous les appels API caisse.
 * Utilise exclusivement AxiosInstance (baseURL + JWT centralisés).
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { isAxiosError } from 'axios';
import { SessionManager } from './Sessionmanager';
import { OfflineQueue } from './Offlinequeue';
import { CreateDepositResponse } from '@/app/components/dashboard/caissier/validation';
import {
  CaisseSession,
  CaisseTransaction,
  CaisseAlert,
  OpenSessionPayload,
} from '@/types/caisse';
import { CaisseCreateValues } from '@/app/components/terminals/validation';
import { Caisse } from '@/types/caisse';

// ✅ Source unique pour les transactions côté UI (dashboard, listes, etc.)
import type { TransactionData } from '@/app/components/transactions/types';

// ─── Helper interne ───────────────────────────────────────────────

function isNetworkOrServerError(err: unknown): boolean {
  if (!isAxiosError(err)) return false;
  if (!err.response) return true;
  return err.response.status >= 500;
}

// ─── Mocks (uniquement ce qui n'a pas de source dédiée) ──────────
// Les alertes ne sont pas encore implémentées côté backend.
const MOCK_ALERTS: CaisseAlert[] = [];
// app/lib/api/caisse.ts  — ajouter à la fin


// TODO API : supprimer ce bloc quand GET /caisses/ est disponible
const MOCK_CAISSES: Caisse[] = [
  {
    id: '1', numero_caisse: 'C-01', nom_caisse: 'Caisse principale',
    localisation: 'Rez-de-chaussée — Accueil', branch: 'uuid-1',
    branch_name: 'Agence Port-au-Prince', 
    solde_initial: 50000, solde_actuel: 53700, actif: true,
    created_at: '2024-01-15T08:00:00Z', nb_sessions: 42,
    derniere_session: '2026-03-30T15:35:00Z',
  },
  {
    id: '2', numero_caisse: 'C-02', nom_caisse: 'Caisse secondaire',
    localisation: '1er étage — Guichet B', branch: 'uuid-1',
    branch_name: 'Agence Port-au-Prince', 
    solde_initial: 30000, solde_actuel: 28500, actif: true,
    created_at: '2024-02-01T08:00:00Z', nb_sessions: 28,
    derniere_session: '2026-03-29T17:00:00Z',
  },
  {
    id: '3', numero_caisse: 'C-03', nom_caisse: 'Caisse USD',
    localisation: 'Rez-de-chaussée — Devises', branch: 'uuid-2',
    branch_name: 'Agence Pétion-Ville', 
    solde_initial: 5000, solde_actuel: 4800, actif: false,
    created_at: '2024-03-10T08:00:00Z', nb_sessions: 15,
    derniere_session: '2026-02-28T16:00:00Z',
  },
];

/** Récupère la liste des caisses.
 *  TODO API : supprimer le fallback MOCK_CAISSES quand GET /caisses/ est prêt.
 *  Terminal et OpenSession utilisent cette même fonction — un seul endroit à modifier.
 */
export const fetchCaisses = async (): Promise<Caisse[]> => {
  try {
    const { data } = await AxiosInstance.get<Caisse[]>('/caisses/');
    return Array.isArray(data) ? data : (data as any)?.results ?? [];
  } catch (err) {
    console.warn('fetchCaisses → fallback mocks', err); // ← ajouter
    return MOCK_CAISSES;
  }
};
// ─── Caisses ─────────────────────────────────────────────────────
export async function createCaisse(payload: CaisseCreateValues): Promise<Caisse> {
  const { data } = await AxiosInstance.post<Caisse>('/caisses/', payload);
  return data;
}

// ─── Dépôts ──────────────────────────────────────────────────────

export async function createDeposit(
  payload: unknown,
  idemKey?: string
): Promise<CreateDepositResponse> {
  const headers: Record<string, string> = {};
  if (idemKey) headers['Idempotency-Key'] = idemKey;

  const { data } = await AxiosInstance.post<CreateDepositResponse>(
    '/api/transactions/deposit/',
    payload,
    { headers }
  );
  return data;
}

// ─── Dashboard ───────────────────────────────────────────────────

export async function fetchDashboard(): Promise<{
  sessions:       CaisseSession[];
  transactions:   TransactionData[];
  alerts:         CaisseAlert[];
  montant_caisse: number;
}> {
  const sessions = await (async () => {
    try {
      const { data } = await AxiosInstance.get<CaisseSession[]>('/sessions/');
      data.forEach(s => SessionManager.set(s));
      return data;
    } catch (err) {
      console.warn('[caisse] fetchDashboard sessions → fallback local :', err);
      return SessionManager.getAll();
    }
  })();

  const [transactions, alerts] = await Promise.all([
    fetchTransactions(),
    fetchAlerts(),
  ]);

  // Calcul du solde caisse :
  // - dépôts complétés       → entrée
  // - retraits complétés     → sortie
  // - prêts déboursés        → sortie (loan_info.status === 'active' | 'approved')
  // - transferts complétés   → neutre pour la caisse globale, on ignore
  // - tout ce qui est pending/failed → ignoré
  const montant_caisse = transactions.reduce((sum, tx) => {
    if (tx.status !== 'completed') return sum;
    if (tx.type === 'deposit')    return sum + tx.amount;
    if (tx.type === 'withdrawal') return sum - tx.amount;
    if (tx.type === 'loan') {
      const ls = tx.loan_info?.status;
      if (ls === 'active' || ls === 'approved') return sum - tx.amount;
    }
    return sum;
  }, 0);

  return { sessions, transactions, alerts, montant_caisse };
}

// ─── Transactions ────────────────────────────────────────────────

export async function fetchTransactions(): Promise<TransactionData[]> {
  try {
    const { data } = await AxiosInstance.get<TransactionData[]>('/caisse-transactions/');
    return data;
  } catch (err) {
    console.error('[caisse] fetchTransactions error :', err);
    return [];
  }
}

// (Fonction historique — toujours utilisée par d'autres modules pour
//  filtrer les transactions de caisse par session. On la garde sur le type
//  CaisseTransaction parce que c'est du journal de caisse interne.)
export async function fetchTransactionsBySession(
  sessionId: string
): Promise<CaisseTransaction[]> {
  try {
    const { data } = await AxiosInstance.get<CaisseTransaction[]>(
      `/sessions/${sessionId}/transactions/`
    );
    return data;
  } catch (err) {
    console.warn(`[caisse] fetchTransactionsBySession(${sessionId}) → mock vide :`, err);
    return [];
  }
}

export async function createTransaction(payload: {
  type:         string;
  amount:       number;
  description?: string;
  note?:        string;
  session?:     string;
}): Promise <CaisseTransaction |
  { _offline: true; queued: ReturnType<typeof OfflineQueue.enqueue> }
> {
  let sessionId = payload.session;

  if (!sessionId) {
    const active = await SessionManager.fetchActive();
    if (!active) {
      throw new Error(
        'NO_ACTIVE_SESSION: Ouvrez votre session caisse avant de créer une transaction.'
      );
    }
    sessionId = active.id;
  }

  const body = { ...payload, session: sessionId };

  try {
    const { data } = await AxiosInstance.post<CaisseTransaction>('/caisse-transactions/', body);
    return data;
  } catch (err) {
    if (!isNetworkOrServerError(err)) throw err;
    console.warn('[caisse] createTransaction → hors ligne, mise en queue :', err);
    const queued = OfflineQueue.enqueue('createTransaction', body, sessionId);
    return { _offline: true, queued };
  }
}

// ─── Alertes ─────────────────────────────────────────────────────

export async function fetchAlerts(): Promise<CaisseAlert[]> {
  try {
    // const { data } = await AxiosInstance.get<CaisseAlert[]>('/alerts/');
    // return data;
    return MOCK_ALERTS;
  } catch (err) {
    console.error('[caisse] fetchAlerts error :', err);
    return MOCK_ALERTS;
  }
}

// ─── Sessions ────────────────────────────────────────────────────

export async function fetchActiveSession(): Promise<CaisseSession | null> {
  return SessionManager.fetchActive();
}

export async function openSession(payload: OpenSessionPayload): Promise<CaisseSession> {
  return SessionManager.open(payload);
}

export async function closeSession(
  sessionId: string,
  payload: { montant_fermeture: number }
): Promise<CaisseSession> {
  return SessionManager.close(sessionId, payload);
}
export async function toggleCaisseActif(id: string, actif: boolean): Promise<Caisse> {
  // TODO API : PATCH /caisses/{id}/
  // Django vérifie côté serveur :
  //   - si actif=false : pas de session ouverte, pas de transactions pending
  //   - 409 si contrainte violée → message d'erreur à afficher dans l'UI
  const { data } = await AxiosInstance.patch<Caisse>(`/caisse/${id}/`, { actif });
  return data;
}