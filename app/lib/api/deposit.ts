import { CreateDepositResponse } from "@/app/components/dashboard/caissier/validation";
import AxiosInstance from "../axiosInstance";
import {
  CaisseSession,
  CaisseTransaction,
  CaisseAlert,
  OpenSessionPayload,
} from '@/types/caisse';
import { SessionManager } from "./Sessionmanager";

export async function createDeposit(payload: any, idemKey?: string) {
  const headers: Record<string, string> = {};
  if (idemKey) headers["Idempotency-Key"] = idemKey;

  const { data } = await AxiosInstance.post<CreateDepositResponse>(
    "/transactions/deposit/",
    payload,
    { headers }
  );
  return data;
}

export async function getDeposits() {
  return AxiosInstance.get("/transactions/?type=DEPOSIT");
}

export async function getDeposit(id: any) {
  return AxiosInstance.get(`/transactions/${id}/`);
}

export async function updateDeposit(id: any, payload: any) {
  return AxiosInstance.patch(`/transactions/${id}/`, payload);
}

export async function deleteDeposit(id: any) {
  return AxiosInstance.delete(`/transactions/${id}/`);
}

export async function getDepositAudit(id: any) {
  try {
    const response = await AxiosInstance.get(`/transactions/${id}/audit/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement de l'audit du dépôt :", error);
    throw error;
  }
}

/**
 * caisse.ts  —  API layer caisse
 * ─────────────────────────────────────────────────────────────────
 * Toutes les fonctions appellent directement l'API Django (mocks
 * retirés — les endpoints sont fonctionnels).
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Config ──────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Appelle l'API. Ne masque jamais une panne : si la config est
 * absente, si le serveur est injoignable, ou si l'API répond une
 * erreur, on lève une Error avec un message explicite — pas de
 * fallback silencieux, pas de mock.
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      "Configuration manquante : NEXT_PUBLIC_API_URL n'est pas défini. Impossible de contacter l'API caisse."
    );
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch (networkErr) {
    const detail = networkErr instanceof Error ? networkErr.message : 'erreur réseau inconnue';
    throw new Error(`Serveur injoignable (${API_BASE}${path}) : ${detail}`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erreur API ${res.status} — ${path}`);
  }

  return res.json() as Promise<T>;
}

// ─── fetchDashboard ───────────────────────────────────────────────

export async function fetchDashboard(): Promise<{
  sessions:       CaisseSession[];
  transactions:   CaisseTransaction[];
  alerts:         CaisseAlert[];
  montant_caisse: number;
}> {
  // Sessions : GET /sessions/ (endpoint réel Django)
  const sessions = await apiFetch<CaisseSession[]>('/sessions/');
  sessions.forEach(s => SessionManager.set(s));

  // Transactions + alertes
  const [transactions, alerts] = await Promise.all([
    fetchTransactions(),
    fetchAlerts(),
  ]);

  const montant_caisse = transactions.reduce(
    (sum, tx) => tx.type === 'depot' ? sum + tx.montant : sum - tx.montant,
    0
  );

  return { sessions, transactions, alerts, montant_caisse };
}

// ─── fetchTransactions ────────────────────────────────────────────

/** Toutes les transactions. GET /caisse-transactions/ */
export async function fetchTransactions(): Promise<CaisseTransaction[]> {
  return apiFetch<CaisseTransaction[]>('/caisse-transactions/');
}

/** Transactions d'une session. GET /sessions/{id}/transactions/ */
export async function fetchTransactionsBySession(sessionId: string): Promise<CaisseTransaction[]> {
  return apiFetch<CaisseTransaction[]>(`/sessions/${sessionId}/transactions/`);
}

// ─── fetchAlerts ──────────────────────────────────────────────────

export async function fetchAlerts(): Promise<CaisseAlert[]> {
  return apiFetch<CaisseAlert[]>('/alerts/');
}

// ─── fetchActiveSession ───────────────────────────────────────────
// Conservé pour rétrocompatibilité avec l'ancien code.

export async function fetchActiveSession(): Promise<CaisseSession | null> {
  return SessionManager.fetchActive();
}

// ─── openSession ──────────────────────────────────────────────────

export async function openSession(payload: OpenSessionPayload): Promise<CaisseSession> {
  // Délègue entièrement à SessionManager (gère l'API)
  return SessionManager.open(payload);
}

// ─── closeSession ─────────────────────────────────────────────────

export async function closeSession(
  sessionId: string,
  payload: { montant_fermeture: number }
): Promise<CaisseSession> {
  // Délègue entièrement à SessionManager (gère l'API)
  return SessionManager.close(sessionId, payload);
}

// ─── createTransaction ────────────────────────────────────────────

/**
 * Crée une transaction caisse.
 *
 * Règles métier appliquées ici (front) :
 *   1. Une session DOIT être ouverte → sinon erreur claire
 *   2. La session est injectée automatiquement si non fournie
 *   3. Si l'API échoue → l'erreur remonte telle quelle (aucune
 *      mise en file d'attente, aucun mock : l'appelant doit
 *      afficher le message d'erreur à l'utilisateur)
 *
 * @throws {Error} 'NO_ACTIVE_SESSION' si aucune session ouverte
 * @throws {Error} message explicite si l'API est injoignable ou en erreur
 */
export async function createTransaction(payload: {
  type:         string;
  amount:       number;
  description?: string;
  session?:     string;   // optionnel : injecté depuis SessionManager si absent
  note?:        string;
}): Promise<CaisseTransaction> {

  // ── 1. Résolution de la session ───────────────────────────────────
  let sessionId = payload.session;

  if (!sessionId) {
    const active = await SessionManager.fetchActive();

    // ❌ Aucune session → on bloque (règle métier critique)
    if (!active) {
      throw new Error(
        'NO_ACTIVE_SESSION: Veuillez ouvrir votre session caisse avant de créer une transaction.'
      );
    }

    sessionId = active.id;
  }

  // ── 2. Construction du body ───────────────────────────────────────
  const body = { ...payload, session: sessionId };

  // ── 3. Appel API — toute erreur remonte avec un message clair ─────
  return apiFetch<CaisseTransaction>('/caisse-transactions/', {
    method: 'POST',
    body:   JSON.stringify(body),
  });
}