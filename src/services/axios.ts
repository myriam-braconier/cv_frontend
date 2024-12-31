// services/axios.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-hot-toast";
import { API_URL } from '@/config/constants';

axios.defaults.withCredentials = true;

// création de l'instance
export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
    // On vérifie d'abord le token dans les cookies (pour cohérence avec le middleware)
    const token = Cookies.get('token') || localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});





// Intercepteur unique pour les réponses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            
            // Gestion des erreurs d'authentification
            if (status === 401) {
                localStorage.removeItem('token');
                Cookies.remove('token');
                window.location.href = '/login';
                toast.error('Session expirée, veuillez vous reconnecter');
                return Promise.reject(error);
            }
// Gestion des autres erreurs HTTP
const message = data?.message || 'Une erreur est survenue';
toast.error(message);
console.error('Erreur de réponse:', { status, data });
} else if (error.request) {
toast.error('Impossible de contacter le serveur');
console.error('Erreur de requête:', error.request);
} else {
toast.error('Une erreur est survenue');
console.error('Erreur:', error.message);
}

return Promise.reject(error);
}
);


// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Gérer l'expiration du token ici
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Gestion plus détaillée des erreurs
        if (error.response) {
            // La requête a été faite et le serveur a répondu avec un code d'état
            // qui n'est pas dans la plage 2xx
            console.error('Erreur de réponse:', {
                status: error.response.status,
                data: error.response.data
            });

            if (error.response.status === 401) {
                // Gérer la déconnexion ici si nécessaire
                localStorage.removeItem('token');
            }
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error('Erreur de requête:', error.request);
        } else {
            // Une erreur s'est produite lors de la configuration de la requête
            console.error('Erreur:', error.message);
        }

        // Propager l'erreur pour la gestion locale
        return Promise.reject(error);
    }
);