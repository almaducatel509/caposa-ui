/* ─────────────────────────────────────────────────────────────────────────────
 * app/lib/auth.ts — Rôles et routes CAPOSA
 
 * Utilise NextAuth — le rôle vient du JWT Django décodé dans auth.ts (NextAuth).
 * ───────────────────────────────────────────────────────────────────────────── */

/* ─── Temporaire — hardcodé pour tester sans API ─────────────────────────── 
app/lib/auth.ts (les rôles et routes) — Gestion du routing par rôle : UserRole, 
ROLE_ROUTES (quel dashboard pour quel rôle), et getRole() qui est encore mocké en dur (MOCK_ROLE = 'caissier'). 
Le TODO dans le fichier dit clairement qu'il faudra le brancher sur useSession() 
une fois que session.user.role existe réellement.
*/

/* ─────────────────────────────────────────────────────────────────────────────
 * app/lib/auth.ts — Rôles et routes CAPOSA
 *
 * Utilise NextAuth — le rôle vient du JWT Django décodé dans auth.ts (NextAuth).
 * ───────────────────────────────────────────────────────────────────────────── */

export type UserRole =
  | 'conseiller'
  | 'caissier'
  | 'superviseur'
  | 'tresorier'
  | 'administrateur'
  | 'directeur';

export const ROLE_ROUTES: Record<UserRole, string> = {
  conseiller:     '/dashboard/advisor',
  caissier:       '/dashboard/cashier',
  superviseur:    '/dashboard/supervisor',
  tresorier:      '/dashboard/tresorier',
  administrateur: '/dashboard/admin',
  directeur:      '/dashboard/director',
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