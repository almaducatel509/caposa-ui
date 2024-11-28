import axios from 'axios';

const AxiosInstance = axios.create({
baseURL: process.env.NEXT_PUBLIC_BASE_ROUTE, // Utilise BASE_ROUTE comme base URL
});

console.log("Base URL Axios:", AxiosInstance.defaults.baseURL);

// Intercepteur de requête
AxiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const accessToken = JSON.parse(token);
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
      }
    } catch (e) {
      console.error("Erreur lors de la récupération du token:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fonction pour rafraîchir le token
const refreshToken = async () => {
  try {
    const response = await axios.post('/refresh-token-endpoint', {
      // Données nécessaires pour rafraîchir le token
    });
    const newToken = response.data.token;
    localStorage.setItem('token', JSON.stringify(newToken));
    return newToken;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    throw error;
  }
};

// Intercepteur de réponse
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return AxiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Impossible de rafraîchir le token :", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;

