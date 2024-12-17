"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
	const [username, setusername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false); // État de chargement
	const router = useRouter();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
 
		// Validation de base
		if (password !== confirmPassword) {
			setError("Les mots de passe ne correspondent pas");
			setLoading(false);
			return;
		}
 
		try {
			console.log('Tentative d\'inscription :', { username, email });
 
			const api = axios.create({
				baseURL: 'http://localhost:4000'
			});
 
			const response = await api.post("/auth/register", {
				username,
				email,
				password
			});
 
			console.log('Réponse du serveur:', response.data);
 
			if (response.status === 201) {
				router.push("/login");
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error('Erreur détaillée:', {
					status: error.response?.status,
					data: error.response?.data
				});
 
				if (error.response) {
					switch (error.response.status) {
						case 400:
							setError("Données invalides");
							break;
						case 409:
							setError("Email ou nom d'utilisateur déjà existant");
							break;
						case 500:
							setError("Erreur serveur. Réessayez plus tard.");
							break;
						default:
							setError("Une erreur est survenue lors de l'inscription");
					}
				} else if (error.request) {
					setError("Pas de réponse du serveur");
				} else {
					setError("Erreur lors de la préparation de la requête");
				}
			} else {
				setError("Une erreur inattendue est survenue");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleRegister} className="max-w-md mx-auto mt-10">
			<div className="mb-4">
				<label htmlFor="username" className="block mb-2">
					Nom d&aposutilisateur
				</label>
				<input
					type="text"
					id="username"
					value={username}
					onChange={(e) => setusername(e.target.value)}
					placeholder="Votre nom d'utilisateur"
					required
					className="w-full px-3 py-2 border rounded"
				/>
			</div>

			<div className="mb-4">
				<label htmlFor="email" className="block mb-2">
					Email
				</label>
				<input
					type="email"
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Votre email"
					required
					className="w-full px-3 py-2 border rounded"
				/>
			</div>

			<div className="mb-4">
				<label htmlFor="password" className="block mb-2">
					Mot de passe
				</label>
				<input
					type="password"
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Votre mot de passe"
					required
					minLength={8}
					className="w-full px-3 py-2 border rounded"
				/>
			</div>

			<div className="mb-4">
				<label htmlFor="confirmPassword" className="block mb-2">
					Confirmer le mot de passe
				</label>
				<input
					type="password"
					id="confirmPassword"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="Confirmez votre mot de passe"
					required
					minLength={8}
					className="w-full px-3 py-2 border rounded"
				/>
			</div>

			{error && <div className="mb-4 text-red-500">{error}</div>}

			<button
				type="submit"
				disabled={loading} // Désactive le bouton si loading est vrai
				className={`w-full ${
					loading ? "bg-gray-400" : "bg-blue-500"
				} text-white py-2 rounded hover:bg-blue-600`}
			>
				{loading ? "Chargement..." : "S'inscrire"}
			</button>
		</form>
	);
}
