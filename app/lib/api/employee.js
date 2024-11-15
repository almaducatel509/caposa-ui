import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les employés
export const fetchEmployees = async () => {
  try {
    const response = await AxiosInstance.get('/employees/'); // '/employees' par le bon endpoint
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    throw error;
  }
};

// Fonction pour créer un nouvel employé
import AxiosInstance from '../axiosInstance';

export const createEmployee = async (employeeData) => {
  try {
    const response = await AxiosInstance.post('/employees/', employeeData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    throw error;
  }
};

