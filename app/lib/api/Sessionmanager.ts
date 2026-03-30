/**
 * SessionManager.ts
 * ─────────────────────────────────────────────────────────────────
 * Gère le cycle de vie des sessions caisse côté frontend :
 *   • Cache mémoire (évite les appels API répétés)
 *   • Session active par caissier
 *   • Multi-sessions (plusieurs caisses simultanées)
 *   • Fallback complet si l'API Django n'est pas encore disponible
 *
 * Endpoints Django :
 *   GET   /sessions/              → toutes les sessions
 *   GET   /sessions/{id}/         → une session
 *   POST  /sessions/open/         → ouvrir une session
 *   POST  /sessions/{id}/close/   → fermer une session
 *
 * USAGE :
 *   const session = await SessionManager.fetchActive();
 *   const session = await SessionManager.open(payload);
 *   await SessionManager.close(id, { montant_fermeture: 5000 });
 *   SessionManager.set(session);
 *   SessionManager.clear();
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { isAxiosError } from 'axios';
import { CaisseSession, OpenSessionPayload } from '@/types/caisse';

// ─── Mapping front → Django ───────────────────────────────────────
// Noms français du front  →  noms anglais attendus par Django
// Tout changement de contrat API se fait ici uniquement.

interface DjangoOpenPayload {
  opening_balance:      number;
  caissier_nom?:        string;
  numero_caisse?:       string;
  superviseur?:         string;
  id_responsable_cash?: string;
}

interface DjangoClosePayload {
  counted_amount: number;
}

function toApiOpenPayload(p: OpenSessionPayload): DjangoOpenPayload {
  return {
    opening_balance:     p.montant_ouverture,
    caissier_nom:        p.caissier_nom,
    numero_caisse:       p.numero_caisse,
    superviseur:         p.superviseur,
    id_responsable_cash: p.id_responsable_cash,
  };
}

function toApiClosePayload(montantFermeture: number): DjangoClosePayload {
  return { counted_amount: montantFermeture };
}

// ─── Config ───────────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const LOCAL_KEY    = 'caposa_sessions';

// ─── Helpers localStorage ─────────────────────────────────────────

function readLocal(): CaisseSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as CaisseSession[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(sessions: CaisseSession[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(sessions));
  } catch {
    // SSR ou localStorage plein → on ignore silencieusement
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

function localId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Retourne true si l'erreur Axios est due au réseau (pas de réponse)
 * ou à un 5xx serveur → on peut tomber en mode local sans remontée d'erreur.
 * Retourne false pour les 4xx → erreurs métier à remonter à l'UI.
 */
function isNetworkOrServerError(err: unknown): boolean {
  if (!isAxiosError(err)) return false;
  if (!err.response) return true;          // réseau coupé
  return err.response.status >= 500;       // panne serveur
}

// ─── Mock (fallback sans API) ─────────────────────────────────────

function buildMockSession(payload: OpenSessionPayload): CaisseSession {
  return {
    id:                  localId(),
    caissier_nom:        payload.caissier_nom,
    numero_caisse:       payload.numero_caisse,
    superviseur:         payload.superviseur,
    montant_ouverture:   payload.montant_ouverture,
    id_responsable_cash: payload.id_responsable_cash,
    statut:              'ouverte',
    ouverture_at:        nowISO(),
    fermeture_at:        undefined,
  };
}

// ─── Types internes ───────────────────────────────────────────────

interface CachedEntry {
  session:   CaisseSession;
  fetchedAt: number;
}

// ─── SessionManager ───────────────────────────────────────────────

class SessionManagerClass {
  private cache     = new Map<string, CachedEntry>();
  private sessions: CaisseSession[] = [];
  private hydrated  = false;

  // ── Hydratation ──────────────────────────────────────────────────

  private hydrate(): void {
    if (this.hydrated) return;
    this.sessions = readLocal();
    this.hydrated = true;
  }

  // ── Lecture synchrone ────────────────────────────────────────────

  /** Toutes les sessions en mémoire (localStorage + cache). */
  getAll(): CaisseSession[] {
    this.hydrate();
    return [...this.sessions];
  }

  /** Session ouverte depuis le cache local, sans appel réseau. */
  getActive(): CaisseSession | null {
    this.hydrate();
    return this.sessions.find(s => s.statut === 'ouverte') ?? null;
  }

  // ── Lecture asynchrone ───────────────────────────────────────────

  /**
   * Session active avec priorité :
   *   1. Cache mémoire frais (< 5 min)
   *   2. GET /sessions/active/  via AxiosInstance
   *   3. Fallback localStorage si réseau/5xx
   */
  async fetchActive(): Promise<CaisseSession | null> {
    this.hydrate();

    // 1. Cache frais ?
    const cached = this.getActive();
    if (cached) {
      const entry = this.cache.get(cached.id);
      if (entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
        return entry.session;
      }
    }

    // 2. Appel API
    try {
      const { data } = await AxiosInstance.get<CaisseSession>('/sessions/active/');
      this.set(data);
      return data;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        // Le serveur confirme : aucune session ouverte
        this._clearActiveLocally();
        return null;
      }
      // Réseau/5xx → fallback silencieux
      console.warn('[SessionManager] fetchActive → fallback local :', err);
      return this.getActive();
    }
  }

  /**
   * Session active, ou création automatique si absente.
   * ⚠️ Réservé aux flux automatisés. Préférez bloquer l'UI.
   */
  async getOrCreate(payload: OpenSessionPayload): Promise<CaisseSession> {
    const active = await this.fetchActive();
    if (active) return active;
    return this.open(payload);
  }

  // ── Écriture ─────────────────────────────────────────────────────

  /** Enregistre ou met à jour une session en mémoire + localStorage. */
  set(session: CaisseSession): void {
    this.hydrate();
    const idx = this.sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      this.sessions[idx] = session;
    } else {
      this.sessions.push(session);
    }
    this.cache.set(session.id, { session, fetchedAt: Date.now() });
    writeLocal(this.sessions);
  }

  /** Invalide le cache mémoire (force re-fetch au prochain accès). */
  invalidate(sessionId: string): void {
    this.cache.delete(sessionId);
  }

  /** Supprime toutes les sessions (déconnexion, fin de journée). */
  clear(): void {
    this.cache.clear();
    this.sessions = [];
    writeLocal([]);
  }

  // ── Opérations métier ────────────────────────────────────────────

  /**
   * Ouvre une session caisse.
   *   • Bloque si une session est déjà ouverte localement
   *   • POST /sessions/open/  avec mapping des champs Django
   *   • Fallback local si réseau/5xx (session marquée _local)
   *   • Remonte les erreurs 4xx à l'UI sans swallowing
   */
  async open(payload: OpenSessionPayload): Promise<CaisseSession> {
    const existing = this.getActive();
    if (existing) {
      throw new Error(
        `SESSION_ALREADY_OPEN: Caisse ${existing.numero_caisse} déjà ouverte. ` +
        `Fermez-la avant d'en ouvrir une nouvelle.`
      );
    }

    try {
      const { data } = await AxiosInstance.post<CaisseSession>(
        '/sessions/open/',
        toApiOpenPayload(payload)
      );
      this.set(data);
      return data;
    } catch (err) {
      if (!isNetworkOrServerError(err)) throw err; // 4xx → remonter à l'UI

      // Réseau/5xx → session locale temporaire
      console.warn('[SessionManager] open() → API hors ligne, session locale :', err);
      const session = buildMockSession(payload);
      (session as CaisseSession & { _local?: boolean })._local = true;
      this.set(session);
      return session;
    }
  }

  /**
   * Ferme une session caisse.
   *   • POST /sessions/{id}/close/  avec { counted_amount }
   *   • Fallback local si réseau/5xx
   *   • Remonte les erreurs 4xx à l'UI
   */
  async close(
    sessionId: string,
    payload: { montant_fermeture: number }
  ): Promise<CaisseSession> {
    this.hydrate();

    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) throw new Error(`Session introuvable : ${sessionId}`);

    try {
      const { data } = await AxiosInstance.post<CaisseSession>(
        `/sessions/${sessionId}/close/`,
        toApiClosePayload(payload.montant_fermeture)
      );
      this.set(data);
      return data;
    } catch (err) {
      if (!isNetworkOrServerError(err)) throw err; // 4xx → remonter à l'UI

      // Réseau/5xx → fermeture locale
      console.warn('[SessionManager] close() → API hors ligne, fermeture locale :', err);
      const closed: CaisseSession = {
        ...session,
        statut:       'fermée',
        fermeture_at: nowISO(),
      };
      this.set(closed);
      this.invalidate(sessionId);
      return closed;
    }
  }

  // ── Privé ────────────────────────────────────────────────────────

  private _clearActiveLocally(): void {
    this.sessions = this.sessions.map(s =>
      s.statut === 'ouverte' ? { ...s, statut: 'fermée' } : s
    );
    writeLocal(this.sessions);
  }
}

// ─── Singleton exporté ────────────────────────────────────────────
export const SessionManager = new SessionManagerClass();