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

/**
 * Déconnecter l'utilisateur localement et rediriger vers la page login.
 */
function handleAuthLogout(reason?: string) {
  log.warn(`Déconnexion de l'utilisateur : ${reason || 'Session expirée'}`);
  try {
    deleteCookie(ACCESS_COOKIE, { path: '/' });
    deleteCookie(REFRESH_COOKIE, { path: '/' });
    deleteCookie('roles', { path: '/' });
  } catch {
    // Ignore les erreurs de suppression si hors contexte
  }

  if (typeof window !== 'undefined') {
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
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

    // Appel direct via axios pour ne pas passer par l'intercepteur de AxiosInstance
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

    // Si le backend active la rotation du refresh token, on le met aussi à jour
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

    // Si la réponse n'est pas 401 ou si la requête d'origine n'existe pas, on rejette l'erreur directement
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
    // Si aucun refresh token n'est présent, déconnexion et redirection vers /login
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
