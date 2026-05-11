// members/utils.ts (or keep your current filename)

import { formatDate } from "@/config/appConfig";
import type { MemberData } from "./validations";
import { formatMoney, accountTypeLabel } from "./validations";
// ^ reuse these to avoid duplicate logic

export const toStr = (v: unknown) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

export const lc = (v: unknown) => toStr(v).toLowerCase();

export function monthsSince(dateISO?: string | null): number {
  if (!dateISO) return 0;
  const d = new Date(dateISO);
  if (Number.isNaN(+d)) return 0;
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

export function calculateAge(dateISO?: string | null) {
  if (!dateISO) return null;
  const d = new Date(dateISO);
  if (Number.isNaN(+d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function formatDateTime(date?: string | null) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (Number.isNaN(+d)) return "N/A";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatGender(g?: string) {
  return g === "M" ? "Homme" : g === "F" ? "Femme" : "—";
}

// Re-export aliases if you like this naming where used
// Dans utils.ts
export function formatBalance(v?: string | number | null): string {
  if (v == null) return '—';
  const num = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'HTG' }).format(num);
}

export { accountTypeLabel, formatDate };  // reuse single source

export type Tier = "junior" | "standard" | "senior";

export function tierOf(m: MemberData): Tier {
  const mths = monthsSince(m.created_at ?? null);
  const seniority = mths >= 24 ? 2 : mths >= 6 ? 1 : 0;
  const amount = m.total_amount ?? m.initial_balance ?? 0;
  const amountScore = amount > 5000 ? 2 : amount >= 500 ? 1 : 0;
  const score = seniority + amountScore;
  if (score >= 4) return "senior";
  if (score >= 2) return "standard";
  return "junior";
}

export function tierLabel(t: Tier) {
  return t === "senior" ? "Ancien / Montant élevé" : t === "standard" ? "Actif" : "Nouveau";
}

export function tierColor(t: Tier) {
  return t === "senior" ? "success" : t === "standard" ? "primary" : "default";
}
/**
 * Calcule le solde total d'un membre à partir de ses comptes.
 * Ignore les comptes fermés (account_status === false).
 */
export function computeMemberBalance(accounts?: MemberData["accounts"]) {
  if (!accounts?.length) {
    return { totalBalance: 0, accountsCount: 0 };
  }

  let totalBalance = 0;
  let accountsCount = 0;

  for (const acc of accounts) {
    if (acc.account_status === false) continue;

    const balance = typeof acc.balance === "string" 
      ? parseFloat(acc.balance) 
      : acc.balance ?? 0;
    if (Number.isNaN(balance)) continue;

    totalBalance += balance;
    accountsCount++;
  }

  return { totalBalance, accountsCount };
}
/**
 * Détermine si un type de compte est un passif (dette du membre).
 */
export const isLiabilityAccount = (accountType?: string): boolean => {
  return accountType === "loan";
};

/**
 * Calcule le bilan financier d'un membre à partir de ses comptes.
 * Sépare actif (épargne, chèques, investissement) et passif (prêts).
 * Ignore les comptes fermés (account_status === false).
 *
 * NOTE : Tant que le backend renvoie un account_type non normalisé
 * (ex: "Default Account Type"), tout sera classé en actif.
 * La séparation s'activera automatiquement quand le backend
 * renverra "loan" pour les prêts.
 */
export function computeMemberFinancials(accounts?: MemberData["accounts"]) {
  if (!accounts?.length) {
    return { totalAssets: 0, totalLiabilities: 0, netBalance: 0, activeAccountsCount: 0 };
  }

  let totalAssets = 0;
  let totalLiabilities = 0;
  let activeAccountsCount = 0;

  for (const acc of accounts) {
    if (acc.account_status === false) continue;

    const balance = typeof acc.balance === "string" 
      ? parseFloat(acc.balance) 
      : acc.balance ?? 0;
    if (Number.isNaN(balance)) continue;

    activeAccountsCount++;

    if (isLiabilityAccount(acc.account_type)) {
      totalLiabilities += Math.abs(balance);
    } else {
      totalAssets += balance;
    }
  }

  return {
    totalAssets,
    totalLiabilities,
    netBalance: totalAssets - totalLiabilities,
    activeAccountsCount,
  };
}