// app/lib/api/accounts.ts
import AxiosInstance from "@/app/lib/axiosInstance";

/**
 * ✅ Récupère tous les comptes (ou filtre par membre)
 * @param memberId (optionnel) — filtre les comptes d’un membre spécifique
 */
// 1. Fetch all accounts
export const fetchAccounts = async () => {
  try {
    const response = await AxiosInstance.get('/accounts/');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des comptes:", error);
    return [];
  }
};

/**
 * ✅ Récupère un compte spécifique par son ID
 */
export const fetchAccountById = async (id: string | number) => {
  try {
    const { data } = await AxiosInstance.get(`/accounts/${id}/`);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération du compte:", error);
    throw new Error("Impossible de récupérer les détails du compte.");
  }
};

/**
 * ✅ Vérifie si un membre existe avant la création d’un compte
 */
export const verifyMemberExists = async (memberId: string | number) => {
  try {
    const { data } = await AxiosInstance.get(`/members/${memberId}/`);
    return !!data?.id; // true si le membre existe
  } catch {
    return false;
  }
};

/**
 * ✅ Crée un nouveau compte pour un membre
 * Vérifie d’abord si le membre existe avant d’envoyer la requête
 */
export const createAccount = async (accountData: any) => {
  try {
    if (!accountData.member_id) {
      throw new Error("Le champ member_id est requis.");
    }

    const memberExists = await verifyMemberExists(accountData.member_id);
    if (!memberExists) {
      throw new Error("Le membre spécifié n’existe pas.");
    }

    const { data } = await AxiosInstance.post("/accounts/", accountData);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur lors de la création du compte:", error);
    throw new Error(parseApiError(error, "Impossible de créer le compte."));
  }
};

/**
 * ✅ Met à jour un compte existant (PATCH)
 */
export const updateAccount = async (id: string | number, accountData: any) => {
  try {
    const { data } = await AxiosInstance.patch(`/accounts/${id}/`, accountData);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur lors de la mise à jour du compte:", error);
    throw new Error(parseApiError(error, "Impossible de mettre à jour le compte."));
  }
};


/**
 * 🛠️ Helper interne pour gérer les erreurs API de manière uniforme
 */
function parseApiError(error: any, fallback = "Une erreur est survenue.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data) {
    try {
      return JSON.stringify(error.response.data);
    } catch {}
  }
  return fallback;
}
// 4. Delete account
export const deleteAccount = async (id: string) => {
  try {
    const response = await AxiosInstance.delete(`/accounts/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur suppression:', error);
    throw new Error("Impossible de supprimer le compte.");
  }
};
// 5. Fetch members for dropdown
export const fetchMembers = async () => {
  try {
    const response = await AxiosInstance.get('/members/');
    return response.data;
  } catch (error) {
    console.error("Erreur membres:", error);
    return [];
  }
};