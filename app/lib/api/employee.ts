import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les employés
export const fetchEmployees = async () => {
  try {
    const response = await AxiosInstance.get('/employees/'); // Assurez-vous que '/employees/' est le bon endpoint
    console.log("Données récupérées depuis l'API :", response.data); // Log des données récupérées

    // Transformer les données pour ajouter le champ `name`
    const transformedData = response.data.map((employee: any) => ({
      ...employee,
      name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim(), // Combine `first_name` et `last_name`
    }));

    console.log("Données transformées avec 'name' :", transformedData); // Debugging
    return transformedData;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    throw error;
  }
};

// Fonction pour créer un nouvel employé
export const createEmployee = async (employeeData:any) => {
  try {
    console.log('Données envoyées:', employeeData);
    const response = await AxiosInstance.post('/employees/', employeeData);
    console.log('Réponse API:', response);
    return response.data;
  } catch (error) {
      console.error('Erreur API:', error);
      throw error;
  }
};
