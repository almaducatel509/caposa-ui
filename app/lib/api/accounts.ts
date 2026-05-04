// app/lib/api/accounts.ts
import AxiosInstance from "@/app/lib/axiosInstance";
import {
  createAccountSchema,
  CreateAccountInput,
} from "@/app/components/accounts/validationsaccount";
import type { AccountData } from "@/app/components/accounts/validationsaccount";
import { enrichAccountData } from "@/app/components/accounts/mockAccountData";

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// 1. Toutes les lectures passent par `enrichAccountData()` (cohérence du state).
//
// 2. Les mutations de statut envoient le bon champ (`statusAccount`) avec les
//    BONNES valeurs métier ('ouvert' | 'gelé' | 'fermé').
//
// 3. SUPPRIMÉS (par rapport à la version précédente) :
//    - archiveAccount  : redondant avec closeAccount (un compte fermé EST archivé)
//    - activateAccount : pas d'état 'en_attente' → pas de transition à gérer
//
// 4. RESTANT (3 transitions seulement) :
//    - suspendAccount    : 'ouvert' → 'gelé'
//    - reactivateAccount : 'gelé'   → 'ouvert'
//    - closeAccount      : 'ouvert' | 'gelé' → 'fermé' (terminal, irréversible)
//
// ⚠ Le backend Django doit avoir un champ `status` à 3 choix
//   ('ouvert' | 'gelé' | 'fermé') sur le modèle Account.
// ─────────────────────────────────────────────────────────────────────────────

function parseApiError(error: any, fallback = "Une erreur est survenue.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data) {
    try { return JSON.stringify(error.response.data); } catch {}
  }
  return fallback;
}

const enrichOne  = (a: any): AccountData => enrichAccountData(a);
const enrichMany = (arr: any[]): AccountData[] => (arr ?? []).map(enrichOne);

// ─── READ ────────────────────────────────────────────────────────────────────

export const fetchAccounts = async (): Promise<AccountData[]> => {
  try {
    const { data } = await AxiosInstance.get("/accounts/");
    return enrichMany(data);
  } catch (e) {
    console.error("Erreur récupération comptes:", e);
    return [];
  }
};

export const fetchAccountById = async (id: string): Promise<AccountData | null> => {
  try {
    const { data } = await AxiosInstance.get(`/accounts/${id}/`);
    return data ? enrichOne(data) : null;
  } catch (e) {
    console.error("Erreur fetchAccountById:", e);
    return null;
  }
};

export const fetchAccountsForMember = async (memberId: string): Promise<AccountData[]> => {
  try {
    const { data } = await AxiosInstance.get(`/members/${memberId}/accounts/`);
    return enrichMany(data);
  } catch (err) {
    console.warn("fetchAccountsForMember fallback to /accounts/?member_id=", memberId);
    try {
      const { data } = await AxiosInstance.get(
        `/accounts/?member_id=${encodeURIComponent(memberId)}`
      );
      return enrichMany(data);
    } catch (e) {
      console.error("Erreur fetchAccountsForMember (fallback):", e);
      return [];
    }
  }
};

// ─── WRITE ───────────────────────────────────────────────────────────────────

export const createAccount = async (payload: unknown): Promise<AccountData> => {
  const parsed = createAccountSchema.safeParse(payload);
  if (!parsed.success) throw parsed.error;

  try {
    const { data } = await AxiosInstance.post(
      "/accounts/",
      parsed.data as CreateAccountInput
    );
    return enrichOne(data);
  } catch (error: any) {
    console.error("❌ Create account error:", error?.response?.data);
    throw new Error(parseApiError(error, "Impossible de créer le compte."));
  }
};

export const updateAccount = async (
  id: string,
  payload: unknown
): Promise<AccountData> => {
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, payload);
    return enrichOne(data);
  } catch (e: any) {
    console.error("Erreur updateAccount:", e);
    throw new Error(parseApiError(e, "Impossible de mettre à jour le compte."));
  }
};

export const deleteAccount = async (id: string): Promise<void> => {
  try {
    await AxiosInstance.delete(`/accounts/${id}/`);
  } catch (e: any) {
    console.error("Erreur deleteAccount:", e);
    throw new Error(parseApiError(e, "Impossible de supprimer le compte."));
  }
};

// ─── Transitions de statut (3 seulement) ─────────────────────────────────────

/** Geler un compte ouvert (transactions bloquées temporairement) */
export const suspendAccount = async (
  id: string,
  payload: { reason: string }
): Promise<AccountData> => {
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, {
      statusAccount: 'gelé',
      suspension_reason: payload.reason,
    });
    return enrichOne(data);
  } catch (e: any) {
    console.error("Erreur suspendAccount:", e);
    throw new Error(parseApiError(e, "Impossible de geler le compte."));
  }
};

/** Réactiver un compte gelé → retour à 'ouvert' */
export const reactivateAccount = async (
  id: string,
  payload: { reason?: string }
): Promise<AccountData> => {
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, {
      statusAccount: 'ouvert',
      reactivation_reason: payload.reason ?? '',
    });
    return enrichOne(data);
  } catch (e: any) {
    console.error("Erreur reactivateAccount:", e);
    throw new Error(parseApiError(e, "Impossible de réactiver le compte."));
  }
};

/** Fermer un compte définitivement → 'fermé' (terminal, irréversible) */
export const closeAccount = async (
  id: string,
  payload: { reason: string }
): Promise<AccountData> => {
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, {
      statusAccount: 'fermé',
      closure_reason: payload.reason,
      dateFermeture: new Date().toISOString().split('T')[0],
    });
    return enrichOne(data);
  } catch (e: any) {
    console.error("Erreur closeAccount:", e);
    throw new Error(parseApiError(e, "Impossible de fermer le compte."));
  }
};