'use client';

/**
 * useLoanPermissions.ts — qui peut faire quoi sur un prêt
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/lib/useLoanPermissions.ts
 *
 * Source unique pour la liste des prêts, les actions groupées,
 * ReviewLoanModal et la fiche. Aucun composant ne teste un rôle
 * lui-même : il demande `canApprove`, `canDisburse`…
 *
 * Règles CAPOSA (séparation des tâches) :
 *   - agent de crédit : crée et suit les demandes
 *   - superviseur / directeur : approuvent ou rejettent, ne manipulent pas l'argent
 *   - caissier : décaisse et encaisse, ne valide jamais une demande
 *   - directeur / admin : seuls à pouvoir supprimer (pending ou rejected uniquement)
 *
 * Django vérifie aussi chaque action (403 sinon). Ces règles servent
 * à MASQUER ce qu'un rôle ne doit pas voir ; elles sont parfois plus
 * strictes que l'API (un superviseur peut décaisser côté Django).
 * ─────────────────────────────────────────────────────────────────
 */

import { useMemo } from 'react';
import { useUserRoles } from './useuserroles';
import type { LoanStatus } from '@/app/components/transactions/validation/loanSchema';

export type LoanAction = 'approve' | 'reject' | 'disburse' | 'repay' | 'delete';

// Plusieurs graphies acceptées : normalizeRole() retire accents et casse,
// "Agent de crédit" devient "agent_de_credit".
const APPROVERS  = ['superviseur', 'directeur', 'administrateur', 'admin'];
const CASHIERS   = ['caissier', 'administrateur', 'admin'];
const CREATORS   = ['agent_credit', 'agent_de_credit', 'conseiller', 'superviseur', 'directeur', 'administrateur', 'admin'];
const DELETERS   = ['directeur', 'administrateur', 'admin'];

export function useLoanPermissions() {
  const { hasRole, loading, roles } = useUserRoles();

  return useMemo(() => {
    const canApprove  = hasRole(...APPROVERS);
    const canDisburse = hasRole(...CASHIERS);
    const canRepay    = hasRole(...CASHIERS);
    const canCreate   = hasRole(...CREATORS);
    const canDelete   = hasRole(...DELETERS);

    /** Actions possibles pour CE prêt, selon son statut ET le rôle connecté. */
    const actionsFor = (status: LoanStatus): LoanAction[] => {
      const out: LoanAction[] = [];
      if (status === 'pending') {
        if (canApprove) out.push('approve', 'reject');
        if (canDelete)  out.push('delete');
      }
      if (status === 'approved') {
        if (canDisburse) out.push('disburse');
        if (canApprove)  out.push('reject');
      }
      if (status === 'active' && canRepay) out.push('repay');
      if (status === 'rejected' && canDelete) out.push('delete');
      return out;
    };

    return {
      loading,
      roles,
      canApprove,
      canDisburse,
      canRepay,
      canCreate,
      canDelete,
      /** Cases à cocher et barre d'actions groupées : seulement pour qui peut décider. */
      canBulkDecide: canApprove,
      actionsFor,
    };
  }, [hasRole, loading, roles]);
}