import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// --- Single request interceptor ---
// Hardcode pour eviter les problemes de cache Turbopack sur localhost (qui cause des timeouts IPv6)
const BASE_URL = 'http://127.0.0.1:8000/api/';

const AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// ---- Helpers
const ACCESS_COOKIE = process.env.NEXT_PUBLIC_TOKEN_NAME || process.env.TOKEN_NAME || "caposa_access_token";
const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_TOKEN || process.env.REFRESH_TOKEN || "caposa_refresh_token";

const isJwtExpired = (token?: string | null) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // On ajoute 10 secondes de marge (buffer) pour eviter qu'il n'expire en vol
    return (payload.exp * 1000) < (Date.now() + 10000);
  } catch {
    return true;
  }
};

// Pour eviter les refresh concurrents
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function onRefreshed(newToken: string | null) {
  pendingQueue.forEach((cb) => cb(newToken));
  pendingQueue = [];
}

AxiosInstance.interceptors.request.use(
  async (config) => {
    // Fix: enleve le slash initial de l'URL pour eviter l'ecrasement du baseURL
    if (config.url?.startsWith('/')) {
      config.url = config.url.slice(1);
    }
    
    // Si la requete est deja une requete de refresh, on ne fait rien
    if (config.url?.includes('token/refresh/')) {
       return config;
    }

    if (typeof window !== "undefined") {
      let access = getCookie(ACCESS_COOKIE) as string | undefined;
      const refresh = getCookie(REFRESH_COOKIE) as string | undefined;
      
      // Si le token est expire et qu'on a un refresh token
      if (isJwtExpired(access) && refresh) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const res = await axios.post(`${BASE_URL}token/refresh/`, { refresh });
            const newAccess = res.data.access;
            setCookie(ACCESS_COOKIE, newAccess, { maxAge: 60 * 60 * 24, path: '/' });
            onRefreshed(newAccess);
            access = newAccess;
          } catch (e) {
            // Echec du refresh (refresh token expire), on deconnecte l'utilisateur
            deleteCookie(ACCESS_COOKIE);
            deleteCookie(REFRESH_COOKIE);
            onRefreshed(null);
            access = undefined;
            window.location.href = '/login';
          } finally {
            isRefreshing = false;
          }
        } else {
          // On attend que la requete de refresh en cours se termine
          access = await new Promise((resolve) => {
            pendingQueue.push(resolve);
          }) || undefined;
        }
      }

      if (access) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = Bearer ;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default AxiosInstance;