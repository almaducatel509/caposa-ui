import AxiosInstance from '../axiosInstance';

// 🔵 Récupérer toutes les sessions
export const fetchSessions = async () => {
  try {
    const response = await AxiosInstance.get('/sessions/');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
    return []; // fallback propre
  }
};

// 🔵 Récupérer une session spécifique
export const fetchSessionById = async (id: string) => {
  try {
    const response = await AxiosInstance.get(`/sessions/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la session ${id}:`, error);
    return null;
  }
};

// 🔵 Ouvrir une session
export const openSession = async (payload: { opening_balance: number }) => {
  try {
    const response = await AxiosInstance.post('/sessions/open/', payload);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ouverture de la session:", error);
    throw error;
  }
};

// 🔵 Fermer une session
export const closeSession = async (sessionId: string, payload: { counted_amount: number }) => {
  try {
    const response = await AxiosInstance.post(`/sessions/${sessionId}/close/`, payload);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la fermeture de la session ${sessionId}:`, error);
    throw error;
  }
};
