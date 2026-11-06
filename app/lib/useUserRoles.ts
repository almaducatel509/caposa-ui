'use client';

/**
 * useUserRoles.ts — rôles de l'utilisateur connecté, lus depuis la session NextAuth
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/lib/useUserRoles.ts
 *
 * Usage dans un composant :
 *   const { hasRole, loading } = useUserRoles();
 *   const canDecide = hasRole('superviseur', 'directeur', 'administrateur');
 *
 * Les rôles sont fixés à la connexion : si un poste change côté Django,
 * l'utilisateur doit se reconnecter pour que ça se reflète ici.
 * L'UI s'en sert seulement pour afficher ou masquer des boutons —
 * le backend reste le seul à autoriser réellement une action.
 * ─────────────────────────────────────────────────────────────────
 */

import { useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { normalizeRole } from './roles';        
export function useUserRoles() {
  const { data: session, status } = useSession();

  const roles = useMemo<string[]>(
    () => ((session?.user as { roles?: string[] } | undefined)?.roles ?? []),
    [session],
  );

  /** Vrai si l'utilisateur a AU MOINS UN des rôles donnés (accents et casse ignorés). */
  const hasRole = useCallback(
    (...wanted: string[]) => wanted.some(w => roles.includes(normalizeRole(w))),
    [roles],
  );

  return {
    roles,
    hasRole,
    loading: status === 'loading',
    username: (session?.user as { username?: string } | undefined)?.username ?? '',
  };
}