//C:\Users\alma2\Documents\Final Project\caposa-ui\app\lib\axiosInstance.ts
import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const BASE_URL = 'http://127.0.0.1:8000/api/';

const AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// ---- Helpers
const ACCESS_COOKIE = process.env.NEXT_PUBLIC_TOKEN_NAME || process.env.TOKEN_NAME || "auth_token";
const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_TOKEN || process.env.REFRESH_TOKEN || "refresh_token";

const isJwtExpired = (token?: string | null) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
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
    if (config.url?.startsWith('/')) {
      config.url = config.url.slice(1);
    }

    if (config.url?.includes('auth/refresh/')) {
      return config;
    }

    if (typeof window !== "undefined") {
      let access = getCookie(ACCESS_COOKIE) as string | undefined;
      const refresh = getCookie(REFRESH_COOKIE) as string | undefined;

      if (isJwtExpired(access) && refresh) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const res = await axios.post(`${BASE_URL}auth/refresh/`, { refresh });
            const newAccess = res.data.access;
            setCookie(ACCESS_COOKIE, newAccess, { maxAge: 60 * 60 * 24, path: '/' });
            onRefreshed(newAccess);
            access = newAccess;
          } catch (e) {
            deleteCookie(ACCESS_COOKIE);
            deleteCookie(REFRESH_COOKIE);
            onRefreshed(null);
            access = undefined;
            window.location.href = '/login';
          } finally {
            isRefreshing = false;
          }
        } else {
          const result = await new Promise<string | null>((resolve) => {
            pendingQueue.push(resolve);
          });
          access = result ?? undefined;
        }
      }

      if (access) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${access}`;
      }
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

export default AxiosInstance;