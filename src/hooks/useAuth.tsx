// @/hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/axios";
import Cookies from 'js-cookie';
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


interface AuthError extends Error {
    code?: string;
}

export const useAuth = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingToken, setIsCheckingToken] = useState(false);

    const setupToken = useCallback((token: string) => {
        if (!token) return;

        try {
            localStorage.setItem("token", token);
            Cookies.set('token', token, { 
                expires: 7,
                path: '/',
                sameSite: 'lax',
                secure: window.location.protocol === 'https:'
            });
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (error: unknown) {
            const authError = error as AuthError;
            console.error("Erreur lors de la configuration du token:", authError.message);
            throw new Error(`Échec de la configuration du token: ${authError.message}`);
        }
    }, []);

    const clearAuthData = useCallback(() => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            Cookies.remove('token', { path: '/' });
            delete api.defaults.headers.common["Authorization"];
            setUserData(null);
        } catch (error: unknown) {
            const authError = error as AuthError;
            console.error("Erreur lors du nettoyage des données d'auth:", authError.message);
        }
    }, []);

    const verifyToken = useCallback(async (token: string): Promise<boolean> => {
        if (!token) return false;

        try {
            await api.get(`${API_URL}/auth/verify`);
            return true;
        } catch (error: unknown) {
            const authError = error as AuthError;
            console.error("Erreur lors de la vérification du token:", authError.message);
            return false;
        }
    }, []);

    const login = async (email: string, password: string): Promise<UserData> => {
        try {
            const { data } = await api.post<AuthResponse>(`${API_URL}/auth/login`, { 
                email, 
                password 
            });

            if (!data.token) {
                throw new Error("Token manquant dans la réponse");
            }

            setupToken(data.token);

            const newUserData: UserData = {
                email,
                username: data.username || email.split("@")[0],
                role: data.roles || [],
                token: data.token,
            };

            localStorage.setItem("user", JSON.stringify(newUserData));
            setUserData(newUserData);

            return newUserData;
        } catch (error) {
            clearAuthData();
            console.error("Erreur lors du login:", error);
            throw error;
        }
    };

    const logout = useCallback(() => {
        clearAuthData();
    }, [clearAuthData]);

    const restoreSession = useCallback(async () => {
        try {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (!storedToken || !storedUser) {
                throw new Error("Données de session manquantes");
            }

            const isTokenValid = await verifyToken(storedToken);
            if (!isTokenValid) {
                throw new Error("Token invalide");
            }

            const user = JSON.parse(storedUser) as UserData;
            setupToken(storedToken);
            setUserData(user);
        } catch (error) {
            clearAuthData();
            console.error("Erreur lors de la restauration de la session:", error);
        } finally {
            setIsLoading(false);
        }
    }, [setupToken, clearAuthData, verifyToken]);

    const checkTokenValidity = useCallback(async () => {
        if (isCheckingToken || !userData?.token) return;

        try {
            setIsCheckingToken(true);
            const isValid = await verifyToken(userData.token);
            
            if (!isValid) {
                console.warn("Token invalide détecté");
                clearAuthData();
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du token:", error);
        } finally {
            setIsCheckingToken(false);
        }
    }, [userData, verifyToken, clearAuthData, isCheckingToken]);

    // Initialisation de la session
    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    // Vérification périodique du token
    useEffect(() => {
        const interval = setInterval(checkTokenValidity, 5 * 60 * 1000); // Toutes les 5 minutes
        return () => clearInterval(interval);
    }, [checkTokenValidity]);

    return {
        userData,
        isLoading,
        login,
        logout,
        isAuthenticated: !!userData,
    };
};