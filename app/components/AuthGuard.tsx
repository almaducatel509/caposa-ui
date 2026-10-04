/* ─────────────────────────────────────────────────────────────────────────────
caposa-ui\app\components\AuthGuard.tsx *
 * Utilise NextAuth — le rôle vient du JWT Django décodé dans auth.ts (NextAuth).
 * ───────────────────────────────────────────────────────────────────────────── */
// AuthGuard.tsx
/* ─────────────────────────────────────────────────────────────────────────────
 * caposa-ui\app\components\AuthGuard.tsx
 *
 * Utilise NextAuth — le rôle vient du JWT Django décodé dans auth.ts (NextAuth).
 * ───────────────────────────────────────────────────────────────────────────── */
import { UserRole, ROLE_ROUTES,  } from '@/app/lib/auth';

// ── le reste de la logique du guard (non montré ici) continue d'utiliser
//    UserRole / ROLE_ROUTES / getRole importés, sans les redéfinir localement



/* ─── Temporaire — hardcodé pour tester sans API ─────────────────────────── */
/* ↓↓↓ Change cette valeur pour tester un autre dashboard ↓↓↓ */
const MOCK_ROLE: UserRole = 'caissier';
/* ↑↑↑ Supprime ce bloc quand NextAuth retourne le vrai rôle ↑↑↑ */

export function getRole(): UserRole {
  return MOCK_ROLE;
  /* TODO: quand NextAuth est branché, remplace par :
   * import { useSession } from 'next-auth/react';
   * const { data: session } = useSession();
   * return (session?.user?.role as UserRole) ?? 'caissier';
   * C:\Users\alma2\Documents\Final Project\caposa-ui\app\components\AuthGuard.tsx
   */
}