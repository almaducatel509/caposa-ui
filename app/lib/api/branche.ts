import AxiosInstance from '../axiosInstance';



export const fetchHolidays = async () => {
  try {
    const response = await AxiosInstance.get('/holidays/');
    console.log("Données brutes de l'API Holidays :", response.data); // Vérifiez ici
    const formattedHolidays = response.data.map((item: any) => ({
      id: item.id,
      date: item.date, // Vérifiez que `date` existe dans les données de l'API
      description: item.description, // Vérifiez que `description` existe
    }));
    console.log("Données formatées Holidays :", formattedHolidays); // Vérifiez ici
    return formattedHolidays;
  } catch (error) {
    console.error('Erreur lors de la récupération des jours fériés :', error);
    throw error;
  }
};

export const fetchOpeningHours = async () => {
  try {
    const response = await AxiosInstance.get('/opening-hours/');
    console.log("🔍 Opening hours API response:", response.data);
    
    const formattedOpeningHours = response.data.map((item: any) => {
      console.log("🔍 Traitement de l'item:", item); // Voir chaque item
      
      const schedule = [
        item.monday && `Lundi: ${item.monday}`,
        item.tuesday && `Mardi: ${item.tuesday}`,
        item.wednesday && `Mercredi: ${item.wednesday}`,
        item.thursday && `Jeudi: ${item.thursday}`,
        item.friday && `Vendredi: ${item.friday}`,
        item.saturday && `Samedi: ${item.saturday}`,
        item.sunday && `Dimanche: ${item.sunday}`,
      ]
        .filter(Boolean)
        .join('\n'); // Utiliser \n au lieu de ', '

      const formatted = {
        id: item.id,
        schedule,
      };
      
      console.log("🔍 Item formaté:", formatted);
      return formatted;
    });
    
    console.log("✅ Opening Hours formatés:", formattedOpeningHours);
    return formattedOpeningHours;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des heures d'ouverture :", error);
    throw error;
  }
};

// Fonction pour récupérer toutes les branches
export const fetchBranches = async () => {
  try {
    const response = await AxiosInstance.get('/branches/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des branches:', error);
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

// Function to get branch by ID
export const getBranchById = async (id: string) => {
  try {
    const response = await AxiosInstance.get(`/branches/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la branche :", error);
    throw error;
  }
};

// Function to update branch
export const updateBranch = async (id: string, data: any) => {
  try {
    const response = await AxiosInstance.put(`/branches/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la branche :", error);
    throw error;
  }
};

// Dans votre fichier API branche.ts
export const deleteBranch = async (id: string) => {
  try {
    const response = await AxiosInstance.delete(`/branches/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la branche :", error);
    throw error;
  }
};