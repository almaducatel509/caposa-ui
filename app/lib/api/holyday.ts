import AxiosInstance from '../axiosInstance';
import { Holyday } from '@/app/dashboard/holydays/columns';

// Fonction pour récupérer tous les holydays
export const fetchHolydays = async (): Promise<Holyday[]> => {
  try {
    const response = await AxiosInstance.get('/holidays/');
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

// Fonction pour créer un nouveau holyday
export const createHoliday = async (holidayData:any) => {
    try {
      const response = await AxiosInstance.post('/holidays/', holidayData);
      console.log('Réponse de l\'API:', response);
      return response.data;
    } catch (error) {
        console.error("Erreur lors de la création du jour férié:", error);
      throw error;
    }
  };
