import AxiosInstance from '../axiosInstance';

/* =====================================================
   HELPER : parseApiError
   
   Extrait un message d'erreur lisible depuis une réponse Axios.
   Priorité :
     1. error.response.data.message (Django renvoie souvent ça)
     2. error.response.data en JSON brut (au cas où)
     3. fallback fourni par l'appelant
   
   Copié du pattern compte pour rester cohérent dans la codebase.
===================================================== */

function parseApiError(error: any, fallback = "Une erreur est survenue.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data) {
    try { return JSON.stringify(error.response.data); } catch {}
  }
  return fallback;
}

/* =====================================================
   HOLIDAYS
===================================================== */

export const fetchHolidays = async () => {
  try {
    const response = await AxiosInstance.get('/holidays/');
    const formattedHolidays = response.data.map((item: any) => ({
      id: item.id,
      date: item.date,
      description: item.description,
    }));
    return formattedHolidays;
  } catch (error) {
    console.error('Erreur lors de la récupération des jours fériés :', error);
    return [];
  }
};

/* =====================================================
   OPENING HOURS
===================================================== */

export const fetchOpeningHours = async () => {
  try {
    const response = await AxiosInstance.get('/opening-hours/');

    const formattedOpeningHours = response.data.map((item: any) => {
      const schedule = [
        item.monday && `Lundi: ${item.monday}`,
        item.tuesday && `Mardi: ${item.tuesday}`,
        item.wednesday && `Mercredi: ${item.wednesday}`,
        item.thursday && `Jeudi: ${item.thursday}`,
        item.friday && `Vendredi: ${item.friday}`,
        item.saturday && `Samedi: ${item.saturday}`,
        item.sunday && `Dimanche: ${item.sunday}`,
      ]
        .filter(Boolean)
        .join('\n');

      return {
        id: item.id,
        schedule,
      };
    });

    return formattedOpeningHours;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des heures d'ouverture :", error);
    return [];
  }
};

/* =====================================================
   BRANCHES — CRUD
===================================================== */

/** Récupère la liste complète des branches.
 *  Pour la liste, on garde le retour [] en cas d'erreur (pas de crash sur un .map vide).
 */
export const fetchBranches = async () => {
  try {
    const response = await AxiosInstance.get('/branches/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des branches:', error);
    return [];
  }
};

/** Crée une nouvelle branche.
 *  En cas d'erreur, on relance pour que le modal puisse afficher un message clair.
 */
export const createBranch = async (branchData: any) => {
  try {
    const response = await AxiosInstance.post('/branches/', branchData);
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    
    // Si Django retourne du HTML (mode DEBUG), on affiche un message générique
    const message =
      typeof data === 'string' && data.includes('<!DOCTYPE')
        ? 'Erreur serveur — vérifiez que le backend fonctionne correctement.'
        : typeof data === 'object'
          ? Object.entries(data)
              .map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ')
          : 'Impossible de créer la branche.';

    throw new Error(message);
  }
};

/** Récupère une branche par son ID.
 */
export const getBranchById = async (id: string) => {
  try {
    const response = await AxiosInstance.get(`/branches/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error("Erreur getBranchById:", error?.response?.data);
    return null;
  }
};

/** Met à jour une branche existante.
 */
export const updateBranch = async (id: string, data: any) => {
  try {
    const response = await AxiosInstance.patch(`/branches/${id}/`, data);
    return response.data;
  } catch (error: any) {
    console.error("Erreur updateBranch:", error?.response?.data);
    throw new Error(parseApiError(error, "Impossible de mettre à jour la branche."));
  }
};

/** Archive une branche (soft delete).
 */
export const archiveBranch = async (id: string) => {
  try {
    const response = await AxiosInstance.patch(`/branches/${id}/`, {
      statusBranche: "archive",
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur archiveBranch:", error?.response?.data);
    throw new Error(parseApiError(error, "Impossible d'archiver la branche."));
  }
};

/** Suppression définitive d'une branche (hard delete).
 */
export const deleteBranch = async (id: string) => {
  try {
    const response = await AxiosInstance.delete(`/branches/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error("Erreur deleteBranch:", error?.response?.data);
    throw new Error(parseApiError(error, "Impossible de supprimer la branche."));
  }
};
