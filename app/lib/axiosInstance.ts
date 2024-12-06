import axios from 'axios';

const AxiosInstance = axios.create({
baseURL: process.env.NEXT_PUBLIC_BASE_ROUTE, // Utilise BASE_ROUTE comme base URL
});

console.log("Base URL Axios:", AxiosInstance.defaults.baseURL);

// Intercepteur de requête
// AxiosInstance.interceptors.request.use(
//   (config) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const accessToken = JSON.parse(token);
//         if (accessToken) {
//           config.headers['Authorization'] = `Bearer ${accessToken}`;
//         }
//       }
//     } catch (e) {
//       console.error("Erreur lors de la récupération du token:", e);
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Décoder le JWT
    return payload.exp * 1000 < Date.now(); // Comparer la date d'expiration
  } catch {
    return true; // Si le token est invalide
  }
};

// Vérifiez l'expiration avant chaque requête
AxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && isTokenExpired(token)) {
    // Token expiré, affichez une alerte ou redirigez l'utilisateur
    alert('Votre session a expiré, veuillez vous reconnecter.');
    localStorage.removeItem('token'); // Supprimez le token
  } else if (token) {
    config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`;
  }
  return config;
});


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
    if (error.response.status === 401) {
      alert("Votre session a expiré. Vous allez être redirigé vers la connexion.");
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirigez vers la page de connexion
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;

