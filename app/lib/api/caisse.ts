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
import { CaisseFormValues } from '@/app/components/sessions/validation';

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

// ─── Caisses ─────────────────────────────────────────────────────

export async function createCaisse(payload: CaisseFormValues): Promise<void> {
  await AxiosInstance.post('/caisses/', payload);
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