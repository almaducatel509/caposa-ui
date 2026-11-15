import AxiosInstance from '../axiosInstance';

export interface SystemRefreshConfigData {
  enabled: boolean;
  interval: number;
  updated_at: string | null;
  updated_by: string | null;
}

export interface UserRefreshPreferenceData {
  use_custom: boolean;
  custom_enabled: boolean;
  custom_interval: number;
  updated_at: string | null;
}

export interface EffectiveRefreshConfigData {
  enabled: boolean;
  interval: number;
  source: 'system' | 'user';
}

export interface DashboardRefreshSettingsResponse {
  system: SystemRefreshConfigData;
  user: UserRefreshPreferenceData;
  effective: EffectiveRefreshConfigData;
  is_admin: boolean;
}

export interface UpdateRefreshSettingsPayload {
  scope: 'system' | 'user';
  enabled?: boolean;
  interval?: number;
  use_custom?: boolean;
  custom_enabled?: boolean;
  custom_interval?: number;
}

/**
 * Récupère la configuration hybride de rafraîchissement depuis la base de données :
 * configuration système, préférence utilisateur, et configuration effective.
 */
export async function fetchDashboardRefreshSettings(): Promise<DashboardRefreshSettingsResponse> {
  const { data } = await AxiosInstance.get<DashboardRefreshSettingsResponse>('/settings/dashboard-refresh/');
  return data;
}

/**
 * Met à jour la configuration de rafraîchissement dans la base de données.
 * scope='system' : modifie la configuration globale (administrateurs)
 * scope='user' : modifie la préférence de l'utilisateur connecté
 */
export async function updateDashboardRefreshSettings(
  payload: UpdateRefreshSettingsPayload
): Promise<DashboardRefreshSettingsResponse> {
  const { data } = await AxiosInstance.patch<DashboardRefreshSettingsResponse>('/settings/dashboard-refresh/', payload);
  return data;
}
