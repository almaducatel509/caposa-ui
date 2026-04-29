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
   HOLIDAYS — non modifié (hors scope du refacto branche)
===================================================== */

export const fetchHolidays = async () => {
  try {
    const response = await AxiosInstance.get('/holidays/');
    console.log("Données brutes de l'API Holidays :", response.data);
    const formattedHolidays = response.data.map((item: any) => ({
      id: item.id,
      date: item.date,
      description: item.description,
    }));
    console.log("Données formatées Holidays :", formattedHolidays);
    return formattedHolidays;
  } catch (error) {
    console.error('Erreur lors de la récupération des jours fériés :', error);
    return [];
  }
};

/* =====================================================
   OPENING HOURS — non modifié (hors scope du refacto branche)
===================================================== */

export const fetchOpeningHours = async () => {
  try {
    const response = await AxiosInstance.get('/opening-hours/');
    console.log("🔍 Opening hours API response:", response.data);

    const formattedOpeningHours = response.data.map((item: any) => {
      console.log("🔍 Traitement de l'item:", item);

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

      const formatted = {
        id: item.id,
        schedule,
      };

      console.log("🔍 Item formaté:", formatted);
      return formatted;
    });

    console.log("✅ Opening Hours formatés:", formattedOpeningHours);
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

// ─── Ancienne version (commentée pour référence) ───────────────────────────
// export const createBranch = async (branchData: any) => {
//   try {
//     const response = await AxiosInstance.post('/branches/', branchData);
//     console.log('Réponse API :', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Erreur API :', error);
//     return [];  // ❌ retournait [] sur erreur → mensonge silencieux
//   }
// };

// ─── Nouvelle version : throw + parseApiError ──────────────────────────────
export const createBranch = async (branchData: any) => {
  try {
    const response = await AxiosInstance.post('/branches/', branchData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur createBranch:', error?.response?.data);
    throw new Error(parseApiError(error, "Impossible de créer la branche."));
  }
};

/** Récupère une branche par son ID.
 *  Retourne null en cas d'erreur (et non [] qui aurait été un mensonge :
 *  une branche est un OBJET, pas un tableau).
 */

// ─── Ancienne version (commentée pour référence) ───────────────────────────
// export const getBranchById = async (id: string) => {
//   try {
//     const response = await AxiosInstance.get(`/branches/${id}/`);
//     return response.data;
//   } catch (error) {
//     console.error("Erreur lors de la récupération de la branche :", error);
//     return [];  // ❌ retournait [] alors qu'on attend un objet
//   }
// };

// ─── Nouvelle version : null sur erreur ────────────────────────────────────
export const getBranchById = async (id: string) => {
  try {
    const response = await AxiosInstance.get(`/branches/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error("Erreur getBranchById:", error?.response?.data);
    // On retourne null (et non []) pour qu'un test `if (!data)` fonctionne correctement.
    // Le modal peut alors afficher un message "Branche introuvable".
    return null;
  }
};

/** Met à jour une branche existante.
 *  PATCH = on n'envoie QUE les champs qui changent (mise à jour partielle).
 *  Aligné avec le branchUpdateSchema où tous les champs sont optionnels.
 */

// ─── Ancienne version (commentée pour référence) ───────────────────────────
// export const updateBranch = async (id: string, data: any) => {
//   try {
//     const response = await AxiosInstance.put(`/branches/${id}/`, data);
//     // ❌ PUT exigeait l'objet complet
//     return response.data;
//   } catch (error) {
//     console.error("Erreur lors de la mise à jour de la branche :", error);
//     return [];  // ❌ même problème que ci-dessus
//   }
// };

// ─── Nouvelle version : PATCH + throw ──────────────────────────────────────
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
 *  
 *  On envoie un PATCH avec statusBranche = "archive" au lieu d'un vrai DELETE.
 *  Avantages :
 *    - La branche reste en base (historique préservé)
 *    - Apparaît dans l'onglet "Archive" de la liste
 *    - Réversible (on peut désarchiver via un autre PATCH)
 *  
 *  À utiliser à la place de deleteBranch dans 99% des cas.
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
 *  
 *  ⚠️ À RÉSERVER aux administrateurs.
 *  Pour les utilisateurs normaux, utiliser archiveBranch() qui est réversible.
 *  Cette fonction supprime DÉFINITIVEMENT la branche en base.
 */

// ─── Ancienne version (commentée pour référence) ───────────────────────────
// export const deleteBranch = async (id: string) => {
//   try {
//     const response = await AxiosInstance.delete(`/branches/${id}/`);
//     return response.data;
//   } catch (error) {
//     console.error("Erreur lors de la suppression de la branche :", error);
//     throw error;  // ← déjà OK : ça throw, juste pas de message clair
//   }
// };

// ─── Nouvelle version : on garde le throw, on ajoute un message clair ─────
export const deleteBranch = async (id: string) => {
  try {
    const response = await AxiosInstance.delete(`/branches/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error("Erreur deleteBranch:", error?.response?.data);
    throw new Error(parseApiError(error, "Impossible de supprimer la branche."));
  }
};