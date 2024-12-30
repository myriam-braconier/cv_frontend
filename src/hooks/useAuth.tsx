// @/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { api } from "@/services/axios";
import Cookies from 'js-cookie';
import { API_URL } from "@/config/constants";

interface UserData {
    email: string;
    username: string;
    role: string[];
    token: string;
}

export const useAuth = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fonction utilitaire pour configurer le token partout où c'est nécessaire
    const setupToken = (token: string) => {
        // Sauvegarder dans localStorage
        localStorage.setItem("token", token);
        
        // Sauvegarder dans les cookies
        Cookies.set('token', token, { 
            expires: 7,
            path: '/',
            sameSite: 'lax' // 'lax' est plus permissif que 'strict' pour les redirections
        });
        
        // Configurer axios
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post(`${API_URL}/auth/login`, { email, password });
            
            if (!response.data.token) {
                throw new Error("Token manquant dans la réponse");
            }

            const token = response.data.token;
            
            // Setup du token dans tous les emplacements nécessaires
            setupToken(token);

            const userData = {
                email,
                username: response.data.username || email.split("@")[0],
                role: response.data.roles || [],
                token: token,
            };

            localStorage.setItem("user", JSON.stringify(userData));
            setUserData(userData);

            // Vérification que le token a bien été sauvegardé
            const storedToken = localStorage.getItem("token");
            const cookieToken = Cookies.get('token');

            if (!storedToken || !cookieToken) {
                throw new Error("Échec de la sauvegarde du token");
            }

            return userData;
        } catch (error) {
            console.error("Erreur lors du login:", error);
            throw error;
        }
    };

    const logout = () => {
        // Nettoyer localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Nettoyer les cookies
        Cookies.remove('token', { path: '/' });
        
        // Nettoyer les headers axios
        delete api.defaults.headers.common["Authorization"];
        
        setUserData(null);
    };

    // Vérification et restauration de la session au chargement
    useEffect(() => {
        const initAuth = () => {
            const storedToken = localStorage.getItem("token");
            const cookieToken = Cookies.get('token');
            const storedUser = localStorage.getItem("user");

            // Si on a toutes les données nécessaires
            if (storedToken && cookieToken && storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    setUserData(user);
                    setupToken(storedToken);
                } catch (error) {
                    console.error("Erreur lors de la restauration de la session:", error);
                    logout(); // En cas d'erreur, on nettoie tout
                }
            } else {
                // Si une donnée est manquante, on nettoie tout pour éviter les états incohérents
                logout();
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    // Vérification périodique de la cohérence des tokens
    useEffect(() => {
        const checkTokens = () => {
            const storedToken = localStorage.getItem("token");
            const cookieToken = Cookies.get('token');

            if (storedToken !== cookieToken) {
                console.warn("Incohérence détectée dans les tokens");
                logout();
            }
        };

        const interval = setInterval(checkTokens, 1000); // Vérifier toutes les secondes
        return () => clearInterval(interval);
    }, []);

    return { userData, isLoading, login, logout };
};