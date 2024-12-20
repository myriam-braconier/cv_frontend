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
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Redirection vers login se fera dans le composant
        }
        return Promise.reject(error);
    }
);



// // Intercepteur pour les réponses
// api.interceptors.response.use(
//     (response) => {
//         console.log('Réponse reçue:', response.status);
//         return response;
//     },
//     (error) => {
//         console.error('Erreur complète:', error);
//         if (error.response) {
//             console.error('Status:', error.response.status);
//             console.error('Data:', error.response.data);
//         }
//         return Promise.reject(error);
//     }
// );

