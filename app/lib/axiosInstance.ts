import axios from 'axios';

// const AxiosInstance = axios.create({
// baseURL: process.env.NEXT_PUBLIC_BASE_ROUTE, // Utilise BASE_ROUTE comme base URL
// });

// console.log("Base URL Axios:", AxiosInstance.defaults.baseURL);
//  Afficher la variable d'environnement pour faciliter le débogage
console.log("NEXT_PUBLIC_BASE_ROUTE:", process.env.NEXT_PUBLIC_BASE_ROUTE);

const AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_ROUTE || 'http://localhost:8000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});
console.log("Base URL Axios configurée:", AxiosInstance.defaults.baseURL);

// Ajouter un intercepteur pour voir les requêtes complètes (pour débogage)
if (process.env.NODE_ENV !== 'production') {
  AxiosInstance.interceptors.request.use(request => {
    console.log('Requête envoyée:', {
      url: request.url,
      method: request.method,
      data: request.data,
      headers: request.headers
    });
    return request;
  });

  AxiosInstance.interceptors.response.use(
    response => {
      console.log('Réponse reçue:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
      return response;
    },
    error => {
      console.error('Erreur de réponse:', {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
}
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Décoder le JWT
    return payload.exp * 1000 < Date.now(); // Comparer la date d'expiration
  } catch {
    return true; // Si le token est invalide
  }
};

// Intercepteur de requête : ajouter le token et vérifier son expiration
AxiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        // Token expiré, redirigez l'utilisateur
        alert('Votre session a expiré, veuillez vous reconnecter.');
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirection vers la page de connexion
        return Promise.reject(new Error("Token expiré"));
      } else {
        // Ajout du token au header Authorization
        config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fonction pour rafraîchir le token (si votre API supporte cette fonctionnalité)
const refreshToken = async () => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_ROUTE}/refresh-token`, {
      // Données nécessaires pour le rafraîchissement
    });
    const newToken = response.data.token;
    localStorage.setItem('token', JSON.stringify(newToken));
    return newToken;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    throw error;
  }
};


// Intercepteur de réponse : gestion des erreurs 401 et autres
AxiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        // Token expiré, redirigez l'utilisateur
        alert('Votre session a expiré, veuillez vous reconnecter.');
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirection vers la page de connexion
        return Promise.reject(new Error("Token expiré"));
      } else {
        // Ajout du token au header Authorization
        config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default AxiosInstance;
