import AxiosInstance from '../axiosInstance';

export const fetchHolidays = async () => {
  try {
    const response = await AxiosInstance.get('/holidays/');
    const formattedHolidays = response.data.map((item: any) => ({
      id: item.id,
      name: `${item.date} - ${item.description}`, // Combinez la date et la description pour plus de lisibilité
    }));
    return formattedHolidays;
  } catch (error) {
    console.error('Erreur lors de la récupération des jours fériés :', error);
    throw error;
  }
};

export const fetchOpeningHours = async () => {
  try {
    const response = await AxiosInstance.get('/opening-hours/');
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
        .join(', '); // Combinez les horaires en une seule chaîne

      return {
        id: item.id, // Conservez l'ID d'origine
        schedule, // Ajoutez le champ 'schedule'
      };
    });
    return formattedOpeningHours;
  } catch (error) {
    console.error('Erreur lors de la récupération des heures d\'ouverture :', error);
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
export const createBranch = async (branchData:any) => {
  try {
    console.log('Données envoyées:', branchData);
    const response = await AxiosInstance.post('/branches/', branchData);
    console.log('Réponse de l\'API:', response);
    return response.data;
  } catch (error) {
      console.error('Erreur API:', error);
    throw error;
  }
};
