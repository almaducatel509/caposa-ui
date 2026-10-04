/**
 * caisse.ts  —  API layer caisse
 * ─────────────────────────────────────────────────────────────────
 * Source unique de vérité pour tous les appels API caisse.
 * Utilise exclusivement AxiosInstance (baseURL + JWT centralisés).
 *
 * URL de base : /caisse/   (sans « s » — confirmé par Bruno collection)
 *
 * Règle : aucune fonction ici ne masque une panne d'API derrière un
 * tableau vide, un mock, ou un fallback silencieux. Toute erreur est
 * relevée avec un message clair ; c'est à l'appelant (UI) de décider
 * comment l'afficher.
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { isAxiosError } from 'axios';
import { SessionManager } from './Sessionmanager';
import { CreateDepositResponse } from '@/app/components/dashboard/caissier/validation';
import {
  CaisseSession,
  CaisseTransaction,
  CaisseAlert,
  OpenSessionPayload,
} from '@/types/caisse';
import { CaisseCreateValues } from '@/app/components/terminals/validation';
import { Caisse } from '@/types/caisse';

import type { TransactionData } from '@/app/components/transactions/types';
import { FEATURES } from '../features';

// ─── Helper interne ───────────────────────────────────────────────

/** Message clair à partir d'une erreur Axios ou générique — jamais de silence. */
function describeError(err: unknown, context: string): string {
  if (isAxiosError(err)) {
    if (!err.response) {
      return `${context} : serveur injoignable (${err.message}).`;
    }
    // const serverMessage = (err.response.data as any)?.message ?? (err.response.data as any)?.detail;
    // return `${context} : erreur ${err.response.status}${serverMessage ? ` — ${serverMessage}` : ''}.`;
    const body = err.response.data as any;
    const serverMessage =
      body?.message ?? body?.detail ??
      (body && typeof body === 'object'
        ? Object.entries(body)
            .map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' · ')
        : undefined);
  }
  if (err instanceof Error) return `${context} : ${err.message}`;
  return `${context} : erreur inconnue.`;
}

// ─── Caisses ─────────────────────────────────────────────────────

/** GET /terminals/ — liste toutes les caisses */
export const fetchCaisses = async (): Promise<Caisse[]> => {
  try {
    const { data } = await AxiosInstance.get<Caisse[] | { results: Caisse[] }>('/terminals/');
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les caisses'));
  }
};

/** POST /terminals/ — crée une nouvelle caisse */
export async function createCaisse(payload: CaisseCreateValues): Promise<Caisse> {
  try {
    const { data } = await AxiosInstance.post<Caisse>('/terminals/', payload);
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de créer la caisse'));
  }
}

/** PATCH /terminals/{id}/ — active ou désactive une caisse */
export async function toggleCaisseActif(id: string, actif: boolean): Promise<Caisse> {
  try {
    const { data } = await AxiosInstance.patch<Caisse>(`/terminals/${id}/`, { actif });
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de modifier le statut de la caisse'));
  }
}

// ─── Dépôts ──────────────────────────────────────────────────────

export async function createDeposit(
  payload: unknown,
  idemKey?: string,
): Promise<CreateDepositResponse> {
  const headers: Record<string, string> = {};
  if (idemKey) headers['Idempotency-Key'] = idemKey;

  try {
    const { data } = await AxiosInstance.post<CreateDepositResponse>(
      '/transactions/deposit/',
      payload,
      { headers },
    );
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible d\u2019enregistrer le dépôt'));
  }
}
/** GET /accounts/ — correspondance compte → membre */
export async function fetchAllAccounts(): Promise<{ id: string; member: string }[]> {
  try {
    const { data } = await AxiosInstance.get('/accounts/');
    const raw: any[] = Array.isArray(data) ? data : data?.results ?? [];
    return raw.map(a => ({ id: String(a.id), member: String(a.member) }));
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les comptes'));
  }
}

/** GET /transactions/?type=DEPOSIT — liste tous les dépôts */
export async function getDeposits(): Promise<TransactionData[]> {
  try {
    const { data } = await AxiosInstance.get<TransactionData[]>('/transactions/?type=DEPOSIT');
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les dépôts'));
  }
}

/** GET /transactions/{id}/ — détail d'un dépôt */
export async function getDeposit(id: string | number): Promise<TransactionData> {
  try {
    const { data } = await AxiosInstance.get<TransactionData>(`/transactions/${id}/`);
    return data;
  } catch (err) {
    throw new Error(describeError(err, `Impossible de charger le dépôt ${id}`));
  }
}

/** PATCH /transactions/{id}/ — modifie un dépôt */
export async function updateDeposit(id: string | number, payload: unknown): Promise<TransactionData> {
  try {
    const { data } = await AxiosInstance.patch<TransactionData>(`/transactions/${id}/`, payload);
    return data;
  } catch (err) {
    throw new Error(describeError(err, `Impossible de modifier le dépôt ${id}`));
  }
}

/** DELETE /transactions/{id}/ — supprime un dépôt */
export async function deleteDeposit(id: string | number): Promise<void> {
  try {
    await AxiosInstance.delete(`/transactions/${id}/`);
  } catch (err) {
    throw new Error(describeError(err, `Impossible de supprimer le dépôt ${id}`));
  }
}

/** GET /transactions/{id}/audit/ — journal d'audit d'un dépôt */
export async function getDepositAudit(id: string | number): Promise<unknown> {
  try {
    const { data } = await AxiosInstance.get(`/transactions/${id}/audit/`);
    return data;
  } catch (err) {
    throw new Error(describeError(err, `Impossible de charger l'audit du dépôt ${id}`));
  }
}

// ─── Comptes par membre ────────────────────────────────────────────
// ⚠️ Endpoint à confirmer côté backend Django (placeholder ci-dessous).

export interface CaisseAccountOption {
  id:             string;
  account_number: string;
  typeCompte:     'epargne' | 'cheques' | 'terme';
  soldeActuel:    number;
  account_status: 'actif' | 'suspendu' | 'ferme';
}

/** GET /comptes/?membre={id} — comptes d'un membre */
export const fetchAccountsByMember = async (memberId: string): Promise<CaisseAccountOption[]> => {
  const { data } = await AxiosInstance.get('/accounts/', { params: { member: memberId } });
  const raw: any[] = Array.isArray(data) ? data : data?.results ?? [];

  return raw
    // Indispensable : Django ignore ?member= s'il n'a pas de filtre configuré
    .filter(a => String(a.member) === String(memberId))
    .map(a => ({
      id:             String(a.id),
      account_number: a.account_number,
      typeCompte:     a.account_type ?? a.typeCompte ?? '',
      soldeActuel:    Number(a.balance ?? a.soldeActuel ?? 0) || 0,
      account_status: a.account_status ?? '',
    }));
};
// export async function fetchAccountsByMember(memberId: string): Promise<CaisseAccountOption[]> {
//   try {
//     const { data } = await AxiosInstance.get('/accounts/', { params: { member: memberId } });
//     const raw  = Array.isArray(data) ? data : data?.results ?? [];
//     // Filtre côté front aussi : si Django ignore ?member=, on reçoit tous les comptes
//     const list = raw.filter((a: any) => String(a.member) === String(memberId));
// // ... puis ton mapping existant vers CaisseAccountOption, appliqué à `list`
//     // const { data } = await AxiosInstance.get<CaisseAccountOption[]>(`/comptes/?membre=${memberId}`);
//     return data;
//   } catch (err) {
//     throw new Error(describeError(err, "Impossible de charger les comptes de ce membre"));
//   }
// }

// ─── Dashboard ───────────────────────────────────────────────────

export async function fetchDashboard(): Promise<{
  sessions:       CaisseSession[];
  transactions:   TransactionData[];
  alerts:         CaisseAlert[] | null;
  montant_caisse: number;
}> {
  let sessions: CaisseSession[];
  try {
    const { data } = await AxiosInstance.get<CaisseSession[]>('/sessions/');
    data.forEach(s => SessionManager.set(s));
    sessions = data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les sessions caisse'));
  }

    const [transactions, alerts] = await Promise.all([
    fetchTransactions(),
    FEATURES.alerts ? fetchAlerts() : Promise.resolve(null),
  ]);

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
    throw new Error(describeError(err, 'Impossible de charger les transactions'));
  }
}

export async function fetchTransactionsBySession(
  sessionId: string,
): Promise<CaisseTransaction[]> {
  try {
    const { data } = await AxiosInstance.get<CaisseTransaction[]>(
      `/sessions/${sessionId}/transactions/`,
    );
    return data;
  } catch (err) {
    throw new Error(describeError(err, `Impossible de charger les transactions de la session ${sessionId}`));
  }
}

/**
 * Crée une transaction caisse.
 *
 *   1. Une session DOIT être ouverte → sinon erreur claire.
 *   2. La session est injectée automatiquement si non fournie.
 *   3. Si l'API échoue, l'erreur remonte telle quelle — aucune mise
 *      en file d'attente offline, aucun mock.
 */
export async function createTransaction(payload: {
  type:         string;
  amount:       number;
  description?: string;
  note?:        string;
  session?:     string;
}): Promise<CaisseTransaction> {
  let sessionId = payload.session;

  if (!sessionId) {
    const active = await SessionManager.fetchActive();
    if (!active) {
      throw new Error(
        'NO_ACTIVE_SESSION: Ouvrez votre session caisse avant de créer une transaction.',
      );
    }
    sessionId = active.id;
  }

  const body = { ...payload, session: sessionId };

  try {
    const { data } = await AxiosInstance.post<CaisseTransaction>('/caisse-transactions/', body);
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de créer la transaction'));
  }
}

// ─── Alertes ─────────────────────────────────────────────────────

/**
 * GET /alerts/ — pas encore disponible côté backend.
 * On lève une erreur explicite plutôt que de renvoyer un tableau vide :
 * l'UI doit savoir que les alertes ne sont pas chargées, pas croire
 * qu'il n'y en a aucune.
 */
export async function fetchAlerts(): Promise<CaisseAlert[]> {
  try {
    const { data } = await AxiosInstance.get<CaisseAlert[]>('/alerts/');
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Alertes indisponibles'));
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
  payload: { montant_fermeture: number },
): Promise<CaisseSession> {
  return SessionManager.close(sessionId, payload);
}