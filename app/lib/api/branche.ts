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
    console.log("Opening hours fetched:", response.data); // Ajoutez un log pour vérifier les données
    const formattedOpeningHours = response.data.map((item: any) => {
      const schedule = [
        item.monday && `Monday: ${item.monday}`,
        item.tuesday && `Tuesday: ${item.tuesday}`,
        item.wednesday && `Wednesday: ${item.wednesday}`,
        item.thursday && `Thursday: ${item.thursday}`,
        item.friday && `Friday: ${item.friday}`,
        item.saturday && `Saturday: ${item.saturday}`,
        item.sunday && `Sunday: ${item.sunday}`,
      ]
        .filter(Boolean) // Supprimez les valeurs nulles
        .join(', ');

      return {
        id: item.id,
        schedule,
      };
    });
    console.log("Formatted Opening Hours:", formattedOpeningHours); // Vérifiez les données formatées
    return formattedOpeningHours;
  } catch (error) {
    console.error("Erreur lors de la récupération des heures d'ouverture :", error);
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
