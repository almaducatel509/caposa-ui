/**
 * caisse.ts  —  API layer caisse
 * ─────────────────────────────────────────────────────────────────
 * Source unique de vérité pour tous les appels API caisse.
 * Utilise exclusivement AxiosInstance (baseURL + JWT centralisés).
 * Pas de fetch natif, pas de API_BASE manuel.
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { isAxiosError } from 'axios';
import { SessionManager } from './Sessionmanager';
import { OfflineQueue }   from './Offlinequeue';
import { CreateDepositResponse } from '@/app/components/dashboard/caissier/validation';
import {
  CaisseSession,
  CaisseTransaction,
  CaisseAlert,
  OpenSessionPayload,
} from '@/types/caisse';
import { CaisseFormValues } from '@/app/components/sessions/validation';

// ─── Helper interne ───────────────────────────────────────────────

function isNetworkOrServerError(err: unknown): boolean {
  if (!isAxiosError(err)) return false;
  if (!err.response) return true;
  return err.response.status >= 500;
}

// ─── Types ───────────────────────────────────────────────────────

export interface Branch {
  id:   string; // UUID
  name: string;
}

// ─── Mocks ───────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: CaisseTransaction[] = [
  { transactionId: 't1', type: 'deposit',    amount: 15000, note: 'Dépôt ouverture',    time: '08:00', sessionId: 'local_demo' },
  { transactionId: 't2', type: 'withdrawal', amount:  2500, note: 'Retrait caissier',   time: '09:30', sessionId: 'local_demo' },
  { transactionId: 't3', type: 'transfer',   amount:  8350, note: 'Virement C-01→C-02', time: '11:15', sessionId: 'local_demo' },
  { transactionId: 't4', type: 'deposit',    amount: 30000, note: 'Remise superviseur', time: '14:00', sessionId: 'local_demo' },
  { transactionId: 't5', type: 'withdrawal', amount:  5000, note: 'Fond de caisse',     time: '15:00', sessionId: 'local_demo' },
];

const MOCK_ALERTS: CaisseAlert[] = [
  { id: 'a1', severity: 'warning', message: 'Remise de 14h non complétée',     time: '14:02' },
  { id: 'a2', severity: 'error',   message: 'Écart de 250 HTG détecté hier',   time: '09:15' },
  { id: 'a3', severity: 'info',    message: "Audit prévu à 16h00 aujourd'hui", time: '09:00' },
];

// Fallback branches si GET /branches/ échoue
const MOCK_BRANCHES: Branch[] = [
  { id: 'mock-uuid-1', name: 'Agence Port-au-Prince' },
  { id: 'mock-uuid-2', name: 'Agence Pétion-Ville'   },
  { id: 'mock-uuid-3', name: 'Agence Cap-Haïtien'    },
];

// ─── Branches ────────────────────────────────────────────────────

/**
 * GET /branches/
 * Retourne la liste des agences pour le dropdown du formulaire caisse.
 * Fallback sur MOCK_BRANCHES si l'API est indisponible.
 */
export async function fetchBranches(): Promise<Branch[]> {
  try {
    const { data } = await AxiosInstance.get<Branch[]>('/branches/');
    return data;
  } catch (err) {
    console.warn('[caisse] fetchBranches → mock :', err);
    return MOCK_BRANCHES;
  }
}

// ─── Caisses ─────────────────────────────────────────────────────

/**
 * POST /caisses/
 * Crée une nouvelle caisse.
 * Payload validé par CaisseSchema (Zod) avant l'appel.
 *
 * @throws {AxiosError} 4xx → erreur métier remontée à l'UI
 * @throws {AxiosError} 5xx / réseau → erreur remontée à l'UI
 *   (pas de fallback offline — une caisse doit être créée côté serveur)
 */
export async function createCaisse(payload: CaisseFormValues): Promise<void> {
  await AxiosInstance.post('/caisses/', payload);
}

// ─── Dépôts ───────────────────────────────────────────────────────

export async function createDeposit(
  payload: unknown,
  idemKey?: string
): Promise<CreateDepositResponse> {
  const headers: Record<string, string> = {};
  if (idemKey) headers['Idempotency-Key'] = idemKey;

  const { data } = await AxiosInstance.post<CreateDepositResponse>(
    '/api/deposits/',
    payload,
    { headers }
  );
  return data;
}

// ─── Dashboard ────────────────────────────────────────────────────

export async function fetchDashboard(): Promise<{
  sessions:       CaisseSession[];
  transactions:   CaisseTransaction[];
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

  const montant_caisse = transactions.reduce(
    (sum, tx) => tx.type === 'deposit' ? sum + tx.amount : sum - tx.amount,
    0
  );

  return { sessions, transactions, alerts, montant_caisse };
}

// ─── Transactions ─────────────────────────────────────────────────

export async function fetchTransactions(): Promise<CaisseTransaction[]> {
  try {
    const { data } = await AxiosInstance.get<CaisseTransaction[]>('/transactions/');
    return data;
  } catch (err) {
    console.warn('[caisse] fetchTransactions → mock :', err);
    return MOCK_TRANSACTIONS;
  }
}

export async function fetchTransactionsBySession(
  sessionId: string
): Promise<CaisseTransaction[]> {
  try {
    const { data } = await AxiosInstance.get<CaisseTransaction[]>(
      `/sessions/${sessionId}/transactions/`
    );
    return data;
  } catch (err) {
    console.warn(`[caisse] fetchTransactionsBySession(${sessionId}) → mock :`, err);
    return MOCK_TRANSACTIONS.filter(tx => tx.sessionId === sessionId);
  }
}

export async function createTransaction(payload: {
  type:         string;
  amount:       number;
  description?: string;
  note?:        string;
  session?:     string;
}): Promise<
  CaisseTransaction |
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
    const { data } = await AxiosInstance.post<CaisseTransaction>('/transactions/', body);
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
    const { data } = await AxiosInstance.get<CaisseAlert[]>('/alerts/');
    return data;
  } catch (err) {
    console.warn('[caisse] fetchAlerts → mock :', err);
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