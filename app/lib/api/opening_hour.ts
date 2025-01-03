import AxiosInstance from '../axiosInstance';


// Fonction pour récupérer les horaires d'ouverture
export const fetchOpeningHours = async () => {
  try {
    const response = await AxiosInstance.get('/opening-hours/');
    return response.data; // Return the API data
  } catch (error: any) {
    console.error("Error fetching opening hours:", {
      message: error.message,
      response: error.response ? error.response.data : "No response",
      status: error.response ? error.response.status : "No status",
    });
    throw new Error("Erreur lors de la récupération des horaires d'ouverture.");
  }
};

// Fonction pour créer un nouveau openingHour
export const createOpeningHours = async (openingHoursData:any) => {
   try { 
      const response = await AxiosInstance.post('/opening-hours/', openingHoursData);
      return response.data; } 
   catch (error) { 
    console.error("Erreur lors de la création des horaires d'ouverture:", error); 
    throw error; 
  } 
};
