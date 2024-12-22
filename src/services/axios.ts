// services/axios.ts
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// création de l'instance
export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    } catch (error) {
        console.error('Erreur dans l\'intercepteur de requête:', error);
        return Promise.reject(error);
    }
}, (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
});

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