// @/hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config/constants";

interface UserData {
	email: string;
	username: string;
	role: string[];
	token: string;
}

interface AuthResponse {
	token: string;
	username?: string;
	roles?: string[];
}

export const useAuth = () => {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const setupToken = useCallback((token: string) => {
        if (!token) return;
    
        const cookieOptions: Cookies.CookieAttributes = {
            expires: 7,
            path: '/',
            domain: window.location.hostname,
            sameSite: 'None',
            secure: true
        };
    
        try {
            // Suppression de l'ancien cookie d'abord
            Cookies.remove('token', { path: '/' });
            
            // Configuration du nouveau cookie avec toutes les options
            Cookies.set('token', token, cookieOptions);
    
            // Vérification que le cookie a été correctement défini
            const storedCookie = Cookies.get('token');
            if (!storedCookie) {
                console.warn('Le cookie n\'a pas été correctement défini');
                
                // Tentative alternative de définition du cookie
                document.cookie = `token=${token}; path=/; secure=true; samesite=None; max-age=${7 * 24 * 60 * 60}`;
            }
    
            localStorage.setItem("token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (error) {
            console.error('Erreur lors de la configuration du cookie:', error);
        }
    }, []);

	const clearAuthData = useCallback(() => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		Cookies.remove("token", { path: "/" });
		delete api.defaults.headers.common["Authorization"];
		setUserData(null);
	}, []);

	const verifyToken = useCallback(async (token: string): Promise<boolean> => {
		try {
			const response = await api.get(`${API_URL}/auth/verify`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			return response.status === 200;
		} catch {
			return false;
		}
	}, []);

	const login = async (email: string, password: string): Promise<UserData> => {
		try {
			const { data } = await api.post<AuthResponse>(`${API_URL}/auth/login`, {
				email,
				password,
			});

			if (!data.token) {
				throw new Error("Token manquant dans la réponse");
			}

			const newUserData: UserData = {
				email,
				username: data.username || email.split("@")[0],
				role: data.roles || [],
				token: data.token,
			};

			setupToken(data.token);
			localStorage.setItem("user", JSON.stringify(newUserData));
			setUserData(newUserData);

			return newUserData;
		} catch (error) {
			clearAuthData();
			throw error;
		}
	};

	const logout = useCallback(() => {
		clearAuthData();
	}, [clearAuthData]);

	const checkSession = useCallback(async () => {
		const token = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (!token || !storedUser) {
			clearAuthData();
			return;
		}

		try {
			const isValid = await verifyToken(token);
			if (!isValid) {
				console.warn("Session expirée ou invalide");
				clearAuthData();
				return;
			}

			const user = JSON.parse(storedUser) as UserData;
			if (user.token !== token) {
				console.warn("Incohérence entre les tokens stockés");
				clearAuthData();
				return;
			}

			setUserData(user);
			setupToken(token);
		} catch (error) {
			console.error("Erreur lors de la vérification de session:", error);
			clearAuthData();
		}
	}, [clearAuthData, setupToken, verifyToken]);

	// Initialisation
	useEffect(() => {
		checkSession().finally(() => setIsLoading(false));
	}, [checkSession]);

	// Vérification périodique
	useEffect(() => {
		const interval = setInterval(checkSession, 5 * 60 * 1000); // 5 minutes
		return () => clearInterval(interval);
	}, [checkSession]);

	return {
		userData,
		isLoading,
		login,
		logout,
		isAuthenticated: !!userData,
	};
};
