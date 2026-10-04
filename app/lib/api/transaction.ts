import AxiosInstance from "../axiosInstance";
//app\lib\api\transaction.ts
// 🔵 Récupérer toutes les transactions
export const fetchTransactions = async () => {
  try {
    const response = await AxiosInstance.get('/transactions/');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    return [];
  }
};
// 🔵 Récupérer les transactions d'une session
export const fetchTransactionsBySession = async (sessionId: string) => {
  try {
    const response = await AxiosInstance.get(`/sessions/${sessionId}/transactions/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des transactions de la session ${sessionId}:`, error);
    return [];
  }
};
// Récupérer les dernières transactions du dashboard (limitées)
export const fetchRecentTransactions = async () => {
  try {
    const response = await AxiosInstance.get('/transactions/?limit=10&ordering=-created_at');
    return response.data?.results ?? response.data ?? [];
  } catch (error) {
    console.error("Erreur dashboard transactions:", error);
    return [];
  }
};
// Ajouter à transaction.ts
export const fetchAccountTransactions = async (accountId: string) => {
  try {
    const response = await AxiosInstance.get(`/accounts/${accountId}/transactions/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur transactions compte ${accountId}:`, error);
    return [];
  }
};

export const fetchMemberTransactions = async (memberId: string) => {
  try {
    const response = await AxiosInstance.get(`/members/${memberId}/transactions/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur transactions membre ${memberId}:`, error);
    return [];
  }
};