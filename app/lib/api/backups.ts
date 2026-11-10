import AxiosInstance from "@/app/lib/axiosInstance";

export interface DatabaseBackup {
  id: string;
  filename: string;
  file_size: number;
  formatted_size: string;
  backup_type: 'auto' | 'manual';
  status: 'in_progress' | 'completed' | 'failed';
  error_message: string;
  is_encrypted: boolean;
  encryption_algorithm: string;
  checksum: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  created_by: number | null;
  created_by_name: string;
  deleted_by: number | null;
  deleted_by_name: string | null;
}

export interface BackupSchedule {
  id: number;
  is_active: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  day_of_week: number;
  cron_expression: string;
  retention_days: number;
  last_run: string | null;
  last_status: string;
  updated_at: string;
}

export interface BackupStats {
  active_count: number;
  trash_count: number;
  total_size: number;
  formatted_total_size: string;
  last_backup: DatabaseBackup | null;
  schedule: BackupSchedule;
  encryption: string;
}

/**
 * Récupère la liste des sauvegardes (actives ou corbeille).
 */
export async function fetchBackups(options?: { trash?: boolean; all?: boolean }): Promise<DatabaseBackup[]> {
  try {
    const params = new URLSearchParams();
    if (options?.trash) params.set('trash', 'true');
    if (options?.all) params.set('all', 'true');

    const res = await AxiosInstance.get(`/backups/?${params.toString()}`);
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des sauvegardes :", err);
    throw err;
  }
}

/**
 * Récupère les statistiques globales des sauvegardes.
 */
export async function fetchBackupStats(): Promise<BackupStats> {
  try {
    const res = await AxiosInstance.get('/backups/stats/');
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des stats de sauvegarde :", err);
    throw err;
  }
}

/**
 * Récupère la configuration de la planification automatique.
 */
export async function fetchBackupSchedule(): Promise<BackupSchedule> {
  try {
    const res = await AxiosInstance.get('/backups/schedule/');
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la récupération de la planification :", err);
    throw err;
  }
}

/**
 * Met à jour la planification automatique (heure, fréquence, cron, etc.).
 */
export async function updateBackupSchedule(data: Partial<BackupSchedule>): Promise<BackupSchedule> {
  try {
    const res = await AxiosInstance.post('/backups/schedule/', data);
    return res.data.schedule || res.data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la planification :", err);
    throw err;
  }
}

/**
 * Déclenche une sauvegarde chiffrée instantanée sur le serveur.
 */
export async function createInstantBackup(): Promise<DatabaseBackup> {
  try {
    const res = await AxiosInstance.post('/backups/create-instant/');
    return res.data.backup || res.data;
  } catch (err) {
    console.error("Erreur lors de la création de la sauvegarde instantanée :", err);
    throw err;
  }
}

/**
 * Suppression douce (Soft delete) : déplace la sauvegarde dans la corbeille.
 */
export async function softDeleteBackup(id: string): Promise<void> {
  try {
    await AxiosInstance.delete(`/backups/${id}/`);
  } catch (err) {
    console.error("Erreur lors du soft delete de la sauvegarde :", err);
    throw err;
  }
}

/**
 * Restaure une sauvegarde depuis la corbeille.
 */
export async function restoreBackup(id: string): Promise<DatabaseBackup> {
  try {
    const res = await AxiosInstance.post(`/backups/${id}/restore/`);
    return res.data.backup || res.data;
  } catch (err) {
    console.error("Erreur lors de la restauration de la sauvegarde :", err);
    throw err;
  }
}

/**
 * Suppression définitive (Hard delete) : supprime physiquement le fichier sur le serveur.
 */
export async function permanentDeleteBackup(id: string): Promise<void> {
  try {
    await AxiosInstance.delete(`/backups/${id}/permanent/`);
  } catch (err) {
    console.error("Erreur lors de la suppression définitive du fichier sur le serveur :", err);
    throw err;
  }
}

/**
 * Télécharge le fichier de sauvegarde chiffré (.sql.enc).
 */
export async function downloadBackup(id: string, filename: string): Promise<void> {
  try {
    const res = await AxiosInstance.get(`/backups/${id}/download/`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Erreur lors du téléchargement de la sauvegarde :", err);
    throw err;
  }
}
