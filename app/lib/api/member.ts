import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les members
export const fetchMembers = async () => {
  try {
    const response = await AxiosInstance.get('/members/'); // Remplace '/employees' par le bon endpoint
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    throw error;
  }
};


// Fonction pour créer un nouveau member
export const createMembers = async (memberData:any) => {
  try {
    const response = await AxiosInstance.post('/members', memberData); // Utilisez 'post' au lieu de 'member'
    return response.data;
  } catch (error) {
    if (error) {
      console.error("Erreur API:", error);
    } else {
      console.error("Erreur de connexion:", error);
    }
    throw error;
  }
};
