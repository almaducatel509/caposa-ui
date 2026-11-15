import AxiosInstance from '../axiosInstance';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  role: string;
  isAdmin: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  employee_id?: string;
  branch_id?: string | null;
  branch_name?: string | null;
  posts?: string[];
  gender?: 'M' | 'F' | string | null;
  photo_profil?: string | null;
}

export interface UpdateProfilePayload {
  gender?: 'M' | 'F';
  photo_profil?: File;
  remove_photo?: boolean;
  current_password?: string;
  password?: string;
  confirm_password?: string;
}

/** Récupère le profil complet de l'utilisateur connecté */
export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await AxiosInstance.get<UserProfile>('/auth/me/');
  return data;
}

/** Met à jour les champs autorisés du profil (sexe, mot de passe, photo de profil) */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  // Si une photo est fournie ou supprimée, on utilise FormData
  if (payload.photo_profil || payload.remove_photo) {
    const formData = new FormData();
    if (payload.gender) formData.append('gender', payload.gender);
    if (payload.photo_profil) formData.append('photo_profil', payload.photo_profil);
    if (payload.remove_photo) formData.append('remove_photo', 'true');
    if (payload.current_password) formData.append('current_password', payload.current_password);
    if (payload.password) formData.append('password', payload.password);
    if (payload.confirm_password) formData.append('confirm_password', payload.confirm_password);

    const { data } = await AxiosInstance.patch<UserProfile>('/auth/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  // Sinon requête JSON standard
  const jsonBody: Record<string, any> = {};
  if (payload.gender) jsonBody.gender = payload.gender;
  if (payload.current_password) jsonBody.current_password = payload.current_password;
  if (payload.password) jsonBody.password = payload.password;
  if (payload.confirm_password) jsonBody.confirm_password = payload.confirm_password;

  const { data } = await AxiosInstance.patch<UserProfile>('/auth/me/', jsonBody);
  return data;
}
