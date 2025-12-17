// app/lib/api/accounts.ts
import AxiosInstance from "@/app/lib/axiosInstance";
import { createAccountSchema, CreateAccountInput } from "@/app/components/accounts/validationsaccount"; // ajuste le path
import type { AccountData } from "@/app/components/accounts/validationsaccount"; // full interface

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
    // si ton backend supporte /members/:id/accounts/ — utiliser cette route
    const { data } = await AxiosInstance.get(`/members/${memberId}/accounts/`);
    return data;
  } catch (err) {
    // fallback: si backend n'expose pas la sous-route, tu pourrais filtrer côté client
    console.warn("fetchAccountsForMember fallback to server /accounts/?member_id=", memberId);
    try {
      const { data } = await AxiosInstance.get(`/accounts/?member_id=${encodeURIComponent(memberId)}`);
      return data;
    } catch (e) {
      console.error("Erreur fetchAccountsForMember (fallback):", e);
      return [];
    }
  }
};

/** CREATE — on valide côté client avec Zod, puis on envoie */
export const createAccount = async (payload: unknown): Promise<AccountData> => {
  // Valide localement (améliore l'UX + évite requêtes inutiles)
  const parsed = createAccountSchema.safeParse(payload);
  if (!parsed.success) {
    // Retourne l'erreur de validation afin que le caller l'affiche
    throw parsed.error;
  }

  const validPayload = parsed.data as CreateAccountInput;

  try {
    const { data } = await AxiosInstance.post("/accounts/", validPayload);
    return data;
  } catch (error: any) {
    console.error("❌ Create account error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw new Error(parseApiError(error, "Impossible de créer le compte."));
  }
};

/** update & delete (simples wrappers) */
export const updateAccount = async (id: string, payload: unknown) => {
  // optionally validate with updateAccountSchema here
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, payload);
    return data;
  } catch (e: any) {
    console.error("Erreur updateAccount:", e);
    throw new Error(parseApiError(e, "Impossible de mettre à jour le compte."));
  }
};

export const deleteAccount = async (id: string) => {
  try {
    const { data } = await AxiosInstance.delete(`/accounts/${id}/`);
    return data;
  } catch (e: any) {
    console.error("Erreur deleteAccount:", e);
    throw new Error(parseApiError(e, "Impossible de supprimer le compte."));
  }
};
