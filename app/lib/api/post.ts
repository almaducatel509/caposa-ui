import AxiosInstance from "../axiosInstance";

/* ─── Fetch all posts ────────────────────────────────────────────────────── */

export const fetchPosts = async () => {
  try {
    const response = await AxiosInstance.get('/posts/');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des postes:", error);
    return [];
  }
};

/* ─── Get post by ID ─────────────────────────────────────────────────────── */

export const getPostById = async (id: string) => {
  try {
    const response = await AxiosInstance.get(`/posts/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du poste:", error);
    throw error;
  }
};

/* ─── Create post ────────────────────────────────────────────────────────── */
export const createPost = async (postData: any) => {
  try {
    const response = await AxiosInstance.post('/posts/', postData);
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la création du poste:", error.response?.data || error);
    throw error;
  }
};

/* ─── Update post ────────────────────────────────────────────────────────── */

export const updatePost = async (id: string, postData: any) => {
  try {
    const response = await AxiosInstance.put(`/posts/${id}/`, postData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la modification du poste:", error);
    throw error;
  }
};

/* ─── Archive post (soft delete) ─────────────────────────────────────────── */

export const archivePost = async (id: string, employeeId: string) => {
  try {
    const response = await AxiosInstance.put(`/posts/${id}/`, {
      status:      "inactive",
      archived_by: employeeId,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 403) {
      throw new Error(
        "Non autorisé. Seuls le directeur et la maintenance peuvent archiver un poste."
      );
    }
    console.error("Erreur lors de l'archivage du poste:", error);
    throw error;
  }
};

/* ─── Delete post (hard delete) ─────────────────────────────────────────── */

export const deletePost = async (id: string) => {
  try {
    const response = await AxiosInstance.delete(`/posts/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du poste:", error);
    throw error;
  }
};
