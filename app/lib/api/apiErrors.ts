// app/lib/api/apiErrors.ts
import { isAxiosError } from 'axios';

/** Statuts de compte qui bloquent un dépôt (miroir de la règle backend). */
export const DEPOSIT_BLOCKED_STATUSES = ['en_attente', 'gele', 'ferme', 'archive'] as const;

export const DEPOSIT_BLOCK_REASON: Record<string, string> = {
  en_attente: "En attente d'approbation",
  gele: 'Compte gelé',
  ferme: 'Compte fermé',
  archive: 'Compte archivé',
};

export function canReceiveDeposit(status?: string | null): boolean {
  return status === 'actif';
}

export interface ParsedApiError {
  /** Erreurs par champ, déjà converties vers les noms de champs du formulaire. */
  fieldErrors: Record<string, string>;
  /** Message global à afficher (toast / bannière). */
  message: string;
}

/**
 * Convertit une erreur DRF (400) en erreurs de formulaire.
 * DRF renvoie soit { champ: "msg" }, soit { champ: ["msg1", "msg2"] }, plus un éventuel "detail".
 *
 * @param fieldMap correspondance clé API -> nom du champ du formulaire, ex. { account: 'idCompte' }
 */
export function parseApiError(
  error: unknown,
  fieldMap: Record<string, string> = {},
  fallback = "Une erreur est survenue. Veuillez réessayer.",
): ParsedApiError {
  const fieldErrors: Record<string, string> = {};

  // createDeposit relance une Error "propre" mais garde l'erreur Axios d'origine dans `cause`
  const raw = error instanceof Error && error.cause ? error.cause : error;

  if (!isAxiosError(raw)) {
    // Pas une erreur HTTP : on garde le message déjà lisible (describeError)
    return {
      fieldErrors,
      message: error instanceof Error ? error.message : fallback,
    };
  }

  if (!raw.response) {
    return {
      fieldErrors,
      message: "Impossible de joindre le serveur. Vérifiez votre connexion.",
    };
  }

  const data = raw.response.data as unknown;

  if (!data || typeof data !== 'object') {
    return { fieldErrors, message: fallback };
  }

  let detail: string | undefined;

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const msg = Array.isArray(value) ? String(value[0] ?? '') : typeof value === 'string' ? value : '';
    if (!msg) continue;

    if (key === 'detail' || key === 'non_field_errors') {
      detail ??= msg;
      continue;
    }
    fieldErrors[fieldMap[key] ?? key] = msg;
  }

  const message = detail ?? Object.values(fieldErrors)[0] ?? fallback;
  return { fieldErrors, message };
}