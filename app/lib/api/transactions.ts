import AxiosInstance from '../axiosInstance';
import { TransactionData, CreateTransactionData, UpdateTransactionData } from '@/app/components/transactions/types';
import { getMockTransactions, useMockData } from '@/app/components/transactions/mockTransactions';

// Fonction pour récupérer toutes les transactions
export const fetchTransactions = async (): Promise<TransactionData[]> => {
  // Utiliser les données de test si l'API n'est pas prête
  if (useMockData) {
    console.log('🧪 Utilisation des données de test...');
    return await getMockTransactions();
  }

  try {
    console.log('🚀 Début de la récupération des transactions...');
    
    const response = await AxiosInstance.get('/transactions/');
    
    // Vérifier si la réponse contient des données
    if (response.data) {
      console.log(`✅ ${response.data.length} transaction(s) récupérée(s) avec succès`);
      return response.data;
    } else {
      console.log('⚠️ Réponse vide de l\'API');
      return [];
    }
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des transactions:", error);
    
    // Gestion détaillée des erreurs
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      console.error(`🔴 Erreur serveur ${status}:`, message);
      
      switch (status) {
        case 404:
          throw new Error('Endpoint de transactions non trouvé. Vérifiez l\'URL de l\'API.');
        case 401:
          throw new Error('Non autorisé. Vérifiez vos identifiants.');
        case 403:
          throw new Error('Accès interdit. Permissions insuffisantes pour les transactions.');
        case 500:
          throw new Error('Erreur interne du serveur. Contactez l\'administrateur.');
        default:
          throw new Error(`Erreur serveur (${status}): ${message}`);
      }
    } else if (error.request) {
      console.error('🔴 Erreur de connexion:', error.request);
      throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    } else {
      console.error('🔴 Erreur:', error.message);
      throw new Error(`Erreur inattendue: ${error.message}`);
    }
  }
};

// Fonction pour récupérer une transaction spécifique
export const fetchTransaction = async (id: string | number): Promise<TransactionData> => {
  try {
    console.log(`🚀 Récupération de la transaction ${id}...`);
    
    const response = await AxiosInstance.get(`/transactions/${id}`);
    
    if (response.data) {
      console.log('✅ Transaction récupérée avec succès:', response.data);
      return response.data;
    } else {
      throw new Error('Transaction non trouvée');
    }
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération de la transaction ${id}:`, error);
    
    if (error.response?.status === 404) {
      throw new Error('Transaction non trouvée.');
    }
    throw error;
  }
};

// Fonction pour créer une nouvelle transaction
export const createTransaction = async (transactionData: CreateTransactionData): Promise<TransactionData> => {
  try {
    console.log('🚀 Création d\'une nouvelle transaction...');
    console.log('Données à envoyer:', transactionData);
    
    const response = await AxiosInstance.post('/transactions/', transactionData);
    
    if (response.data) {
      console.log('✅ Transaction créée avec succès:', response.data);
      return response.data;
    } else {
      throw new Error('Réponse vide lors de la création');
    }
  } catch (error: any) {
    console.error("❌ Erreur lors de la création de la transaction:", error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      console.error(`🔴 Erreur serveur ${status}:`, message);
      
      switch (status) {
        case 400:
          throw new Error('Données de transaction invalides. Vérifiez les informations saisies.');
        case 409:
          throw new Error('Cette transaction existe déjà.');
        case 422:
          throw new Error('Données de validation incorrectes pour la transaction.');
        case 403:
          throw new Error('Solde insuffisant ou limite dépassée.');
        default:
          throw new Error(`Erreur serveur (${status}): ${message}`);
      }
    } else if (error.request) {
      console.error('🔴 Erreur de connexion:', error.request);
      throw new Error('Impossible de se connecter au serveur pour créer la transaction.');
    } else {
      console.error('🔴 Erreur:', error.message);
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }
  }
};

// Fonction pour mettre à jour une transaction
export const updateTransaction = async (id: string | number, transactionData: UpdateTransactionData): Promise<TransactionData> => {
  try {
    console.log(`🚀 Mise à jour de la transaction ${id}...`);
    
    const response = await AxiosInstance.put(`/transactions/${id}`, transactionData);
    
    if (response.data) {
      console.log('✅ Transaction mise à jour avec succès:', response.data);
      return response.data;
    } else {
      throw new Error('Réponse vide lors de la mise à jour');
    }
  } catch (error: any) {
    console.error(`❌ Erreur lors de la mise à jour de la transaction ${id}:`, error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 404:
          throw new Error('Transaction non trouvée.');
        case 400:
          throw new Error('Données invalides pour la mise à jour.');
        case 403:
          throw new Error('Action non autorisée pour cette transaction.');
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

// Fonction pour traiter une transaction (changer le statut)
export const processTransaction = async (id: string | number, action: 'approve' | 'reject' | 'complete'): Promise<TransactionData> => {
  try {
    console.log(`🚀 Traitement de la transaction ${id} - Action: ${action}...`);
    
    const response = await AxiosInstance.patch(`/transactions/${id}/process`, { action });
    
    if (response.data) {
      console.log('✅ Transaction traitée avec succès:', response.data);
      return response.data;
    } else {
      throw new Error('Réponse vide lors du traitement');
    }
  } catch (error: any) {
    console.error(`❌ Erreur lors du traitement de la transaction ${id}:`, error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 404:
          throw new Error('Transaction non trouvée.');
        case 400:
          throw new Error('Action non valide pour cette transaction.');
        case 403:
          throw new Error('Vous n\'avez pas les permissions pour traiter cette transaction.');
        default:
          throw new Error(`Erreur serveur (${status}): ${message}`);
      }
    } else {
      throw new Error(`Erreur lors du traitement: ${error.message}`);
    }
  }
};

// Fonction pour supprimer une transaction
export const deleteTransaction = async (id: string | number): Promise<void> => {
  try {
    console.log(`🚀 Suppression de la transaction ${id}...`);
    
    const response = await AxiosInstance.delete(`/transactions/${id}`);
    
    console.log('✅ Transaction supprimée avec succès');
    return response.data;
  } catch (error: any) {
    console.error(`❌ Erreur lors de la suppression de la transaction ${id}:`, error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 404:
          throw new Error('Transaction non trouvée.');
        case 403:
          throw new Error('Suppression non autorisée pour cette transaction.');
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

// Fonction pour récupérer les statistiques des transactions
export const fetchTransactionStats = async (): Promise<any> => {
  try {
    console.log('🚀 Récupération des statistiques de transactions...');
    
    const response = await AxiosInstance.get('/transactions/stats');
    
    if (response.data) {
      console.log('✅ Statistiques récupérées avec succès:', response.data);
      return response.data;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    // Ne pas lancer d'erreur pour les stats, retourner null
    return null;
  }
};

// Fonction pour récupérer les transactions d'un membre spécifique
export const fetchMemberTransactions = async (memberId: string | number): Promise<TransactionData[]> => {
  try {
    console.log(`🚀 Récupération des transactions du membre ${memberId}...`);
    
    const response = await AxiosInstance.get(`/members/${memberId}/transactions`);
    
    if (response.data) {
      console.log(`✅ ${response.data.length} transaction(s) du membre récupérée(s)`);
      return response.data;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération des transactions du membre ${memberId}:`, error);
    throw error;
  }
};

// Fonction pour vérifier le statut de l'API des transactions
export const checkTransactionApiStatus = async () => {
  try {
    console.log('🔍 Vérification du statut de l\'API des transactions...');
    
    const response = await AxiosInstance.get('/transactions/health');
    
    console.log('✅ API des transactions accessible:', response.status);
    return { status: 'ok', data: response.data };
  } catch (error: any) {
    console.error('❌ API des transactions non accessible:', error);
    
    if (error.response) {
      return { status: 'error', code: error.response.status };
    } else if (error.request) {
      return { status: 'offline' };
    } else {
      return { status: 'unknown', message: error.message };
    }
  }
};