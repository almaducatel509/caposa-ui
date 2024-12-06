import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer toutes les branches
export const fetchBranches = async () => {
  try {
    const response = await AxiosInstance.get('/branches');
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
    const response = await AxiosInstance.post('/branches', branchData);
    console.log('Réponse de l\'API:', response);
    return response.data;
  } catch (error) {
      console.error('Erreur API:', error);
    throw error;
  }
};
