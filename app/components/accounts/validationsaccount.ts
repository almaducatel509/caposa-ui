import { z } from 'zod';

/* =========================================================
   ENUMS / TYPES DE BASE
========================================================= */

/**
 * Statuts d'un compte bancaire (modèle core banking).
 * Aligné sur les standards des coopératives de crédit / Desjardins / Mambu.
 */
export const ACCOUNT_STATUSES = [
  "actif",
  "gele",        // ⬅️ était "gelé"
  "ferme",       // ⬅️ était "fermé"
  "en_attente",  // ⬅️ était "en-attente"
  "archive",
] as const;

export type AccountStatus = typeof ACCOUNT_STATUSES[number];

export const ACCOUNT_TYPES = ["epargne", "cheques", "terme"] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

/* =========================================================
   TRANSITIONS D'ÉTAT VALIDES
========================================================= */

/**
 * Table des transitions autorisées entre statuts de compte.
 * Toute transition hors de cette table est interdite.
 */
const VALID_TRANSITIONS: Record<AccountStatus, AccountStatus[]> = {
  en_attente: ["actif", "ferme"],      // ⬅️ clé + valeurs
  actif:      ["gele", "ferme"],       // ⬅️ valeurs
  gele:       ["actif", "ferme"],      // ⬅️ clé + valeurs
  ferme:      ["archive"],             // ⬅️ clé
  archive:    [],
};

export function canTransitionStatus(from: AccountStatus, to: AccountStatus): boolean {
  if (from === to) return true; // pas de changement = autorisé
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedNextStatuses(from: AccountStatus): AccountStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}

/* =========================================================
   INTERFACES
========================================================= */

export interface AccountOption {
  id:             string;
  account_number: string;
  typeCompte:   'epargne' | 'cheques' | 'terme';
  balance:        number;
  account_status: 'actif' | 'gele' | 'en_attent' | 'ferme' | 'archive';
}

export interface AccountData {
  // ⬇️ Champs exacts de l'API
  id: string;
  account_number: string;          // [Bloc membre] – [Bloc produit] – [Séquence unique]
  member: string;                  // UUID du membre titulaire
  account_type: string;            // valeur brute de l'API
  balance: string;                 // string côté API (à parser via soldeActuel)
  account_status: AccountStatus;   // enum, plus de boolean
  created_by: string;
  created_at: string;
  updated_at: string;

  // ⬇️ Champs calculés / enrichis côté front
  id_membre?: string;              // alias pour "member"
  typeCompte?: AccountType;        // mappé depuis "account_type"
  soldeActuel?: number;            // mappé depuis "balance"

  // ⬇️ Champs métier optionnels
  dateOuverture?: string;
  dateFermeture?: string | null;
  tauxInteret?: number | null;
  limiteTrait?: number | null;
  limiteCredit?: number | null;
  fraisServiceMensuel?: number | null;

  // ⬇️ Relations
  member_details?: MemberData;
  transactions?: TransactionData[];

  // ⬇️ Stats agrégées
  total_transactions?: number;
  total_deposits?: number;
  total_withdrawals?: number;
  last_transaction_date?: string;
   // Spécifique aux comptes à terme
  date_echeance?: string | null;          // date contractuelle de maturité
  duree_terme_mois?: number | null;       // 3, 6, 12, 36, 60...
  maturite_atteinte?: boolean;            // dérivé : aujourd'hui >= date_echeance
  penalite_retrait_anticipe?: number | null;  // % de pénalité si retrait avant échéance

}

export interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;

  email?: string | null;
  phone_number?: string;
  address?: string;
  city?: string;
  department?: string;
  date_of_birthday?: string;
  gender?: string;
  photo_profil?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;

  full_name?: string;
  accounts?: AccountData[];
}

export interface TransactionData {
  id: string;
  reference_number: string;
  transaction_type: 'deposit' | 'withdrawal' | 'interest' | 'fee';
  amount: number;
  balance_after: number;
  status: string;
  date: string;
  description?: string;
  created_at?: string;
}

/* =========================================================
   FORM DATA (pour les formulaires UI)
========================================================= */

export interface AccountFormData {
  id_membre: string;
  typeCompte: AccountType | '';
  account_status: AccountStatus;
  dateOuverture: string;
  dateFermeture?: string | null;
  soldeActuel?: number;
  tauxInteret?: number | null;
  limiteTrait?: number | null;
  limiteCredit?: number | null;
  fraisServiceMensuel?: number | null;
}

/* =========================================================
   MAPPERS - API ↔ Form
========================================================= */

export function mapApiAccountToFormData(apiAccount: AccountData): AccountData {
  return {
    ...apiAccount,
    id_membre: apiAccount.member,
    soldeActuel: parseFloat(apiAccount.balance || '0'),
    typeCompte: mapAccountTypeFromApi(apiAccount.account_type),
    dateOuverture:
      apiAccount.created_at?.split('T')[0] ||
      new Date().toISOString().split('T')[0],
  };
}

function mapAccountTypeFromApi(apiType: string): AccountType {
  const lowerType = apiType.toLowerCase();
  if (lowerType.includes('epargne') || lowerType.includes('savings')) return 'epargne';
  if (lowerType.includes('cheque') || lowerType.includes('checking')) return 'cheques';
  if (lowerType.includes('terme') || lowerType.includes('term')) return 'terme';
  return 'epargne';
}

export function mapAccountTypeToApi(type: AccountType): string {
  const mapping: Record<AccountType, string> = {
    epargne: 'Savings Account',
    cheques: 'Checking Account',
    terme:   'Term Deposit Account',
  };
  return mapping[type];
}

export function toAccountFormData(account: AccountData): AccountFormData {
  return {
    id_membre: account.member || account.id_membre || '',
    typeCompte: account.typeCompte || 'epargne',
    account_status: account.account_status,
    dateOuverture:
      account.dateOuverture ||
      account.created_at?.split('T')[0] ||
      new Date().toISOString().split('T')[0],
    dateFermeture: account.dateFermeture,
    soldeActuel: account.soldeActuel ?? parseFloat(account.balance || '0'),
    tauxInteret: account.tauxInteret,
    limiteTrait: account.limiteTrait,
    limiteCredit: account.limiteCredit,
    fraisServiceMensuel: account.fraisServiceMensuel,
  };
}

/* =========================================================
   ZOD SCHEMAS
========================================================= */

export const createAccountSchema = z.object({
  id_membre: z.string().uuid("Membre invalide"),
  typeCompte: z.enum(ACCOUNT_TYPES),
  // À la création, un compte est "pending" (en attente d'activation/KYC) par défaut.
  account_status: z.enum(ACCOUNT_STATUSES).default("en_attente"),
  dateOuverture: z.string().default(() => new Date().toISOString().split("T")[0]),
  tauxInteret: z.number().min(0).nullable().optional(),
  limiteTrait: z.number().min(0).nullable().optional(),
  limiteCredit: z.number().min(0).nullable().optional(),
  fraisServiceMensuel: z.number().min(0).nullable().optional(),
})
.superRefine((data, ctx) => {
  if (data.typeCompte === "cheques" && !data.limiteTrait) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["limiteTrait"],
      message: "Limite de retrait requise pour un compte chèques",
    });
  }
  if (data.typeCompte === "terme" && !data.tauxInteret) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tauxInteret"],
      message: "Taux d'intérêt requis pour un compte à terme",
    });
  }
});

export const updateAccountSchema = z.object({
  account_status: z.enum(ACCOUNT_STATUSES).optional(),
  fraisServiceMensuel: z.number().min(0).nullable().optional(),
  dateFermeture: z.string().nullable().optional(),
  tauxInteret: z.number().min(0).nullable().optional(),
  limiteTrait: z.number().min(0).nullable().optional(),
  limiteCredit: z.number().min(0).nullable().optional(),
})
.refine((data) => {
  // Si on passe à "closed", la date de fermeture est obligatoire
  if (data.account_status === "ferme" && !data.dateFermeture) {
    return false;
  }
  return true;
}, {
  message: "La date de fermeture est requise pour un compte fermé",
  path: ["dateFermeture"],
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

/* =========================================================
   VALIDATION MÉTIER (UI)
========================================================= */

export function validateAccountUpdate(
  account: {
    soldeActuel?: number;
    dateOuverture: string;
    typeCompte?: AccountType;
    account_status: AccountStatus;
  },
  updates: {
    account_status?: AccountStatus;
    dateFermeture?: string | null;
    tauxInteret?: number;
    limiteTrait?: number;
    limiteCredit?: number;
  }
) {
  const errors: Record<string, string> = {};

  // Règle 1 : transition de statut autorisée ?
  if (updates.account_status && updates.account_status !== account.account_status) {
    if (!canTransitionStatus(account.account_status, updates.account_status)) {
      const allowed = getAllowedNextStatuses(account.account_status);
      errors.account_status =
        `Transition interdite : ${account.account_status} → ${updates.account_status}. ` +
        `Transitions autorisées : ${allowed.length > 0 ? allowed.join(", ") : "aucune (état terminal)"}.`;
    }
  }

  // Règle 2 : solde doit être 0 avant fermeture
  if (updates.account_status === "ferme" && (account.soldeActuel ?? 0) !== 0) {
    errors.account_status = `Impossible de fermer : solde actuel ${account.soldeActuel}. Le solde doit être à zéro.`;
  }

  // Règle 3 : date de fermeture >= date d'ouverture
  if (updates.dateFermeture) {
    const ouv  = new Date(account.dateOuverture);
    const ferm = new Date(updates.dateFermeture);
    if (ferm < ouv) {
      errors.dateFermeture = "La date de fermeture ne peut être antérieure à la date d'ouverture";
    }
  }

  // Règle 4 : on ne peut modifier un compte en archive
  if (account.account_status === "archive") {
    errors.account_status = "Un compte archivé ne peut plus être modifié";
  }

  // Règle 5 : taux d'intérêt → uniquement pour comptes à terme
  if (updates.tauxInteret !== undefined && account.typeCompte !== "terme") {
    errors.tauxInteret = "Le taux d'intérêt n'est modifiable que pour les comptes à terme";
  }

  // Règle 6 : limite de retrait → uniquement pour comptes chèques
  if (updates.limiteTrait !== undefined && account.typeCompte !== "cheques") {
    errors.limiteTrait = "La limite de retrait n'est modifiable que pour les comptes chèques";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/* =========================================================
   BUILD UPDATE PAYLOAD
========================================================= */

export function buildUpdatePayload(
  account: { id: string; typeCompte?: AccountType },
  formData: {
    account_status: AccountStatus;
    fraisServiceMensuel?: number;
    dateFermeture?: string | null;
    tauxInteret?: number;
    limiteTrait?: number;
    limiteCredit?: number;
  }
) {
  const payload: Record<string, unknown> = {
    account_status: formData.account_status,
    fraisServiceMensuel: formData.fraisServiceMensuel,
  };

  if (formData.account_status === "ferme") {
    payload.dateFermeture = formData.dateFermeture;
  }

  if (account.typeCompte === "terme") {
    payload.tauxInteret = formData.tauxInteret;
  }

  if (account.typeCompte === "cheques") {
    payload.limiteTrait = formData.limiteTrait;
    payload.limiteCredit = formData.limiteCredit;
  }

  return payload;
}

/* =========================================================
   MESSAGES & HELPERS UI
========================================================= */

export const FIELD_MESSAGES = {
  account_number: "🔒 Identifiant unique et permanent du compte (non modifiable)",
  id_membre:      "🔒 Pour changer de titulaire, fermez ce compte et créez-en un nouveau",
  soldeActuel:    "💰 Modifiable uniquement via des transactions",
  typeCompte:     "🔒 Type de compte défini à la création",
  dateOuverture:  "📅 Date de création du compte (non modifiable)",
} as const;

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  actif:     "Ouvert",
  gele:   "Gelé",
  ferme:   "Fermé",
  en_attente:  "En attente",
  archive: "Archivé",
};

export const ACCOUNT_STATUS_DESCRIPTIONS: Record<AccountStatus, string> = {
  actif:     "Le compte fonctionne normalement. Toutes transactions autorisées.",
  gele:   "Compte gelé temporairement. Aucune transaction permise (fraude, décès, litige, ordre légal).",
  ferme:   "Compte fermé définitivement. Solde à zéro. Plus aucune opération possible.",
  en_attente:  "Compte créé mais pas encore activé. Documents ou approbation requis.",
  archive: "Compte archivé pour conformité et audit. État terminal.",
};

export function getTransactionSummary(account: AccountData) {
  const txs = account.transactions || [];

  const deposits = txs
    .filter(t => t.transaction_type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  const withdrawals = txs
    .filter(t => t.transaction_type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  return { deposits, withdrawals, netFlow: deposits - withdrawals };
}