// members/utils.ts (or keep your current filename)

import type { MemberData } from "./validations";
import { formatMoney, accountTypeLabel, formatDate } from "./validations";
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
export const formatBalance = formatMoney; // alias
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
