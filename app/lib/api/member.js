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
export const createMembers = async (memberData) => {
  try {
    const response = await AxiosInstance.member('/members', memberData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du membre:", error);
    throw error;
  }
};
