import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer et formater les horaires d'ouverture
export const fetchOpeningHours = async () => {
  try {
    const response = await AxiosInstance.get('/opening-hours/');
    const data = response.data;

    // Formater les dates dans les données
    const formattedData = data.map((item: any) => ({
      ...item,
      created_at: new Date(item.created_at).toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }), // Exemple: 16/12/2024, 01:26:53
    }));

    return formattedData; // Retourner les données formatées
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
