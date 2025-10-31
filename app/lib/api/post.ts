import AxiosInstance from '../axiosInstance';

// Fonction pour récupérer tous les posts
export const fetchPosts = async () => {
  try {
    const response = await AxiosInstance.get('/posts/'); 
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des postes:", error);
    return [];
  }
};

// Fonction pour créer un nouveau post
export const createPost = async (postData: any) => {
  try {
    const response = await AxiosInstance.post('/posts/', postData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du poste:", error);
    throw error;
  }
};

// ← AJOUTEZ CES DEUX FONCTIONS
// Fonction pour modifier un post
export const updatePost = async (id: string, postData: any) => {
  try {
    const response = await AxiosInstance.put(`/posts/${id}/`, postData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la modification du poste:", error);
    throw error;
  }
};

// Fonction pour supprimer un post
export const deletePost = async (id: string) => {
  try {
    const response = await AxiosInstance.delete(`/posts/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du poste:", error);
    throw error;
  }
};