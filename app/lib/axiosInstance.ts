import axios from 'axios';
import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from 'cookies-next';

// --- Single request interceptor ---
const BASE_URL = process.env.NEXT_PUBLIC_BASE_ROUTE || 'http://localhost:8000/api/';

const AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

AxiosInstance.interceptors.request.use((config) => {
  // Fix: enlève le slash initial de l'URL pour éviter l'écrasement du baseURL
  if (config.url?.startsWith('/')) {
    config.url = config.url.slice(1);
  }

  if (typeof window !== "undefined") {
    const access = getCookie(ACCESS_COOKIE) as string | undefined;
    if (access) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${access}`;
    }
  }

  return config;
});

// ---- Helpers
const ACCESS_COOKIE = process.env.TOKEN_NAME || "auth_token";
const REFRESH_COOKIE = process.env.REFRESH_TOKEN || "refresh_token";

const isJwtExpired = (token?: string | null) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Pour éviter les refresh concurrents
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function onRefreshed(newToken: string | null) {
  pendingQueue.forEach((cb) => cb(newToken));
  pendingQueue = [];
}


AxiosInstance.interceptors.request.use((config) => {
  // If this file can be imported in server code, keep this guard
  if (typeof window !== "undefined") {
    const access = getCookie(ACCESS_COOKIE) as string | undefined;
    if (access) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${access}`;
    }
  }

  // Optional debug (don’t log tokens!)
  if (process.env.NODE_ENV !== "production") {
    //console.debug('📤', config.method, (config.baseURL || '') + (config.url || ''));
  }

  return config;
});

AxiosInstance.interceptors.request.use((config) => {
  // Fix: enlève le slash initial de l'URL pour éviter l'écrasement du baseURL
  if (config.url?.startsWith('/')) {
    config.url = config.url.slice(1);
  }

  if (typeof window !== "undefined") {
    const access = getCookie(ACCESS_COOKIE) as string | undefined;
    if (access) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${access}`;
    }
  }

  return config;
});
export default AxiosInstance;
