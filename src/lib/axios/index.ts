
import axios from 'axios';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Liste des routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/api/auctions',
  '/api/synthetisers',
  '/api/users'
  // Ajoutez d'autres routes publiques ici
];

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  // Vérifier si l'URL actuelle est une route publique
  const isPublicRoute = publicRoutes.some(route => 
      config.url?.includes(route)
  );

  // N'ajouter le token que si ce n'est pas une route publique
  if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
  }
  
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;