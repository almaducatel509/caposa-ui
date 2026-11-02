/**
 * SessionManager.ts
 * ─────────────────────────────────────────────────────────────────
 * Cycle de vie des sessions caisse côté frontend.
 *
 * Endpoints Django :
 *   GET   /sessions/              → toutes les sessions
 *   GET   /sessions/{id}/         → une session (montant_theorique, totaux…)
 *   GET   /sessions/active/       → session ouverte du caissier connecté (404 sinon)
 *   POST  /sessions/open/         → ouvrir une session
 *   POST  /sessions/{id}/close/   → fermer une session
 *
 * Règles :
 *   • Django fait autorité. Ouvrir ou fermer une caisse n'est JAMAIS simulé
 *     localement : si le serveur ne répond pas, l'opération échoue avec un
 *     message clair. (Une session « locale » ferait croire au caissier que sa
 *     caisse est ouverte alors que tous ses encaissements seraient refusés.)
 *   • Le cache sert uniquement à éviter des appels répétés en lecture.
 *   • Le cache est rattaché à l'utilisateur connecté : sur un poste partagé,
 *     un caissier ne voit jamais la session du précédent.
 *
 * USAGE :
 *   const session = await SessionManager.fetchActive();
 *   const session = await SessionManager.open(payload);
 *   await SessionManager.close(id, { montant_fermeture: 5000, note_fermeture: '…' });
 *   SessionManager.clear();   // à appeler à la déconnexion
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { isAxiosError } from 'axios';
import { CaisseSession, OpenSessionPayload } from '@/types/caisse';

// ─── Mapping front → Django (tout changement de contrat se fait ici) ──

interface DjangoOpenPayload {
  username:            string;
  branch:              string;
  devise:              string;
  montant_ouverture:   number;
  id_responsable_cash: string;
  caissier_nom?:       string;
  numero_caisse?:      string;
  superviseur?:        string;
}

function toApiOpenPayload(p: OpenSessionPayload): DjangoOpenPayload {
  return {
    username:            p.username,
    branch:              p.branch,
    devise:              p.devise,
    montant_ouverture:   p.montant_ouverture,
    id_responsable_cash: p.id_responsable_cash,
    caissier_nom:        p.caissier_nom,
    numero_caisse:       p.numero_caisse,
    superviseur:         p.superviseur,
  };
}

export interface ClosePayload {
  montant_fermeture: number;
  note_fermeture?:   string;
  motif_retard?:     string;
}

/**
 * ⚠️ À vérifier dans Swagger (POST /sessions/{id}/close/) : noms exacts
 * attendus par Django. `counted_amount` est celui utilisé jusqu'ici ;
 * `note_fermeture` est le nom du champ renvoyé par GET /sessions/{id}/.
 */
function toApiClosePayload(p: ClosePayload) {
  return {
    counted_amount: Math.round(p.montant_fermeture * 100) / 100,
    ...(p.note_fermeture ? { note_fermeture: p.note_fermeture } : {}),
    ...(p.motif_retard   ? { motif_retard:   p.motif_retard   } : {}),
  };
}

// ─── Codes d'erreur métier ────────────────────────────────────────

export const SESSION_ERROR_CODES = {
  ALREADY_OPEN:   'SESSION_ALREADY_OPEN',
  CLOSED_HOLIDAY: 'SESSION_CLOSED_HOLIDAY',
  CLOSED_DAY:     'SESSION_CLOSED_DAY',
  CLOSED_HOURS:   'SESSION_CLOSED_HOURS',
  NETWORK:        'SESSION_NETWORK_ERROR',
} as const;

/** Réseau coupé ou panne serveur : l'opération n'a PAS eu lieu côté Django. */
function isNetworkOrServerError(err: unknown): boolean {
  if (!isAxiosError(err)) return false;
  if (!err.response) return true;
  return err.response.status >= 500;
}

function networkError(action: string): Error {
  const e = new Error(
    `${SESSION_ERROR_CODES.NETWORK}: impossible de ${action} — le serveur ne répond pas. ` +
    `Aucune opération n'a été enregistrée. Vérifiez la connexion puis réessayez.`
  );
  return e;
}

// ─── Cache ────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000;           // 5 minutes
const LOCAL_KEY    = 'caposa_sessions';
const OWNER_KEY    = 'caposa_sessions_owner';

interface CachedEntry {
  session:   CaisseSession;
  fetchedAt: number;
}

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
    // SSR ou stockage indisponible : le cache mémoire suffit
  }
}

// ─── SessionManager ───────────────────────────────────────────────

class SessionManagerClass {
  private cache     = new Map<string, CachedEntry>();
  private sessions: CaisseSession[] = [];
  private hydrated  = false;

  private hydrate(): void {
    if (this.hydrated) return;
    this.sessions = readLocal();
    this.hydrated = true;
  }

  /**
   * Rattache le cache à l'utilisateur connecté. Si un autre utilisateur se
   * connecte sur le même poste, le cache du précédent est vidé.
   * À appeler juste après la connexion (et sans risque à chaque chargement).
   */
  bindUser(username: string): void {
    try {
      const owner = localStorage.getItem(OWNER_KEY);
      if (owner && owner !== username) this.clear();
      localStorage.setItem(OWNER_KEY, username);
    } catch {
      // stockage indisponible : rien à purger
    }
  }

  // ── Lecture synchrone (cache, ne fait pas autorité) ──

  getAll(): CaisseSession[] {
    this.hydrate();
    return [...this.sessions];
  }

  /**
   * Session ouverte d'après le cache, sans appel réseau. Pour l'affichage
   * uniquement : utiliser fetchActive() avant toute décision.
   */
  getActive(): CaisseSession | null {
    this.hydrate();
    return this.sessions.find(s => s.statut === 'ouverte') ?? null;
  }

  // ── Lecture asynchrone ──

  /**
   * Session active du caissier connecté :
   *   1. cache mémoire frais (< 5 min)
   *   2. GET /sessions/active/
   *   3. si le serveur ne répond pas : dernière valeur connue, pour
   *      l'affichage seulement (les opérations, elles, échoueront proprement)
   */
  async fetchActive(): Promise<CaisseSession | null> {
    this.hydrate();

    const cached = this.getActive();
    if (cached) {
      const entry = this.cache.get(cached.id);
      if (entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS) return entry.session;
    }

    try {
      const { data } = await AxiosInstance.get<CaisseSession>('/sessions/active/');
      this.set(data);
      return data;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        this._clearActiveLocally();     // le serveur confirme : aucune session ouverte
        return null;
      }
      if (isNetworkOrServerError(err)) {
        console.warn('[SessionManager] fetchActive : serveur injoignable, dernière valeur connue', err);
        return this.getActive();
      }
      throw err;
    }
  }

  /** Une session précise, toujours rechargée depuis Django (montant théorique à jour). */
  async fetchOne(sessionId: string): Promise<CaisseSession> {
    const { data } = await AxiosInstance.get<CaisseSession>(`/sessions/${sessionId}/`);
    this.set(data);
    return data;
  }

  // ── Écriture du cache ──

  set(session: CaisseSession): void {
    this.hydrate();
    const idx = this.sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) this.sessions[idx] = session;
    else this.sessions.push(session);
    this.cache.set(session.id, { session, fetchedAt: Date.now() });
    writeLocal(this.sessions);
  }

  invalidate(sessionId: string): void {
    this.cache.delete(sessionId);
  }

  /** Vide tout le cache. À appeler à la déconnexion. */
  clear(): void {
    this.cache.clear();
    this.sessions = [];
    writeLocal([]);
  }

  // ── Opérations métier : jamais simulées ──

  /**
   * Ouvre une session caisse.
   *   • vérifie auprès du serveur qu'aucune session n'est déjà ouverte
   *   • POST /sessions/open/
   *   • serveur injoignable → erreur claire, aucune session créée
   */
  async open(payload: OpenSessionPayload): Promise<CaisseSession> {
    const existing = await this.fetchActive();
    if (existing) {
      throw new Error(
        `${SESSION_ERROR_CODES.ALREADY_OPEN}: Caisse ${existing.numero_caisse} déjà ouverte. ` +
        `Fermez-la avant d'en ouvrir une nouvelle.`
      );
    }

    try {
      const { data } = await AxiosInstance.post<CaisseSession>('/sessions/open/', toApiOpenPayload(payload));
      this.set(data);
      return data;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        const d = err.response.data as { code?: string; message?: string; detail?: string };
        throw new Error(d.message || d.detail || 'Caisse fermée. Consultez les horaires ou le calendrier des jours fériés.');
      }
      if (isNetworkOrServerError(err)) throw networkError('ouvrir la caisse');
      throw err;    // autre 4xx : remonter tel quel (err.response intact)
    }
  }

  /**
   * Ferme une session caisse — la sienne, ou celle d'un caissier pour un
   * superviseur / administrateur (Django vérifie le droit et renvoie 403).
   *   • N'exige PAS que la session soit dans le cache local
   *   • Envoie le montant compté, la note et le motif de retard
   *   • Serveur injoignable → erreur claire : la caisse reste ouverte
   */
  async close(sessionId: string, payload: ClosePayload): Promise<CaisseSession> {
    try {
      const { data } = await AxiosInstance.post<CaisseSession>(
        `/sessions/${sessionId}/close/`,
        toApiClosePayload(payload),
      );
      this.set(data);
      this.invalidate(sessionId);
      return data;
    } catch (err) {
      if (isNetworkOrServerError(err)) throw networkError('fermer la caisse');
      throw err;    // 4xx (dont 403) : remonter à l'UI
    }
  }

  // ── Privé ──

  private _clearActiveLocally(): void {
    this.sessions = this.sessions.map(s => (s.statut === 'ouverte' ? { ...s, statut: 'fermée' } : s));
    writeLocal(this.sessions);
  }
}

export const SessionManager = new SessionManagerClass();