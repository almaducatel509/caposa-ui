import AxiosInstance from "../axiosInstance";

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
