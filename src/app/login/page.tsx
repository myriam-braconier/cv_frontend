"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();




const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
        console.log("Données envoyées:", {
            email: email,
            password: password,
        });

        const api = axios.create({
            baseURL: "http://localhost:4000",
        });

        const response = await api.post("/auth/login", {
            email,
            password,
        });

        console.log("Réponse du serveur:", response.data);

        const { token, userId, username, email: userEmail } = response.data;

        // Stocker les informations utilisateur
        const userInfo = {
            username,
            email: userEmail
        };

        // Stocker dans localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("user", JSON.stringify(userInfo)); // Stocke l'objet userInfo

        console.log('Données stockées:', {
            token: token ? 'Présent' : 'Absent',
            userInfo
        });

        router.push("/synthetisers");
        
    } catch (error: unknown) {
        console.error("Erreur complète:", error);
        if (axios.isAxiosError(error)) {
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        setError("Identifiants incorrects");
                        break;
                    case 404:
                        setError("Utilisateur non trouvé");
                        break;
                    case 500:
                        setError("Erreur serveur. Réessayez plus tard.");
                        break;
                    default:
                        setError("Une erreur est survenue");
                }
            } else if (error.request) {
                setError("Pas de réponse du serveur");
            } else {
                setError("Erreur lors de la préparation de la requête");
            }
        } else {
            setError("Une erreur inattendue est survenue");
        }
    }
};







	return (
		<form onSubmit={handleLogin}>
			<input
				type="email" // Type email pour la validation de base
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Email"
				required
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Mot de passe"
				required
			/>
			{error && <p style={{ color: "red" }}>{error}</p>}
			<button type="submit">Connexion</button>
		</form>
	);
}
