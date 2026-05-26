import { z } from 'zod';

/* =========================================================
   ENUMS / TYPES DE BASE
========================================================= */

export const ACCOUNT_STATUSES = [
  "actif", "gele", "ferme", "en_attente", "archive",
] as const;
export type AccountStatus = typeof ACCOUNT_STATUSES[number];

export const ACCOUNT_TYPES = ["epargne", "cheques", "terme"] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

/* =========================================================
   TRANSITIONS D'ÉTAT (gardé : utilisé par AccountGrid / modals)
========================================================= */

const VALID_TRANSITIONS: Record<AccountStatus, AccountStatus[]> = {
  en_attente: ["actif", "ferme"],
  actif:      ["gele", "ferme"],
  gele:       ["actif", "ferme"],
  ferme:      ["archive"],
  archive:    [],
};

export function canTransitionStatus(from: AccountStatus, to: AccountStatus): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedNextStatuses(from: AccountStatus): AccountStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}

/* =========================================================
   INTERFACES
========================================================= */

export interface AccountData {
  id: string;
  account_number: string;
  member: string;
  account_type: string;
  balance: string;
  account_status: AccountStatus;
  created_by: string;
  created_at: string;
  updated_at: string;

  // Champs enrichis côté front
  id_membre?: string;
  typeCompte?: AccountType;
  soldeActuel?: number;

  // Champs métier optionnels
  dateOuverture?: string;
  dateFermeture?: string | null;
  tauxInteret?: number | null;
  limiteTrait?: number | null;
  limiteCredit?: number | null;
  fraisServiceMensuel?: number | null;

  // Relations
  member_details?: MemberData;
  transactions?: TransactionData[];

  // Stats agrégées
  total_transactions?: number;
  total_deposits?: number;
  total_withdrawals?: number;
  last_transaction_date?: string;

  // Spécifique compte à terme
  date_echeance?: string | null;
  duree_terme_mois?: number | null;
  maturite_atteinte?: boolean;
  penalite_retrait_anticipe?: number | null;
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
   ZOD — Création de compte (simple : 2 champs)
========================================================= */
export const createAccountSchema = z.object({
  id_membre: z.string().regex(
    /^\d{10,14}$/,
    "Numéro de membre invalide (10 à 14 chiffres requis)"
  ),

  typeCompte: z.enum(ACCOUNT_TYPES, {
    errorMap: () => ({ message: "Type de compte invalide" }),
  }),
});


export type CreateAccountInput = z.infer<typeof createAccountSchema>;

/* =========================================================
   MAPPERS API ↔ Front
========================================================= */

/** ⚠ TEMPORAIRE : tant que le backend ne génère pas account_number lui-même. */
const FRONTEND_GENERATES_ACCOUNT_NUMBER = true;

const TYPE_CODES: Record<AccountType, string> = {
  epargne: 'EP', cheques: 'CH', terme: 'TD',
};
// Compteur en mémoire pour la séquence (reset à chaque reload — OK pour démo)
let __seqCounter = 0;

export function generateTempAccountNumber(_memberId: string, _type: AccountType): string {
  const year     = new Date().getFullYear();          // 2026
  const branch   = '01';                              // Code succursale fixe pour la démo
  const sequence = String(++__seqCounter).padStart(6, '0'); // 000001, 000002…
  return `${year}-${branch}-${sequence}`;
}

function mapAccountTypeFromApi(apiType: string): AccountType {
  const t = apiType.toLowerCase();
  if (t.includes('epargne') || t.includes('savings'))  return 'epargne';
  if (t.includes('cheque')  || t.includes('checking')) return 'cheques';
  if (t.includes('terme')   || t.includes('term'))     return 'terme';
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

export function mapApiAccountToFormData(apiAccount: AccountData): AccountData {
  return {
    ...apiAccount,
    id_membre:    apiAccount.member,
    soldeActuel:  parseFloat(apiAccount.balance || '0'),
    typeCompte:   mapAccountTypeFromApi(apiAccount.account_type),
    dateOuverture: apiAccount.created_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
  };
}

/**
 * Transforme les données validées du formulaire en payload backend.
 * Reçoit un objet déjà validé par Zod (id_membre + typeCompte).
 */
export function mapFormDataToCreatePayload(input: CreateAccountInput) {
  return {
    member:         input.id_membre,
    account_type:   mapAccountTypeToApi(input.typeCompte),
    account_status: true,   // boolean temporaire (le backend attend ça)

    // ⚠ TEMPORAIRE
    ...(FRONTEND_GENERATES_ACCOUNT_NUMBER && {
      account_number: generateTempAccountNumber(input.id_membre, input.typeCompte),
    }),
  };
}

/* =========================================================
   LABELS UI (gardés : utilisés par AccountTable, etc.)
========================================================= */

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  actif:      "Ouvert",
  gele:       "Gelé",
  ferme:      "Fermé",
  en_attente: "En attente",
  archive:    "Archivé",
};

export const ACCOUNT_STATUS_DESCRIPTIONS: Record<AccountStatus, string> = {
  actif:      "Le compte fonctionne normalement. Toutes transactions autorisées.",
  gele:       "Compte gelé temporairement. Aucune transaction permise.",
  ferme:      "Compte fermé définitivement. Solde à zéro.",
  en_attente: "Compte créé mais pas encore activé.",
  archive:    "Compte archivé pour conformité et audit.",
};