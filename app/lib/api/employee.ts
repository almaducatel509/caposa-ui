import AxiosInstance from '../axiosInstance';
import { EmployeeFormData } from '@/app/components/employees/validations';

// Function to fetch all employees (SIMPLIFIÉ)
export const fetchEmployees = async () => {
  try {
    const response = await AxiosInstance.get('/employees/');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    throw error;
  }
};

// Function to create a new employee (SIMPLIFIÉ)
export const createEmployee = async (formData: EmployeeFormData) => {
  try {
    console.log('🆕 Creating employee with data:', formData);
    
    // Toujours utiliser JSON - plus simple et plus fiable
    const jsonData = {
      user: {
        username: formData.user.username,
        email: formData.user.email,
        password: formData.user.password,
        confirm_password: formData.user.confirm_password,
      },
      first_name: formData.first_name,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birth,
      phone_number: formData.phone_number,
      address: formData.address,
      gender: formData.gender,
      payment_ref: formData.payment_ref,
      branch: formData.branch,
      posts: formData.posts,
      // Pour l'instant, ignorer le fichier - on peut l'ajouter plus tard
      // photo_profil: null
    };
    
    console.log('📤 Sending to API:', jsonData);
    
    const response = await AxiosInstance.post('/employees/', jsonData, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('✅ Create response:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Create error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Message d'erreur plus spécifique
    let errorMessage = 'Impossible de créer l\'employé.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data) {
      errorMessage = JSON.stringify(error.response.data);
    }
    
    throw new Error(errorMessage);
  }
};

// VERSION SIMPLE QUI MARCHE - TOUS LES CHAMPS
// ULTRA-SIMPLE comme Opening Hours
export const updateEmployee = async (
  id: string,
  formData: EmployeeFormData,
  keepCurrentPassword = true
) => {
  // Construction dynamique
  const userPayload: any = {};

  if (formData.user.username) userPayload.username = formData.user.username;
  if (formData.user.email) userPayload.email = formData.user.email;

  if (!keepCurrentPassword) {
    if (formData.user.password) userPayload.password = formData.user.password;
    if (formData.user.confirm_password) userPayload.confirm_password = formData.user.confirm_password;
  }

  const payload = {
    user: userPayload,
    first_name: formData.first_name,
    last_name: formData.last_name,
    date_of_birth: formData.date_of_birth,
    phone_number: formData.phone_number,
    address: formData.address,
    gender: formData.gender,
    payment_ref: formData.payment_ref,
    branch: formData.branch,
    posts: formData.posts,
  };

  console.log('✅ Final payload:', payload);

  const response = await AxiosInstance.put(`/employees/${id}/`, payload);
  return response.data;
};

// Function to delete an employee (SIMPLIFIÉ)
export const deleteEmployee = async (id: string) => {
  try {
    console.log('🗑️ Deleting employee:', id);
    
    const response = await AxiosInstance.delete(`/employees/${id}/`);
    
    console.log('✅ Delete response:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Delete error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    throw new Error("Impossible de supprimer l'employé.");
  }
};