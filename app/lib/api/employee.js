import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les employés
export const fetchEmployees = async () => {
  try {
    const response = await AxiosInstance.get('/employees/'); // Assurez-vous que '/employees/' est le bon endpoint
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    throw error;
  }
};

// Fonction pour créer un nouvel employé
export const createEmployee = async (employeeData) => {
  try {
    console.log('Données envoyées:', employeeData);
    const response = await AxiosInstance.post('/employees/', employeeData);
    console.log('Réponse API:', response);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Erreur API:', error.response.data);
    } else {
      console.error('Erreur de connexion:', error.message);
    }
    throw error;
  }
};
