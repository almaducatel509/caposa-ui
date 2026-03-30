/**
 * OfflineQueue.ts
 * ─────────────────────────────────────────────────────────────────
 * File d'attente pour les opérations créées hors-ligne.
 *
 * Principe :
 *   1. L'API échoue (réseau coupé, serveur down, pas encore prêt)
 *   2. L'opération est stockée dans localStorage
 *   3. Quand la connexion revient → sync automatique via AxiosInstance
 *   4. onSync() notifie l'UI du résultat (succès / échec)
 *
 * USAGE :
 *   OfflineQueue.enqueue('createTransaction', payload, sessionId);
 *   OfflineQueue.startSync();       // dans layout.tsx
 *   OfflineQueue.onSync(callback);  // pour badge / toast
 *   OfflineQueue.getAll();          // liste des items en attente
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { isAxiosError } from 'axios';

const QUEUE_KEY     = 'caposa_offline_queue';
const SYNC_INTERVAL = 30_000; // 30 secondes
const MAX_RETRIES   = 5;

// ─── Types ────────────────────────────────────────────────────────

export type OfflineOperation =
  | 'createTransaction'
  | 'openSession'
  | 'closeSession';

export interface QueuedItem {
  id:         string;
  operation:  OfflineOperation;
  payload:    unknown;
  sessionId:  string;
  enqueuedAt: string;  // ISO
  retries:    number;
  lastError?: string;
  status:     'pending' | 'syncing' | 'failed';
}

export type SyncCallback = (result: {
  success: QueuedItem[];
  failed:  QueuedItem[];
}) => void;

// ─── Helpers localStorage ─────────────────────────────────────────

function readQueue(): QueuedItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedItem[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedItem[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    console.warn('[OfflineQueue] Impossible d\'écrire dans localStorage');
  }
}

function queuedId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Résolution des endpoints Django ─────────────────────────────
// Centralise le mapping opération → { method, url, body }

function resolveRequest(op: OfflineOperation, payload: unknown): {
  method: 'get' | 'post' | 'patch' | 'delete';
  url:    string;
  body:   unknown;
} {
  switch (op) {
    case 'createTransaction':
      // POST /transactions/  — payload déjà au format Django
      return { method: 'post', url: '/transactions/', body: payload };

    case 'openSession':
      // POST /sessions/open/  — payload déjà mappé (opening_balance…)
      return { method: 'post', url: '/sessions/open/', body: payload };

    case 'closeSession': {
      // POST /sessions/{id}/close/  — payload : { sessionId, counted_amount }
      const p = payload as { sessionId: string; counted_amount: number };
      return {
        method: 'post',
        url:    `/sessions/${p.sessionId}/close/`,
        body:   { counted_amount: p.counted_amount },
      };
    }
  }
}

// ─── OfflineQueue ─────────────────────────────────────────────────

class OfflineQueueClass {
  private callbacks: SyncCallback[] = [];
  private timer:     ReturnType<typeof setInterval> | null = null;
  private syncing    = false;

  // ── Abonnement aux résultats de sync ─────────────────────────────

  /**
   * Enregistre un callback appelé après chaque tentative de sync.
   * Retourne une fonction de désabonnement (utile dans useEffect).
   */
  onSync(cb: SyncCallback): () => void {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter(c => c !== cb);
    };
  }

  // ── Lecture ──────────────────────────────────────────────────────

  /** Tous les items en attente ou en échec. */
  getAll(): QueuedItem[] {
    return readQueue();
  }

  /** Nombre d'items non encore synchronisés. */
  count(): number {
    return readQueue().filter(i => i.retries < MAX_RETRIES).length;
  }

  // ── Enqueue ──────────────────────────────────────────────────────

  /**
   * Ajoute une opération à la file locale.
   * Retourne l'item mis en queue (utile pour feedback optimiste).
   */
  enqueue(
    operation: OfflineOperation,
    payload:   unknown,
    sessionId: string
  ): QueuedItem {
    const item: QueuedItem = {
      id:         queuedId(),
      operation,
      payload,
      sessionId,
      enqueuedAt: new Date().toISOString(),
      retries:    0,
      status:     'pending',
    };

    const queue = readQueue();
    queue.push(item);
    writeQueue(queue);

    console.info(`[OfflineQueue] Mis en file : ${operation} (${item.id})`);
    return item;
  }

  // ── Suppression ──────────────────────────────────────────────────

  /** Retire un item (annulé par l'utilisateur). */
  remove(itemId: string): void {
    writeQueue(readQueue().filter(i => i.id !== itemId));
  }

  /** Vide la file entièrement. */
  clear(): void {
    writeQueue([]);
  }

  // ── Sync automatique ─────────────────────────────────────────────

  /**
   * Démarre la synchronisation automatique.
   * À appeler dans layout.tsx (une seule fois).
   */
  startSync(): void {
    if (typeof window === 'undefined') return; // SSR guard

    window.addEventListener('online', () => this.sync());

    if (!this.timer) {
      this.timer = setInterval(() => {
        if (navigator.onLine) this.sync();
      }, SYNC_INTERVAL);
    }

    if (navigator.onLine) this.sync();
  }

  /** Arrête la synchronisation automatique. */
  stopSync(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Rejoue toutes les opérations en attente via AxiosInstance.
   * AxiosInstance gère automatiquement : baseURL, JWT, Content-Type.
   */
  async sync(): Promise<void> {
    if (this.syncing) return;

    const queue = readQueue().filter(
      i => i.status === 'pending' && i.retries < MAX_RETRIES
    );

    if (queue.length === 0) return;

    this.syncing = true;
    console.info(`[OfflineQueue] Sync de ${queue.length} opération(s)…`);

    const success: QueuedItem[] = [];
    const failed:  QueuedItem[] = [];

    for (const item of queue) {
      try {
        this._updateItem(item.id, { status: 'syncing' });

        const { method, url, body } = resolveRequest(item.operation, item.payload);

        // AxiosInstance injecte la baseURL et le token automatiquement
        await AxiosInstance[method](url, body);

        this._removeItem(item.id);
        success.push(item);
        console.info(`[OfflineQueue] ✓ ${item.operation} (${item.id})`);

      } catch (err) {
        const retries   = item.retries + 1;
        const errorMsg  = isAxiosError(err)
          ? (err.response?.data?.message ?? err.message)
          : String(err);
        const status    = retries >= MAX_RETRIES ? 'failed' : 'pending';

        this._updateItem(item.id, { status, retries, lastError: errorMsg });
        failed.push({ ...item, retries, lastError: errorMsg, status });

        console.warn(`[OfflineQueue] ✗ ${item.operation} (${retries}/${MAX_RETRIES}) : ${errorMsg}`);
      }
    }

    this.syncing = false;

    if (success.length > 0 || failed.length > 0) {
      this.callbacks.forEach(cb => cb({ success, failed }));
    }
  }

  // ── Privé ────────────────────────────────────────────────────────

  private _updateItem(id: string, patch: Partial<QueuedItem>): void {
    writeQueue(readQueue().map(i => i.id === id ? { ...i, ...patch } : i));
  }

  private _removeItem(id: string): void {
    writeQueue(readQueue().filter(i => i.id !== id));
  }
}

// ─── Singleton exporté ────────────────────────────────────────────
export const OfflineQueue = new OfflineQueueClass();