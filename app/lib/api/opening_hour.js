import AxiosInstance from '../axiosInstance';


// Fonction pour récupérer les horaires d'ouverture
export const fetchOpeningHours = async () => {
  try {
    const response = await AxiosInstance.get('/opening-hours/');  // Endpoint pour récupérer les horaires d'ouverture
    return response.data;  // Retourne les données de l'API
  } catch (error) {
    console.error("Erreur lors de la récupération des horaires d'ouverture :", error);
    throw error;  // Lancer l'erreur pour pouvoir la gérer ailleurs
  }
};

// Fonction pour créer un nouveau openingHour
export const createOpeningHours = async (openingHoursData) => {
   try { 
      const response = await AxiosInstance.post('/opening-hours/', openingHoursData);
      return response.data; } 
   catch (error) { 
    console.error("Erreur lors de la création des horaires d'ouverture:", error); 
    throw error; 
  } 
};
