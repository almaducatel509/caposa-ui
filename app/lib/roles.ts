/**
 * roles.ts — normalisation des rôles (utilisable côté serveur ET client)
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/lib/roles.ts  (PAS de 'use client' / 'use server')
 *
 * Django renvoie `roles` dans la réponse de POST /auth/login/.
 * On ne suppose pas sa forme exacte : chaînes ("Superviseur"),
 * codes ("superviseur") ou objets ({ name } / { code }).
 * Tout est ramené à une clé simple : minuscules, sans accents, sans espaces
 * superflus — "Trésorier" et "tresorier" deviennent la même chose.
 * ─────────────────────────────────────────────────────────────────
 */

export function normalizeRole(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // retire les accents
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');             // "agent de credit" → "agent_de_credit"
}

/** Accepte n'importe quelle forme renvoyée par Django et rend une liste propre, sans doublons. */
export function normalizeRoles(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out = raw
    .map(r => {
      if (typeof r === 'string') return r;
      if (r && typeof r === 'object') {
        const o = r as Record<string, unknown>;
        return String(o.code ?? o.name ?? o.label ?? '');
      }
      return '';
    })
    .filter(Boolean)
    .map(normalizeRole);
  return Array.from(new Set(out));
}