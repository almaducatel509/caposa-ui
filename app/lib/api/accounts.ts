// app/lib/api/accounts.ts
import AxiosInstance from "@/app/lib/axiosInstance";
import { createAccountSchema, CreateAccountInput } from "@/app/components/accounts/validationsaccount";
import type { AccountData } from "@/app/components/accounts/validationsaccount";

function parseApiError(error: any, fallback = "Une erreur est survenue.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data) {
    try { return JSON.stringify(error.response.data); } catch {}
  }
  return fallback;
}

/** Récupère la liste complète des comptes */
export const fetchAccounts = async (): Promise<AccountData[]> => {
  try {
    const { data } = await AxiosInstance.get("/accounts/");
    return data;
  } catch (e) {
    console.error("Erreur récupération comptes:", e);
    return [];
  }
};

/** Récupère un compte par ID */
export const fetchAccountById = async (id: string): Promise<AccountData | null> => {
  try {
    const { data } = await AxiosInstance.get(`/accounts/${id}/`);
    return data;
  } catch (e) {
    console.error("Erreur fetchAccountById:", e);
    return null;
  }
};

/** Récupère les comptes d'un membre */
export const fetchAccountsForMember = async (memberId: string): Promise<AccountData[]> => {
  try {
    const { data } = await AxiosInstance.get(`/members/${memberId}/accounts/`);
    return data;
  } catch (err) {
    console.warn("fetchAccountsForMember fallback to /accounts/?member_id=", memberId);
    try {
      const { data } = await AxiosInstance.get(`/accounts/?member_id=${encodeURIComponent(memberId)}`);
      return data;
    } catch (e) {
      console.error("Erreur fetchAccountsForMember (fallback):", e);
      return [];
    }
  }
};

/** CREATE */
export const createAccount = async (payload: unknown): Promise<AccountData> => {
  const parsed = createAccountSchema.safeParse(payload);
  if (!parsed.success) throw parsed.error;

  try {
    const { data } = await AxiosInstance.post("/accounts/", parsed.data as CreateAccountInput);
    return data;
  } catch (error: any) {
    console.error("❌ Create account error:", error?.response?.data);
    throw new Error(parseApiError(error, "Impossible de créer le compte."));
  }
};

/** UPDATE (champs modifiables uniquement) */
export const updateAccount = async (id: string, payload: unknown): Promise<AccountData> => {
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, payload);
    return data;
  } catch (e: any) {
    console.error("Erreur updateAccount:", e);
    throw new Error(parseApiError(e, "Impossible de mettre à jour le compte."));
  }
};

/** DELETE */
export const deleteAccount = async (id: string): Promise<void> => {
  try {
    await AxiosInstance.delete(`/accounts/${id}/`);
  } catch (e: any) {
    console.error("Erreur deleteAccount:", e);
    throw new Error(parseApiError(e, "Impossible de supprimer le compte."));
  }
};

// ─── Changements de statut ─────────────────────────────────────────────────────

/** Suspendre un compte actif */
export const suspendAccount = async (
  id: string,
  payload: { reason: string }
): Promise<AccountData> => {
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, {
      statutCompte: 'suspendu',
      suspension_reason: payload.reason,
    });
    return data;
  } catch (e: any) {
    console.error("Erreur suspendAccount:", e);
    throw new Error(parseApiError(e, "Impossible de suspendre le compte."));
  }
};

/** Réactiver un compte suspendu */
export const reactivateAccount = async (
  id: string,
  payload: { reason?: string }
): Promise<AccountData> => {
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, {
      statutCompte: 'actif',
      reactivation_reason: payload.reason ?? '',
    });
    return data;
  } catch (e: any) {
    console.error("Erreur reactivateAccount:", e);
    throw new Error(parseApiError(e, "Impossible de réactiver le compte."));
  }
};