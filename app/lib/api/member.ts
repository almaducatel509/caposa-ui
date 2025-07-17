import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les members
export const fetchMembers = async () => {
  try {
    console.log('🚀 Début de la récupération des membres...');
    
    const response = await AxiosInstance.get('/members/');
    
    // Vérifier si la réponse contient des données
    if (response.data) {
      console.log(`✅ ${response.data.length} membre(s) récupéré(s) avec succès`);
      return response.data;
    } else {
      console.log('⚠️ Réponse vide de l\'API');
      return [];
    }
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des membres:", error);
    
    // Gestion détaillée des erreurs
    if (error.response) {
      // Erreur de réponse du serveur (4xx, 5xx)
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      console.error(`🔴 Erreur serveur ${status}:`, message);
      
      switch (status) {
        case 404:
          throw new Error('Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
        case 401:
          throw new Error('Non autorisé. Vérifiez vos identifiants.');
        case 403:
          throw new Error('Accès interdit. Permissions insuffisantes.');
        case 500:
          throw new Error('Erreur interne du serveur. Contactez l\'administrateur.');
        default:
          throw new Error(`Erreur serveur (${status}): ${message}`);
      }
    } else if (error.request) {
      // Erreur de connexion (pas de réponse reçue)
      console.error('🔴 Erreur de connexion:', error.request);
      throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    } else {
      // Autre erreur
      console.error('🔴 Erreur:', error.message);
      throw new Error(`Erreur inattendue: ${error.message}`);
    }
  }
};

// Fonction pour créer un nouveau member
export const createMembers = async (memberData: any) => {
  try {
    console.log('🚀 Création d\'un nouveau membre...');
    
    const response = await AxiosInstance.post('/members', memberData);
    
    if (response.data) {
      console.log('✅ Membre créé avec succès:', response.data);
      return response.data;
    } else {
      throw new Error('Réponse vide lors de la création');
    }
  } catch (error: any) {
    console.error("❌ Erreur lors de la création du membre:", error);
    
    if (error.response) {
      // Erreur de réponse du serveur
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      console.error(`🔴 Erreur serveur ${status}:`, message);
      
      switch (status) {
        case 400:
          throw new Error('Données invalides. Vérifiez les informations saisies.');
        case 409:
          throw new Error('Ce membre existe déjà.');
        case 422:
          throw new Error('Données de validation incorrectes.');
        default:
          throw new Error(`Erreur serveur (${status}): ${message}`);
      }
    } else if (error.request) {
      // Erreur de connexion
      console.error('🔴 Erreur de connexion:', error.request);
      throw new Error('Impossible de se connecter au serveur pour créer le membre.');
    } else {
      // Autre erreur
      console.error('🔴 Erreur:', error.message);
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }
  }
};

// Fonction pour mettre à jour un membre
export const updateMember = async (id: string | number, memberData: any) => {
  try {
    console.log(`🚀 Mise à jour du membre ${id}...`);
    
    const response = await AxiosInstance.put(`/members/${id}`, memberData);
    
    if (response.data) {
      console.log('✅ Membre mis à jour avec succès:', response.data);
      return response.data;
    } else {
      throw new Error('Réponse vide lors de la mise à jour');
    }
  } catch (error: any) {
    console.error(`❌ Erreur lors de la mise à jour du membre ${id}:`, error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 404:
          throw new Error('Membre non trouvé.');
        case 400:
          throw new Error('Données invalides pour la mise à jour.');
        default:
          throw new Error(`Erreur serveur (${status}): ${message}`);
      }
    } else if (error.request) {
      throw new Error('Impossible de se connecter au serveur pour la mise à jour.');
    } else {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }
};

// Fonction pour supprimer un membre
export const deleteMember = async (id: string | number) => {
  try {
    console.log(`🚀 Suppression du membre ${id}...`);
    
    const response = await AxiosInstance.delete(`/members/${id}`);
    
    console.log('✅ Membre supprimé avec succès');
    return response.data;
  } catch (error: any) {
    console.error(`❌ Erreur lors de la suppression du membre ${id}:`, error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 404:
          throw new Error('Membre non trouvé.');
        default:
          throw new Error(`Erreur serveur (${status}): ${message}`);
      }
    } else if (error.request) {
      throw new Error('Impossible de se connecter au serveur pour la suppression.');
    } else {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }
};

// Fonction pour vérifier le statut de l'API
export const checkApiStatus = async () => {
  try {
    console.log('🔍 Vérification du statut de l\'API...');
    
    const response = await AxiosInstance.get('/health'); // ou '/status' selon votre API
    
    console.log('✅ API accessible:', response.status);
    return { status: 'ok', data: response.data };
  } catch (error: any) {
    console.error('❌ API non accessible:', error);
    
    if (error.response) {
      return { status: 'error', code: error.response.status };
    } else if (error.request) {
      return { status: 'offline' };
    } else {
      return { status: 'unknown', message: error.message };
    }
  }
};