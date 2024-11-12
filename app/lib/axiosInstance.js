import axios from 'axios';

// Créer une instance Axios avec des intercepteurs
const AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL, // Assure-toi de définir cette variable d'environnement
});

// Intercepteur de requête
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const accessToken = JSON.parse(token);
    if (accessToken) {
      if (config.headers) config.headers.token = accessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
AxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default AxiosInstance;
