import AxiosInstance from '../axiosInstance';
import { EmployeeFormData } from '@/app/components/employees/validations';
import { Transaction } from '@/types/data';

// ─── Types (alignés sur les conventions snake_case du backend, cf. employees.ts) ──

export interface ActivityLog {
  id: string;
  action: string;
  field?: string;
  old_value?: string;
  new_value?: string;
  date: string;
  modified_by: string;
}

// ─── Fetchers ──────────────────────────────────────────────────────────────

export const fetchEmployeeTransactions = async (employeeId: string): Promise<Transaction[]> => {
  try {
    const response = await AxiosInstance.get('/transactions/', {
      params: { employee_id: employeeId },
    });
    return Array.isArray(response.data) ? response.data : response.data?.results ?? [];
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions de l'employé:", error);
    return [];
  }
};

export const fetchEmployeeActivityLogs = async (employeeId: string): Promise<ActivityLog[]> => {
  try {
    const response = await AxiosInstance.get(`/employees/${employeeId}/activity-logs/`);
    return Array.isArray(response.data) ? response.data : response.data?.results ?? [];
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique employé:", error);
    return [];
  }
};

// Function to fetch all employees
export const fetchEmployees = async () => {
  try {
    const response = await AxiosInstance.get('/employees/');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    return [];
  }
};

//---------------------------------------------------------------------------------------------------------------------
// create emp Envoyer avec multipart/form-data
  
export const createEmployee = async (employeeData: EmployeeFormData): Promise<any> => {
  try {
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
    formData.append('branch', employeeData.branch || '');
    
    // 4. Ajouter le tableau posts (répéter la même clé)
    if (employeeData.posts && Array.isArray(employeeData.posts)) {
      employeeData.posts.forEach((postId: string) => {
        formData.append('posts', postId);
      });
    }
    
    // 5. Ajouter le fichier photo si présent
    if (employeeData.photo_profil && employeeData.photo_profil instanceof File) {
      formData.append('photo_profil', employeeData.photo_profil);
    }
    
    // 6. Envoyer avec multipart/form-data
    const response = await AxiosInstance.post('/employees/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Erreur création employé:', error);
    
    // Gestion des erreurs serveur
    if (error.response?.data) {
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
    fd.append('branch', merged.branch || '');

    // Posts array
    if (merged.posts && merged.posts.length > 0) {
      merged.posts.forEach((postId) => {
        fd.append('posts', postId);
      });
    }

    // Photo handling
    if (opts?.removePhoto) {
      fd.append('photo_profil', '');
    } else if (changes.photo_profil instanceof File) {
      fd.append('photo_profil', changes.photo_profil);
    }

    // 4. Send PUT request with multipart/form-data
    const response = await AxiosInstance.put(`/employees/${id}/`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

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
// Function to archiv an employee
export const archiveEmployee = async (id: string) => {
  try {
    const response = await AxiosInstance.delete(`/employees/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur archivage employé:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("Impossible d'archiver l'employé.");
  }
};
