"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { api } from "@/services/axios";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { data } = await api.post("/auth/login", {
                email,
                password,
            });

            const { token, userId, username, email: userEmail } = data;

            // Stockage du token et configuration d'Axios
            localStorage.setItem("token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Stockage des infos utilisateur
            const userInfo = {
                userId,
                username,
                email: userEmail,
            };
            localStorage.setItem("user", JSON.stringify(userInfo));

            console.log("Connexion réussie, redirection...");
            router.push("/");
            router.refresh(); // Rafraîchit la navigation pour mettre à jour l'état d'authentification
            
        } catch (error) {
            console.error("Erreur de connexion:", error);
            
            if (error instanceof AxiosError) {
                switch (error.response?.status) {
                    case 401:
                        setError("Email ou mot de passe incorrect");
                        break;
                    case 404:
                        setError("Cette adresse email n'est pas enregistrée");
                        break;
                    case 422:
                        setError("Veuillez vérifier vos informations");
                        break;
                    case 500:
                        setError("Erreur serveur. Veuillez réessayer plus tard.");
                        break;
                    default:
                        setError(
                            error.response?.data?.message || 
                            "Une erreur est survenue lors de la connexion"
                        );
                }
            } else {
                setError("Une erreur inattendue est survenue");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
            )}

            <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion en cours...
                    </span>
                ) : 'Se connecter'}
            </button>
        </form>
    );
}