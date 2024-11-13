import axios from 'axios';

const AxiosInstance = axios.create({
  baseURL: process.env.BASE_ROUTE, // Utilise BASE_ROUTE comme base URL
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
  (response) => response,
  (error) => Promise.reject(error)
);

export default AxiosInstance;
