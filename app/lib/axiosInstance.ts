import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { createLogger } from './logger';

const log = createLogger('AxiosInstance');

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BASE_URL || 'http://127.0.0.1:8000/api/';
const BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL : `${RAW_BASE_URL}/`;

const AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Noms des cookies configurables via variables d'environnement
const ACCESS_COOKIE = process.env.NEXT_PUBLIC_TOKEN_NAME || process.env.TOKEN_NAME || "auth_token";
const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_TOKEN || process.env.REFRESH_TOKEN || "refresh_token";

const ALL_AUTH_COOKIES = [
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  'roles',
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'authjs.csrf-token',
  '__Host-authjs.csrf-token',
  'authjs.callback-url',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.csrf-token',
  'next-auth.callback-url',
  'next-auth.pkce.code_verifier',
  'authjs.pkce.code_verifier',
];

/**
 * Supprime exhaustivement tous les cookies d'authentification du navigateur.
 */
function purgeAllCookies() {
  ALL_AUTH_COOKIES.forEach((name) => {
    try {
      deleteCookie(name, { path: '/' });
    } catch {
      // Ignore les erreurs individuelles
    }
  });

  if (typeof document !== 'undefined') {
    try {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
        }
      }
    } catch {
      // Ignore
    }
  }
}

// Verrou anti-rebond pour éviter que 10 requêtes concurrentes en 401
// ne déclenchent 10 déconnexions et boucles de re-rendu.
let isLoggingOut = false;

/**
 * Déconnecte l'utilisateur automatiquement :
 * 1. Vide tous les cookies (jetons backend DRF + sessions NextAuth).
 * 2. Vide le localStorage et le sessionStorage.
 * 3. Appelle le signOut NextAuth client.
 * 4. Redirige immédiatement vers /login sans boucle.
 */
export async function handleAuthLogout(reason?: string) {
  if (isLoggingOut) return;
  isLoggingOut = true;

  log.warn(`Déconnexion automatique de l'utilisateur : ${reason || 'Session expirée'}`);

  // 1. Purge complète des cookies
  purgeAllCookies();

  // 2. Nettoyage stockage local
  if (typeof window !== 'undefined') {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore
    }

    // 3. Déconnexion NextAuth côté client pour synchroniser l'état React
    try {
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false });
    } catch (e) {
      log.warn("Déconnexion NextAuth client ignorée :", e);
    }

    // 4. Redirection propre avec remplacement de l'historique (évite le re-rendu)
    if (!window.location.pathname.startsWith('/login')) {
      window.location.replace('/login?expired=1');
    } else {
      isLoggingOut = false;
    }
  }
}

// Gestion des requêtes concurrentes pendant le refresh du token
let refreshPromise: Promise<string> | null = null;

async function requestNewAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refresh = getCookie(REFRESH_COOKIE) as string | undefined;
    if (!refresh) {
      throw new Error("Aucun refresh token disponible dans les cookies");
    }

    const refreshUrl = `${BASE_URL}auth/refresh/`;
    log.info("Appel de renouvellement du token d'accès...");

    const res = await axios.post(
      refreshUrl,
      { refresh },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );

    const newAccess = res.data?.access;
    if (!newAccess) {
      throw new Error("Réponse de refresh invalide (aucun access token retourné)");
    }

    // Sauvegarde du nouveau token d'accès
    setCookie(ACCESS_COOKIE, newAccess, { maxAge: 60 * 60 * 24, path: '/' });
    log.info("Nouveau token d'accès obtenu et enregistré.");

    // Rotation éventuelle du refresh token
    if (res.data?.refresh) {
      setCookie(REFRESH_COOKIE, res.data.refresh, { maxAge: 60 * 60 * 24 * 30, path: '/' });
      log.info("Nouveau refresh token enregistré (rotation).");
    }

    return newAccess;
  })()
    .catch((err) => {
      log.error("Échec du rafraîchissement du token :", err);
      handleAuthLogout("Refresh token expiré ou rejeté par le serveur");
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ─── Intercepteur Requête ──────────────────────────────────────────────
AxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isLoggingOut) {
      return Promise.reject(new axios.Cancel("Déconnexion en cours, requête annulée"));
    }

    // Évite les doubles slashs avec la baseURL
    if (config.url?.startsWith('/')) {
      config.url = config.url.slice(1);
    }

    const access = getCookie(ACCESS_COOKIE) as string | undefined;
    if (access) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Intercepteur Réponse (gestion 401 & Refresh Token) ──────────────────
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Si une déconnexion est déjà en cours, on rejette silencieusement sans relancer
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    // Si la réponse n'est pas 401 ou si la requête d'origine n'existe pas
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Si le 401 provient déjà de la route de refresh, le refresh token est invalide / expiré
    if (originalRequest.url?.includes('auth/refresh/')) {
      handleAuthLogout("401 sur l'endpoint refresh");
      return Promise.reject(error);
    }

    // Si le 401 provient du login, on laisse le formulaire de login traiter l'erreur
    if (originalRequest.url?.includes('auth/login/')) {
      return Promise.reject(error);
    }

    // Si la requête a déjà été rejouée une fois, on ne boucle pas
    if (originalRequest._retry) {
      handleAuthLogout("Requête déjà rejouée sans succès (401)");
      return Promise.reject(error);
    }

    const refresh = getCookie(REFRESH_COOKIE) as string | undefined;
    // Si aucun refresh token n'est présent, déconnexion immédiate
    if (!refresh) {
      handleAuthLogout("Aucun refresh token présent lors d'une réponse 401");
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      log.info(`401 détecté sur ${originalRequest.url}, renouvellement du token en cours...`);
      const newAccessToken = await requestNewAccessToken();

      // Met à jour l'en-tête Authorization de la requête originale
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Rejoue la requête originale avec le nouveau token
      return AxiosInstance(originalRequest);
    } catch (refreshError) {
      handleAuthLogout("Échec du renouvellement suite à 401");
      return Promise.reject(refreshError);
    }
  }
);

export default AxiosInstance;
