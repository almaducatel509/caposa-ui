import { CreateDepositResponse } from "@/app/components/dashboard/caissier/validation";
import AxiosInstance from "../axiosInstance";
import {
  CaisseSession,
  CaisseTransaction,
  CaisseAlert,
  OpenSessionPayload,
} from '@/types/caisse';
import { OfflineQueue } from "./Offlinequeue";
import { SessionManager } from "./Sessionmanager";

export async function createDeposit(payload: any, idemKey?: string) {
  const headers: Record<string,string> = {};
  if (idemKey) headers["Idempotency-Key"] = idemKey;

  const { data } = await AxiosInstance.post<CreateDepositResponse>(
    "/api/deposits/",
    payload,
    { headers }
  );
  return data;
}

export async function getDeposits() {
  return AxiosInstance.get("/deposits/");
}

export async function getDeposit(id: any) {
  return AxiosInstance.get(`/deposits/${id}/`);
}

export async function updateDeposit(id: any, payload: any) {
  return AxiosInstance.patch(`/deposits/${id}/`, payload);
}

export async function deleteDeposit(id: any) {
  return AxiosInstance.delete(`/deposits/${id}/`);
}
// Une fonction API propre et centralisée

// Un audit récupérable depuis n’importe quel composant

// Une intégration cohérente avec ton AxiosInstance

// Une base solide pour afficher l’historique dans ton UI (timeline, tableau, etc.)
export async function getDepositAudit(id: any) {
  try {
    const response = await AxiosInstance.get(`/deposits/${id}/audit/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement de l'audit du dépôt :", error);
    throw error;
  }
}


/**
 * caisse.ts  —  API layer caisse
 * ─────────────────────────────────────────────────────────────────
 * Remplace les anciens fetchDashboard / openSession / closeSession.
 *
 * Toutes les fonctions :
 *   • appellent l'API Django si disponible
 *   • tombent sur le mock local sinon
 *   • ne plantent JAMAIS si NEXT_PUBLIC_API_URL est vide ou si
 *     le serveur Django n'est pas encore lancé
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Config ──────────────────────────────────────────────────────
const API_BASE      = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_AVAILABLE = !!API_BASE;

// ─── Helpers ─────────────────────────────────────────────────────


async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `HTTP ${res.status} — ${path}`);
  }
  return res.json() as Promise<T>;
}

// ─── Mocks (données de démo quand l'API est absente) ─────────────

// ✅ Mock corrigé
const MOCK_TRANSACTIONS: CaisseTransaction[] = [
  {
    id: 't1', session_id: 'SES-local-demo', cashier_id: 'jean.dupont',
    cash_register_id: 'C-01', type: 'depot', montant: 15000,
    solde_apres: 65000, client: 'Hudson Joseph', reference: 'DEP-001',
    statut: 'normal', effectue_par: 'jean.dupont',
    ip_address: '192.168.1.10', device_id: 'Chrome/124',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 't2', session_id: 'SES-local-demo', cashier_id: 'jean.dupont',
    cash_register_id: 'C-01', type: 'retrait', montant: 2500,
    solde_apres: 62500, client: 'Marie Dupont', reference: 'RET-002',
    statut: 'normal', effectue_par: 'jean.dupont',
    ip_address: '192.168.1.10', device_id: 'Chrome/124',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 't3', session_id: 'SES-local-demo', cashier_id: 'jean.dupont',
    cash_register_id: 'C-01', type: 'transfert_sortant', montant: 8350,
    solde_apres: 54150, client: 'Agence Tozin', reference: 'TRF-003',
    statut: 'normal', effectue_par: 'jean.dupont',
    ip_address: '192.168.1.10', device_id: 'Chrome/124',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 't4', session_id: 'SES-local-demo', cashier_id: 'marie.joseph',
    cash_register_id: 'C-01', type: 'depot', montant: 30000,
    solde_apres: 84150, client: 'Réginald Beaumont', reference: 'DEP-004',
    statut: 'normal', effectue_par: 'marie.joseph',
    ip_address: '192.168.1.10', device_id: 'Chrome/124',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 't5', session_id: 'SES-local-demo', cashier_id: 'jean.dupont',
    cash_register_id: 'C-01', type: 'retrait', montant: 5000,
    solde_apres: 79150, client: 'Roseline Pierre', reference: 'RET-005',
    statut: 'annulee', motif_annulation: 'Erreur de saisie — montant incorrect.',
    effectue_par: 'jean.dupont',
    ip_address: '192.168.1.10', device_id: 'Chrome/124',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
];


const MOCK_ALERTS: CaisseAlert[] = [
  { id: 'a1', severity: 'warning', message: 'Remise de 14h non complétée', time: '14:02' },
  { id: 'a2', severity: 'error',   message: 'Écart de 250 HTG détecté hier', time: '09:15' },
  { id: 'a3', severity: 'info',    message: 'Audit prévu à 16h00 aujourd\'hui', time: '09:00' },
];

// ─── fetchDashboard ───────────────────────────────────────────────

export async function fetchDashboard(): Promise<{
  sessions:       CaisseSession[];
  transactions:   CaisseTransaction[];
  alerts:         CaisseAlert[];
  montant_caisse: number;
}> {
  // Sessions : GET /sessions/ (endpoint réel Django)
  const sessions = await (async () => {
    if (API_AVAILABLE) {
      try {
        const data = await apiFetch<CaisseSession[]>('/sessions/');
        data.forEach(s => SessionManager.set(s));
        return data;
      } catch (err) {
        console.warn('[caisse] fetchDashboard sessions → fallback local', err);
      }
    }
    return SessionManager.getAll();
  })();

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

/** Toutes les transactions. GET /transactions/ */
export async function fetchTransactions(): Promise<CaisseTransaction[]> {
  if (API_AVAILABLE) {
    try {
      return await apiFetch<CaisseTransaction[]>('/transactions/');
    } catch (err) {
      console.warn('[caisse] fetchTransactions → mock', err);
    }
  }
  return MOCK_TRANSACTIONS;
}

/** Transactions d'une session. GET /sessions/{id}/transactions/ */
export async function fetchTransactionsBySession(sessionId: string): Promise<CaisseTransaction[]> {
  if (API_AVAILABLE) {
    try {
      return await apiFetch<CaisseTransaction[]>(`/sessions/${sessionId}/transactions/`);
    } catch (err) {
      console.warn(`[caisse] fetchTransactionsBySession(${sessionId}) → mock`, err);
    }
  }
  // Filtre les mocks par session pour simuler le comportement
  return MOCK_TRANSACTIONS.filter(tx => tx.session_id === sessionId);
}

// ─── fetchAlerts ──────────────────────────────────────────────────

export async function fetchAlerts(): Promise<CaisseAlert[]> {
  if (API_AVAILABLE) {
    try {
      return await apiFetch<CaisseAlert[]>('/alerts/');
    } catch (err) {
      console.warn('[caisse] fetchAlerts → mock', err);
    }
  }
  return MOCK_ALERTS;
}

// ─── fetchActiveSession ───────────────────────────────────────────
// Conservé pour rétrocompatibilité avec l'ancien code.

export async function fetchActiveSession(): Promise<CaisseSession | null> {
  return SessionManager.fetchActive();
}

// ─── openSession ──────────────────────────────────────────────────

export async function openSession(payload: OpenSessionPayload): Promise<CaisseSession> {
  // Délègue entièrement à SessionManager (gère l'API + le fallback local)
  return SessionManager.open(payload);
}

// ─── closeSession ─────────────────────────────────────────────────

export async function closeSession(
  sessionId: string,
  payload: { montant_fermeture: number }
): Promise<CaisseSession> {
  // Délègue entièrement à SessionManager (gère l'API + le fallback local)
  return SessionManager.close(sessionId, payload);
}

// ─── createTransaction ────────────────────────────────────────────

/**
 * Crée une transaction caisse.
 *
 * Règles métier appliquées ici (front) :
 *   1. Une session DOIT être ouverte → sinon erreur claire
 *   2. La session est injectée automatiquement si non fournie
 *   3. Si l'API échoue (réseau, serveur) → mise en file offline
 *   4. Ne plante JAMAIS si l'API Django n'est pas disponible
 *
 * @throws {Error} 'NO_ACTIVE_SESSION' si aucune session ouverte
 */
export async function createTransaction(payload: {
  type:         string;
  amount:       number;
  description?: string;
  session?:     string;   // optionnel : injecté depuis SessionManager si absent
  note?:        string;
}): Promise<CaisseTransaction | { _offline: true; queued: ReturnType<typeof OfflineQueue.enqueue> }> {

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

  // ── 3. Appel API ──────────────────────────────────────────────────
  if (API_AVAILABLE) {
    try {
      const tx = await apiFetch<CaisseTransaction>('/transactions/', {
        method: 'POST',
        body:   JSON.stringify(body),
      });
      return tx;
    } catch (err) {
      const isOffline =
        err instanceof TypeError ||                    // NetworkError
        (err instanceof Error && err.message.startsWith('HTTP 5')); // 5xx serveur

      if (!isOffline) throw err; // Erreur métier (400, 403…) → on remonte

      console.warn('[caisse] createTransaction → API hors ligne, mise en queue', err);
    }
  }

  // ── 4. Fallback offline ───────────────────────────────────────────
  const queued = OfflineQueue.enqueue('createTransaction', body, sessionId);
  return { _offline: true, queued };
}
