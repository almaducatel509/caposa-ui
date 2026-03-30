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
import { OfflineQueue }   from './Offlinequeue';
import { CreateDepositResponse } from '@/app/components/dashboard/caissier/validation';
import {
  CaisseSession,
  CaisseTransaction,
  CaisseAlert,
  OpenSessionPayload,
} from '@/types/caisse';
import { SessionManager } from './Sessionmanager';

// ─── Helper interne ───────────────────────────────────────────────

/**
 * Retourne true si l'erreur est due au réseau (pas de réponse)
 * ou à un 5xx serveur → on peut basculer en fallback offline.
 * Retourne false pour les 4xx → erreurs métier à remonter à l'UI.
 */
function isNetworkOrServerError(err: unknown): boolean {
  if (!isAxiosError(err)) return false;
  if (!err.response) return true;         // réseau coupé
  return err.response.status >= 500;      // panne serveur
}

// ─── Mocks (données de démo, API absente) ────────────────────────

const MOCK_TRANSACTIONS: CaisseTransaction[] = [
  { id: 't1', type: 'deposit',    amount: 15000, note: 'Dépôt ouverture',    time: '08:00', session: 'local_demo' },
  { id: 't2', type: 'withdrawal', amount:  2500, note: 'Retrait caissier',   time: '09:30', session: 'local_demo' },
  { id: 't3', type: 'transfer',   amount:  8350, note: 'Virement C-01→C-02', time: '11:15', session: 'local_demo' },
  { id: 't4', type: 'deposit',    amount: 30000, note: 'Remise superviseur', time: '14:00', session: 'local_demo' },
  { id: 't5', type: 'withdrawal', amount:  5000, note: 'Fond de caisse',     time: '15:00', session: 'local_demo' },
];

const MOCK_ALERTS: CaisseAlert[] = [
  { id: 'a1', severity: 'warning', message: 'Remise de 14h non complétée',     time: '14:02' },
  { id: 'a2', severity: 'error',   message: 'Écart de 250 HTG détecté hier',   time: '09:15' },
  { id: 'a3', severity: 'info',    message: "Audit prévu à 16h00 aujourd'hui", time: '09:00' },
];

// ─── Dépôts ───────────────────────────────────────────────────────

/**
 * Crée un dépôt.
 * idemKey : Idempotency-Key optionnelle pour éviter les doublons.
 */
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

/** Charge toutes les données initiales du dashboard caissier. */
export async function fetchDashboard(): Promise<{
  sessions:       CaisseSession[];
  transactions:   CaisseTransaction[];
  alerts:         CaisseAlert[];
  montant_caisse: number;
}> {
  // GET /sessions/
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

/** GET /transactions/ */
export async function fetchTransactions(): Promise<CaisseTransaction[]> {
  try {
    const { data } = await AxiosInstance.get<CaisseTransaction[]>('/transactions/');
    return data;
  } catch (err) {
    console.warn('[caisse] fetchTransactions → mock :', err);
    return MOCK_TRANSACTIONS;
  }
}

/** GET /sessions/{id}/transactions/ */
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
    return MOCK_TRANSACTIONS.filter(tx => tx.session === sessionId);
  }
}

/**
 * Crée une transaction caisse.
 *
 * Règles appliquées :
 *   1. Session DOIT être ouverte → sinon erreur NO_ACTIVE_SESSION
 *   2. Session injectée automatiquement si non fournie
 *   3. Réseau/5xx → mise en file OfflineQueue (jamais perdu)
 *   4. 4xx Django → remontée à l'UI sans mise en queue
 *
 * @throws {Error} 'NO_ACTIVE_SESSION' si aucune session ouverte
 * @throws {AxiosError} erreurs 4xx Django (validation, droits…)
 */
export async function createTransaction(payload: {
  type:         string;
  amount:       number;
  description?: string;
  note?:        string;
  session?:     string; // injecté automatiquement si absent
}): Promise<
  CaisseTransaction |
  { _offline: true; queued: ReturnType<typeof OfflineQueue.enqueue> }
> {
  // 1. Résolution de la session
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

  // 2. Appel API
  try {
    const { data } = await AxiosInstance.post<CaisseTransaction>('/transactions/', body);
    return data;
  } catch (err) {
    if (!isNetworkOrServerError(err)) throw err; // 4xx → remonter à l'UI

    // Réseau/5xx → queue offline
    console.warn('[caisse] createTransaction → hors ligne, mise en queue :', err);
    const queued = OfflineQueue.enqueue('createTransaction', body, sessionId);
    return { _offline: true, queued };
  }
}

// ─── Alertes ─────────────────────────────────────────────────────

/** GET /alerts/ */
export async function fetchAlerts(): Promise<CaisseAlert[]> {
  try {
    const { data } = await AxiosInstance.get<CaisseAlert[]>('/alerts/');
    return data;
  } catch (err) {
    console.warn('[caisse] fetchAlerts → mock :', err);
    return MOCK_ALERTS;
  }
}

// ─── Sessions (délèguent à SessionManager) ────────────────────────

/** Rétrocompatibilité — délègue à SessionManager. */
export async function fetchActiveSession(): Promise<CaisseSession | null> {
  return SessionManager.fetchActive();
}

/** POST /sessions/open/ — délègue à SessionManager. */
export async function openSession(payload: OpenSessionPayload): Promise<CaisseSession> {
  return SessionManager.open(payload);
}

/** POST /sessions/{id}/close/ — délègue à SessionManager. */
export async function closeSession(
  sessionId: string,
  payload: { montant_fermeture: number }
): Promise<CaisseSession> {
  return SessionManager.close(sessionId, payload);
}