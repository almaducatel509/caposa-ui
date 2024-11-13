import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les openingHours
export const fetchOpeningHours = async () => {
  try {
    const response = await AxiosInstance.get('/openingHours'); // Remplace '/openingHours' par le bon endpoint
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des heures ouverture et de fermeture:", error);
    throw error;
  }
};

// Fonction pour créer un nouveau openingHour
export const createOpeningHours = async (openingHoursData) => {
    try {
      const response = await AxiosInstance.post('/opening-hours/', openingHoursData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création des horaires d'ouverture:", error);
      throw error;
    }
  };
