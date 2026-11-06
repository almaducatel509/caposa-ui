// app/components/accounts/accountRules.ts
//
// Source unique des règles d'éligibilité des actions sur les comptes.
// Utilisée par le menu (compteurs / désactivation) ET par le modal (admissibles / refusés).
// Le backend reste l'autorité finale : ces règles servent à guider l'utilisateur.

import { AccountData } from "@/app/components/accounts/validationsaccount";


export type AccountBulkAction =
  | 'approve'    // en_attente → actif (superviseur / direction, principe des 4 yeux côté backend)
  | 'activate'   // gelé → actif
  | 'suspend'    // actif → gelé
  | 'close'      // fermeture définitive
  | 'export';

export type NormalizedAccountStatus = 'ouvert' | 'en_attente' | 'gelé' | 'fermé' | 'archive' | string;

export function normalizeAccountStatus(raw: string | undefined): NormalizedAccountStatus {
  switch ((raw ?? '').toLowerCase().trim()) {
    case 'ouvert': case 'actif': case 'active': case 'open':
      return 'ouvert';
    case 'en_attente': case 'pending':
      return 'en_attente';
    case 'gelé': case 'gele': case 'suspendu': case 'suspended': case 'frozen':
      return 'gelé';
    case 'fermé': case 'ferme': case 'closed':
      return 'fermé';
    case 'archive': case 'archivé': case 'archived':
      return 'archive';
    default:
      return (raw ?? '').toLowerCase().trim();
  }
}

/** Raisons pour lesquelles l'action est refusée sur ce compte (tableau vide = admissible). */
export function getRefusalReasons(action: AccountBulkAction, acc: AccountData): string[] {
  const reasons: string[] = [];
  const status = normalizeAccountStatus((acc as any).statusAccount ?? acc.account_status);
  const solde  = acc.soldeActuel ?? parseFloat((acc as any).balance ?? '0');
  const isDead = status === 'fermé' || status === 'archive';

  switch (action) {
    case 'approve':
      if (status !== 'en_attente') reasons.push("Seuls les comptes en attente peuvent être approuvés");
      break;

    case 'activate':
      if (status === 'en_attente') reasons.push("En attente d'approbation — utilisez « Approuver »");
      else if (status === 'ouvert') reasons.push('Compte déjà ouvert');
      else if (isDead)              reasons.push('Compte fermé — impossible de débloquer');
      break;

    case 'suspend':
      if (status === 'en_attente') reasons.push('Compte pas encore approuvé');
      else if (status === 'gelé')   reasons.push('Compte déjà gelé');
      else if (isDead)              reasons.push('Compte fermé — impossible de geler');
      break;

    case 'close':
      if (isDead) {
        reasons.push('Compte déjà fermé');
        break;
      }
      if (solde !== 0)
        reasons.push(`Solde non nul : ${solde.toLocaleString('fr-FR')} HTG`);
      if (status === 'gelé')
        reasons.push("Compte gelé — veuillez d'abord le débloquer");
      if (acc.typeCompte === 'terme' && !(acc as any).maturite_atteinte)
        reasons.push('Compte à terme non arrivé à maturité');
      break;

    case 'export':
      break;
  }
  return reasons;
}

export interface EligibilityResult {
  eligible: AccountData[];
  refused:  { account: AccountData; reasons: string[] }[];
}

export function checkEligibility(action: AccountBulkAction, accounts: AccountData[]): EligibilityResult {
  const eligible: AccountData[] = [];
  const refused: EligibilityResult['refused'] = [];
  for (const account of accounts) {
    const reasons = getRefusalReasons(action, account);
    if (reasons.length) refused.push({ account, reasons });
    else eligible.push(account);
  }
  return { eligible, refused };
}

export function countEligible(action: AccountBulkAction, accounts: AccountData[]): number {
  return accounts.filter(a => getRefusalReasons(action, a).length === 0).length;
}