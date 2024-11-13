import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les posts
export const fetchPosts = async () => {
  try {
    const response = await AxiosInstance.get('/posts'); // Remplace '/employees' par le bon endpoint
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des postes:", error);
    throw error;
  }
};

// Fonction pour créer un nouveau post
export const createPost = async (postData) => {
    try {
      const response = await AxiosInstance.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du poste:", error);
      throw error;
    }
  };
  