// app/lib/api/accounts.ts
import AxiosInstance from "@/app/lib/axiosInstance";
import {
  createAccountSchema,
  CreateAccountInput,
} from "@/app/components/accounts/validationsaccount";
import type { AccountData } from "@/app/components/accounts/validationsaccount";
import { enrichAccountData } from "@/app/components/accounts/mockAccountData";

function parseApiError(error: any, fallback = "Une erreur est survenue.") {
  // 404 → endpoint pas encore implémenté côté backend
  if (error?.response?.status === 404) {
    return "Endpoint indisponible (route backend manquante).";
  }
  if (error?.response?.data?.message) return error.response.data.message;
  // Ne stringify QUE si c'est un objet JSON — sinon on récupère du HTML
  // (pages d'erreur Django en mode DEBUG=True) qui pollue l'UI.
  if (error?.response?.data && typeof error.response.data === 'object') {
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

// ─── Pré-cycle : éligibilité ─────────────────────────────────────────────────
//
// Soft check appelé à la sélection du membre dans le wizard d'ouverture.
// Le HARD check reste obligatoire côté backend dans POST /accounts/.
//
// Endpoint backend attendu :
//   GET /members/{id}/eligibility/?account_type=epargne|cheques|terme
//   → { eligible: boolean, reasons: string[] }
//
// ⚠ FEATURE FLAG : tant que le backend n'a pas livré l'endpoint,
//   on bypasse le check pour ne pas bloquer le développement du wizard.
//   Passer ELIGIBILITY_CHECK_ENABLED à `true` une fois l'endpoint dispo.
// ─────────────────────────────────────────────────────────────────────────────

// TODO: passer à true quand l'endpoint GET /members/{id}/eligibility/ sera livré côté backend
const ELIGIBILITY_CHECK_ENABLED = false;

export const checkMemberEligibility = async (
  memberId: string,
  accountType?: 'epargne' | 'cheques' | 'terme'
): Promise<{ eligible: boolean; reasons: string[] }> => {
  // Bypass temporaire — endpoint backend pas encore livré
  if (!ELIGIBILITY_CHECK_ENABLED) {
    console.warn("[checkMemberEligibility] bypass actif — endpoint backend non disponible");
    return { eligible: true, reasons: [] };
  }

  try {
    const { data } = await AxiosInstance.get(
      `/members/${memberId}/eligibility/`,
      { params: accountType ? { account_type: accountType } : {} }
    );
    return data;
  } catch (e: any) {
    console.error("Erreur checkMemberEligibility:", e);
    throw new Error(parseApiError(e, "Impossible de vérifier l'éligibilité."));
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
      account_status: 'gele',         // bon champ + sans accent
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
      account_status: 'actif',        // 'ouvert' → 'actif'
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
      account_status: 'ferme',        // sans accent
      closure_reason: payload.reason,
      dateFermeture: new Date().toISOString().split('T')[0],
    });

    return enrichOne(data);
  } catch (e: any) {
    console.error("Erreur closeAccount:", e);
    throw new Error(parseApiError(e, "Impossible de fermer le compte."));
  }
};