import axios from 'axios';
import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les employés
export const fetchEmployees = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/employees/');
    return response.data.map((employee: any) => ({
      ...employee,
      name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des employés Ts:", error);
    throw error;
  }
};


// Fonction pour créer un nouvel employé
export const createEmployee = async (formData:FormData) => {

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/employees/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Réponse API :', response);
    return response.data;
  } catch (error: any) {
    console.log(error)
    console.error('Erreur API:', error.response?.data || error.message);
    throw new Error('Impossible de créer l\'employé.');

  }
};


