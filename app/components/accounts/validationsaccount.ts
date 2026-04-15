import { z } from 'zod';

/* =========================================================
   BASE TYPES - ALIGNÉS AVEC L'API BACKEND
========================================================= */

export interface AccountData {
  [x: string]: any; //Cet objet peut avoir d’autres propriétés que celles listées, tant que la clé est une string.
  limiteCredit: any;
  // ⬇️ Champs exacts de l'API
  id: string;
  account_number: string;         // ← API renvoie "account_number" // [Bloc membre] – [Bloc produit] – [Séquence unique]
  member: string;                 // ← API renvoie "member" (UUID)
  account_type: string;           // ← API renvoie "account_type"
  balance: string;                // ← API renvoie "balance" en string
  account_status: boolean;        // ← API renvoie "account_status" en boolean
  created_by: string;
  created_at: string;
  updated_at: string;

  // ⬇️ Champs calculés/enrichis côté front
  id_membre?: string;             // ← Alias pour "member"
  typeCompte?: 'epargne' | 'cheques' | 'terme';  // ← Mappé depuis "account_type"
  soldeActuel?: number;           // ← Mappé depuis "balance"
  statusAccount: 'ouvert' | 'fermé' | 'gelé' | 'en_attente' //← Mappé depuis "account_status"

// ouvert     → transactions autorisées
// fermé      → compte clôturé définitivement
// gelé       → transactions bloquées temporairement (saisie, litige)
// en_attente → compte créé mais pas encore activé (KYC en cours)// 

  // ⬇️ Champs optionnels pour la création/modification
  dateOuverture?: string;
  dateFermeture?: string | null;
  tauxInteret?: number | null;
  limiteTrait?: number | null;
  fraisServiceMensuel?: number | null;

  // ⬇️ Relations
  member_details?: MemberData;
  transactions?: TransactionData[];

  // ⬇️ Stats
  total_transactions?: number;
  total_deposits?: number;
  total_withdrawals?: number;
  last_transaction_date?: string;
}

export interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  
  // Champs optionnels de l'API
  email?: string | null;
  phone_number?: string;
  address?: string;
  city?: string;
  department?: string;
  date_of_birthday?: string;
  gender?: string;
  photo_profil?: string | null;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Computed
  full_name?: string;
  accounts?: any[];  // Pour éviter les références circulaires
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
   FORM DATA TYPE (pour les formulaires)
========================================================= */

export interface AccountFormData {
  id_membre: string;
  typeCompte: 'epargne' | 'cheques' | 'terme' | '';
  statutCompte: 'actif' | 'ferme' | 'suspendu';
  dateOuverture: string;
  dateFermeture?: string | null;
  soldeActuel?: number;
  tauxInteret?: number | null;
  limiteTrait?: number | null;
  fraisServiceMensuel?: number | null;
}

/* =========================================================
   MAPPERS - Convertir API ↔ Form
========================================================= */

/**
 * Convertit les données de l'API vers le format utilisé dans l'UI
 */
export function mapApiAccountToFormData(apiAccount: AccountData): AccountData {
  return {
    ...apiAccount,
    id_membre: apiAccount.member,
    soldeActuel: parseFloat(apiAccount.balance || '0'),
    statutCompte: apiAccount.account_status ? 'actif' : 'ferme',
    typeCompte: mapAccountTypeFromApi(apiAccount.account_type),
    dateOuverture: apiAccount.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
}

/**
 * Mappe le type de compte de l'API vers notre enum
 */
function mapAccountTypeFromApi(apiType: string): 'epargne' | 'cheques' | 'terme' {
  const lowerType = apiType.toLowerCase();
  if (lowerType.includes('epargne') || lowerType.includes('savings')) return 'epargne';
  if (lowerType.includes('cheque') || lowerType.includes('checking')) return 'cheques';
  if (lowerType.includes('terme') || lowerType.includes('term')) return 'terme';
  return 'epargne'; // default
}

/**
 * Mappe notre enum vers le format attendu par l'API
 */
function mapAccountTypeToApi(type: 'epargne' | 'cheques' | 'terme'): string {
  const mapping = {
    'epargne': 'Savings Account',
    'cheques': 'Checking Account',
    'terme': 'Term Deposit Account'
  };
  return mapping[type];
}

/* =========================================================
   CREATE SCHEMA (pour la création de compte)
========================================================= */
export const createAccountSchema = z.object({
  id_membre: z.string().uuid("Membre invalide"),
  typeCompte: z.enum(['epargne', 'cheques', 'terme']),
  statutCompte: z.enum(['actif', 'ferme', 'suspendu']).default('actif'),
  dateOuverture: z.string().default(() => new Date().toISOString().split("T")[0]),
  tauxInteret: z.number().min(0).nullable().optional(),
  limiteTrait: z.number().min(0).nullable().optional(),
  fraisServiceMensuel: z.number().min(0).nullable().optional(),
})
.superRefine((data, ctx) => {
  // Règle compte chèques
  if (data.typeCompte === "cheques" && !data.limiteTrait) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["limiteTrait"],
      message: "Limite de retrait requise pour un compte chèques",
    });
  }

  // Règle compte à terme
  if (data.typeCompte === "terme" && !data.tauxInteret) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tauxInteret"],
      message: "Taux d'intérêt requis pour un compte à terme",
    });
  }
});

/* =========================================================
   UPDATE SCHEMA (pour la modification)
========================================================= */
export const updateAccountSchema = z.object({
  statutCompte: z.enum(["actif", "ferme", "suspendu"]).optional(),
  fraisServiceMensuel: z.number().min(0).nullable().optional(),
  dateFermeture: z.string().nullable().optional(),
  tauxInteret: z.number().min(0).nullable().optional(),
  limiteTrait: z.number().min(0).nullable().optional(),
})
.refine((data) => {
  if (data.statutCompte === "ferme" && !data.dateFermeture) {
    return false;
  }
  return true;
}, {
  message: "La date de fermeture est requise pour un compte fermé",
  path: ["dateFermeture"]
});

/* =========================================================
   TYPES INFÉRÉS
========================================================= */
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

/* =========================================================
   VALIDATION MÉTIER (côté UI)
========================================================= */

export function validateAccountUpdate(
  account: { soldeActuel?: number; dateOuverture: string; typeCompte?: string }, 
  updates: { statutCompte: string; dateFermeture?: string | null; tauxInteret?: number; limiteTrait?: number }
) {
  const errors: Record<string, string> = {};

  // Règle 1: solde doit être 0 avant fermeture
  if (updates.statutCompte === "ferme" && (account.soldeActuel || 0) !== 0) {
    errors.statutCompte = `Impossible de fermer: solde actuel ${account.soldeActuel}`;
  }

  // Règle 2: date fermeture >= date ouverture
  if (updates.dateFermeture) {
    const ouv = new Date(account.dateOuverture);
    const ferm = new Date(updates.dateFermeture);
    if (ferm < ouv) {
      errors.dateFermeture = "La date de fermeture ne peut être antérieure à la date d'ouverture";
    }
  }

  // Règle 3: intérêt → seulement pour comptes terme
  if (updates.tauxInteret !== undefined && account.typeCompte !== "terme") {
    errors.tauxInteret = "Le taux n'est modifiable que pour les comptes à terme";
  }

  // Règle 4: limite retrait → seulement pour chèques
  if (updates.limiteTrait !== undefined && account.typeCompte !== "cheques") {
    errors.limiteTrait = "La limite de retrait n'est modifiable que pour les comptes chèques";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/* =========================================================
   BUILD UPDATE PAYLOAD
========================================================= */

export function buildUpdatePayload(
  account: { id: string; typeCompte?: string }, 
  formData: { statutCompte: string; fraisServiceMensuel?: number; dateFermeture?: string | null; tauxInteret?: number; limiteTrait?: number }
) {
  const payload: any = {
    statutCompte: formData.statutCompte,
    fraisServiceMensuel: formData.fraisServiceMensuel,
  };

  if (formData.statutCompte === "ferme") {
    payload.dateFermeture = formData.dateFermeture;
  }

  if (account.typeCompte === "terme") {
    payload.tauxInteret = formData.tauxInteret;
  }

  if (account.typeCompte === "cheques") {
    payload.limiteTrait = formData.limiteTrait;
  }

  return payload;
}

/* =========================================================
   MESSAGES ET HELPERS
========================================================= */

export const FIELD_MESSAGES = {
  account_number: "🔒 Identifiant unique et permanent du compte (non modifiable)",
  id_membre: "🔒 Pour changer de titulaire, fermez ce compte et créez-en un nouveau",
  soldeActuel: "💰 Modifiable uniquement via des transactions",
  typeCompte: "🔒 Type de compte défini à la création",
  dateOuverture: "📅 Date de création du compte (non modifiable)",
} as const;

export function toAccountFormData(account: AccountData): AccountFormData {
  return {
    id_membre: account.member || account.id_membre || '',
    typeCompte: account.typeCompte || 'epargne',
    statutCompte: account.statutCompte || (account.account_status ? 'actif' : 'ferme'),
    dateOuverture: account.dateOuverture || account.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    dateFermeture: account.dateFermeture,
    soldeActuel: account.soldeActuel || parseFloat(account.balance || '0'),
    tauxInteret: account.tauxInteret,
    limiteTrait: account.limiteTrait,
    fraisServiceMensuel: account.fraisServiceMensuel,
  };
}

export function getTransactionSummary(account: AccountData) {
  const txs = account.transactions || [];

  const deposits = txs
    .filter(t => t.transaction_type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  const withdrawals = txs
    .filter(t => t.transaction_type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  const netFlow = deposits - withdrawals;

  return { deposits, withdrawals, netFlow };
}