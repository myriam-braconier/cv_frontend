// services/axios.ts
import axios from "axios";
import Cookies from "js-cookie";


// Configuration automatique selon l'environnement
const getBaseURL = () => {
  // En production (Railway/Vercel/etc.)
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // En développement local
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

console.log('🔧 Configuration Axios:', {
  baseURL: getBaseURL(),
  environment: process.env.NODE_ENV,
  apiUrl: process.env.NEXT_PUBLIC_API_URL
});

// API principale
const api = axios.create({
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
			console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
		}

		// On vérifie d'abord le token dans les cookies (pour cohérence avec le middleware)
		const token = Cookies.get("token") || localStorage.getItem("token");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
			if (process.env.NODE_ENV === "development") {
				console.log(`🎫 Token ajouté: ${token.substring(0, 20)}...`);
			}
		} else {
			console.warn('⚠️ Aucun token trouvé');
		}
		return config;
	},
	(error) => {
		console.error("❌ Erreur dans l'intercepteur de requête:", error);
		return Promise.reject(error);
	}
);

// INTERCEPTEUR DE RÉPONSE UNIQUE ET CONSOLIDÉ
api.interceptors.response.use(
	(response) => {
		if (process.env.NODE_ENV === "development") {
			console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
		}
		return response;
	},
	(error) => {
		// Log détaillé de l'erreur
		console.error("❌ Erreur Axios:", {
			message: error.message,
			code: error.code,
			url: error.config?.url,
			method: error.config?.method,
			baseURL: error.config?.baseURL,
			response: error.response ? {
				status: error.response.status,
				statusText: error.response.statusText,
				data: error.response.data,
				headers: error.response.headers
			} : null,
			request: error.request ? "Requête envoyée mais pas de réponse" : null
		});

		// Gestion spécifique des erreurs
		if (error.response) {
			// Le serveur a répondu avec un code d'erreur
			const status = error.response.status;
			
			if (status === 401) {
				// Vérifier si c'est une route publique avant de déconnecter
				const publicRoutes = ["/api/synthetisers"];
				const isPublicRoute = publicRoutes.some(route => 
					error.config?.url?.includes(route)
				);
				
				if (!isPublicRoute) {
					console.log("🔓 Déconnexion automatique (401)");
					localStorage.removeItem("token");
					Cookies.remove("token");
					// Optionnel: redirection
					// window.location.href = '/login';
				}
			}
		} else if (error.request) {
			// Pas de réponse reçue (problème réseau, CORS, etc.)
			console.error("🌐 Problème réseau ou CORS:", error.request);
		} else {
			// Erreur de configuration
			console.error("⚙️ Erreur de configuration:", error.message);
		}

		return Promise.reject(error);
	}
);

export { api, getBaseURL };