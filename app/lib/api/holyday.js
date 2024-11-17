import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les holydays
export const fetchHolydays = async () => {
  try {
    const response = await AxiosInstance.get('/holydays/'); // Remplace '/employees' par le bon endpoint
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des jours ferriers:", error);
    throw error;
  }
};

// Fonction pour créer un nouveau holyday
export const createHoliday = async (holidayData) => {
    try {
      const response = await AxiosInstance.post('/holidays/', holidayData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du jour férié:", error);
      throw error;
    }
  };
