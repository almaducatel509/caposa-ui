import AxiosInstance from '../axiosInstance';
import { EmployeeFormData } from '@/app/components/employees/validations';

// Function to fetch all employees (SIMPLIFIÉ)
export const fetchEmployees = async () => {
  try {
    const response = await AxiosInstance.get('/employees/');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    
    // ✅ Retourne un tableau vide au lieu de throw
    // le composant affichera l'état "Aucun employé" avec le bouton "Ajouter"
    return [];
  }
};

//---------------------------------------------------------------------------------------------------------------------
// create emp Envoyer avec multipart/form-data
  
export const createEmployee = async (employeeData: EmployeeFormData): Promise<any> => {
  try {
    console.log('🔵 Données reçues:', employeeData);
      
    // 1. Créer FormData
    const formData = new FormData();
    
    // 2. Ajouter les champs user (aplatis)
    if (employeeData.user) {
      formData.append('user.username', employeeData.user.username || '');
      formData.append('user.password', employeeData.user.password || '');
      formData.append('user.confirm_password', employeeData.user.confirm_password || '');
      formData.append('user.email', employeeData.user.email || '');
    }
    
    // 3. Ajouter les champs simples
    formData.append('first_name', employeeData.first_name || '');
    formData.append('last_name', employeeData.last_name || '');
    formData.append('date_of_birth', employeeData.date_of_birth || '');
    formData.append('phone_number', employeeData.phone_number || '');
    formData.append('address', employeeData.address || '');
    formData.append('gender', employeeData.gender || 'M');
    formData.append('payment_ref', employeeData.payment_ref || '');
    formData.append('branch', employeeData.branch || '');
    
    // 4. Ajouter le tableau posts (répéter la même clé)
    if (employeeData.posts && Array.isArray(employeeData.posts)) {
      employeeData.posts.forEach((postId: string) => {
        formData.append('posts', postId); // Répéter 'posts' pour chaque valeur
      });
    }
    
    // 5. Ajouter le fichier photo si présent
    if (employeeData.photo_profil && employeeData.photo_profil instanceof File) {
      formData.append('photo_profil', employeeData.photo_profil);
    }
    
    // 6. Debug - voir le contenu du FormData
    console.log('📋 FormData créé:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }
    
    // 7. Envoyer avec multipart/form-data
    const response = await AxiosInstance.post('/employees/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Employé créé:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Erreur création employé:', error);
    
    // Gestion des erreurs serveur
    if (error.response?.data) {
      console.error('📛 Erreur serveur:', error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    }
    
    // Autres erreurs
    throw new Error(error.message || 'Erreur inconnue lors de la création');
  }
};
//---------------------------------------------------------------------------------------------------------------------
//Update(PUT) avec multipart

// Merge simple : conserve les anciens champs si non modifiés
function mergeEmployeeData(existing: EmployeeFormData, changes: Partial<EmployeeFormData>): EmployeeFormData {
  return {
    ...existing,
    ...changes,
    user: { ...existing.user, ...changes.user },
    posts: changes.posts ?? existing.posts,
  };
}

// 🔄 PUT multipart
// Simplified putEmployeeMultipart - always use multipart/form-data
export async function putEmployeeMultipart(
  id: string,
  changes: Partial<EmployeeFormData>,
  opts?: { withPassword?: boolean; removePhoto?: boolean }
) {
  try {
    // 1. Get existing employee data
    const existing = (await AxiosInstance.get(`/employees/${id}/`)).data as EmployeeFormData;
    
    // 2. Merge changes with existing data
    const merged = mergeEmployeeData(existing, changes);
    
    // 3. Build FormData with special photo handling
    const fd = new FormData();

    // User fields (flattened)
    fd.append('user.username', merged.user.username || '');
    fd.append('user.email', merged.user.email || '');
    if (opts?.withPassword && merged.user.password) {
      fd.append('user.password', merged.user.password);
      fd.append('user.confirm_password', merged.user.confirm_password || '');
    }

    // Employee fields
    fd.append('first_name', merged.first_name || '');
    fd.append('last_name', merged.last_name || '');
    fd.append('date_of_birth', merged.date_of_birth || '');
    fd.append('phone_number', merged.phone_number || '');
    fd.append('address', merged.address || '');
    fd.append('gender', merged.gender || 'M');
    fd.append('payment_ref', merged.payment_ref || '');
    fd.append('branch', merged.branch || '');

    // Posts array
    if (merged.posts && merged.posts.length > 0) {
      merged.posts.forEach((postId) => {
        fd.append('posts', postId);
      });
    }

    // Photo handling - KEY FIX
    if (opts?.removePhoto) {
      // Explicitly remove photo
      fd.append('photo_profil', '');
    } else if (changes.photo_profil instanceof File) {
      // New file selected
      fd.append('photo_profil', changes.photo_profil);
      console.log('📸 New photo file attached:', changes.photo_profil.name);
    } else {
      // No new photo selected - don't send photo_profil field at all
      // This should preserve the existing photo on the backend
      console.log('📸 No photo changes - preserving existing photo');
    }

    // Debug: log what we're sending
    console.log('📋 FormData for update:');
    for (let [key, value] of fd.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    // 4. Send PUT request with multipart/form-data
    const response = await AxiosInstance.put(`/employees/${id}/`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Employee updated successfully:', response.data);
    return response.data;

  } catch (error: any) {
    console.error('❌ Update error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}
//-------------------------------------------------------------------------------------------

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