// services/axios.ts
import axios from "axios";
import Cookies from "js-cookie";
// import { toast } from "react-hot-toast";

axios.defaults.withCredentials = true;


// Configuration automatique selon l'environnement
const getBaseURL = () => {
  // En production (Railway/Vercel/etc.)
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // En développement local
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

// API principale
export const api = axios.create({
	baseURL: getBaseURL(),
	timeout: 10000, // 10 secondes de timeout
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});


// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
	(config) => {
		// Log des requêtes en développement
		if (process.env.NODE_ENV === "development") {
			console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
		}

		// On vérifie d'abord le token dans les cookies (pour cohérence avec le middleware)
		const token = Cookies.get("token") || localStorage.getItem("token");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		console.error("Erreur dans l'intercepteur de requête:", error);
		return Promise.reject(error);
	}
);

// Intercepteur unique pour les réponses
// Modifier l'intercepteur pour ne pas rediriger automatiquement
api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Ne pas rediriger si c'est une route publique
		const publicRoutes = ["/api/synthetisers"];
		if (publicRoutes.includes(error.config.url)) {
			return Promise.reject(error);
		}

		// Pour les autres routes, garder votre logique actuelle
		if (error.response?.status === 401) {
			// redirection ou autre logique
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
			console.error("Erreur de réponse:", {
				status: error.response.status,
				data: error.response.data,
			});

			if (error.response.status === 401) {
				// Gérer la déconnexion ici si nécessaire
				localStorage.removeItem("token");
			}
		} else if (error.request) {
			// La requête a été faite mais aucune réponse n'a été reçue
			console.error("Erreur de requête:", error.request);
		} else {
			// Une erreur s'est produite lors de la configuration de la requête
			console.error("Erreur:", error.message);
		}

		// Propager l'erreur pour la gestion locale
		return Promise.reject(error);
	}
);
export default api;
