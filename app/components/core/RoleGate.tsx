'use client';

import { ReactNode } from 'react';
import { useUserRoles } from '@/app/lib/useUserRoles';

interface RoleGateProps {
  /** Un ou plusieurs rôles requis (ex: 'administrateur' ou ['superviseur', 'directeur']) */
  roles: string | string[];
  /** Contenu affiché si l'utilisateur n'a pas les droits requis (par défaut: null) */
  fallback?: ReactNode;
  /** Contenu affiché pendant le chargement de la session (par défaut: null) */
  loadingFallback?: ReactNode;
  /** Composants enfants à afficher si l'autorisation est accordée */
  children: ReactNode;
}

/**
 * RoleGate — Affiche conditionnellement ses enfants selon les rôles de l'utilisateur connecté.
 *
 * @example
 * // Afficher un bouton uniquement aux administrateurs et directeurs
 * <RoleGate roles={['administrateur', 'directeur']}>
 *   <DeleteBranchButton id={branch.id} />
 * </RoleGate>
 *
 * @example
 * // Afficher un message de fallback si non autorisé
 * <RoleGate roles="tresorier" fallback={<p>Accès réservé au trésorier.</p>}>
 *   <VaultManagement />
 * </RoleGate>
 */
export function RoleGate({
  roles,
  fallback = null,
  loadingFallback = null,
  children,
}: RoleGateProps) {
  const { hasRole, loading } = useUserRoles();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  const roleList = Array.isArray(roles) ? roles : [roles];

  if (!hasRole(...roleList)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
