/* ─────────────────────────────────────────────────────────────────────────────
 * app/lib/auth.ts — Rôles et routes CAPOSA
 *
 * Utilise NextAuth — le rôle vient du JWT Django décodé dans auth.ts (NextAuth).
 * ───────────────────────────────────────────────────────────────────────────── */

export type UserRole = 'caissier' | 'directeur' | 'superviseur' | 'tresorier';

export const ROLE_ROUTES: Record<UserRole, string> = {
  caissier:    '/dashboard/cashier',
  directeur:   '/dashboard/director',
  superviseur: '/dashboard/supervisor',
  tresorier:   '/dashboard/tresorier',
};

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
   */
}