'use client';
import { useReactiveGetCookie } from 'cookies-next';

export function useAuthStatus() {
  const getCookie = useReactiveGetCookie();
  const token = getCookie('authjs.session-token');
  return Boolean(token);
}
