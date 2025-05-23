import AxiosInstance from '../axiosInstance';

// Interface pour les jours fériés
export interface HolidayAPI {
  id?: string;
  date: string;
  description: string;
}
// Fonction pour récupérer tous les jours fériés
export const fetchHolidays = async (): Promise<HolidayAPI[]> => {
  try {
    // Notez qu'ici l'URL correcte sera http://localhost:8000/api/holidays/
    // puisque NEXT_PUBLIC_BASE_ROUTE est http://localhost:8000/api/
    const response = await AxiosInstance.get('holidays/');
    console.log("Réponse fetchHolidays:", response.data);
    return response.data.map((holiday: any) => ({
      id: holiday.id,
      date: holiday.date,
      description: holiday.description,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des jours fériés:", error);
    throw error;
  }
};

// Fonction pour créer une nouvelle branche
export const createBranch = async (branchData: any) => {
  try {
    const response = await AxiosInstance.post('/branches/', branchData);
    console.log('Réponse API :', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur API :', error);
    throw error;
  }
};
// Fonction pour créer un nouveau jour férié
export const createHoliday = async (holidayData: HolidayAPI) => {
  try {
    // Envoyer uniquement les champs nécessaires à l'API
    const payload = {
      date: holidayData.date,
      description: holidayData.description
    };
    
    // L'URL complète sera http://localhost:8000/api/holidays/
    console.log('URL complète:', `${AxiosInstance.defaults.baseURL}holidays/`);
    console.log('Données envoyées à l\'API:', payload);
    
    const response = await AxiosInstance.post('holidays/', payload);
    console.log('Réponse de l\'API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur API :', error);
    throw error;
  }
};

// Fonction pour récupérer un jour férié par ID
export const getHolidayById = async (id: string): Promise<HolidayAPI> => {
  try {
    const response = await AxiosInstance.get(`holidays/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du jour férié ${id}:`, error);
    throw error;
  }
};

// Fonction pour mettre à jour un jour férié
export const updateHoliday = async (id: string, holidayData: HolidayAPI) => {
  try {
    // Envoyer uniquement les champs nécessaires à l'API
    const payload = {
      date: holidayData.date,
      description: holidayData.description
    };
    
    console.log(`Mise à jour du jour férié avec ID: ${id}`);
    console.log('URL complète:', `${AxiosInstance.defaults.baseURL}holidays/${id}/`);
    console.log('Données envoyées:', payload);
    
    if (!id) {
      throw new Error("ID manquant pour la mise à jour du jour férié");
    }
    
    // L'URL complète sera http://localhost:8000/api/holidays/ID/
    const response = await AxiosInstance.put(`holidays/${id}/`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`Erreur lors de la mise à jour du jour férié ${id}:`, error);
    
    // Afficher plus de détails sur l'erreur si disponible
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    throw error;
  }
};

// Fonction pour supprimer un jour férié
export const deleteHoliday = async (id: string) => {
  try {
    // L'URL complète sera http://localhost:8000/api/holidays/ID/
    await AxiosInstance.delete(`holidays/${id}/`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du jour férié ${id}:`, error);
    throw error;
  }
};