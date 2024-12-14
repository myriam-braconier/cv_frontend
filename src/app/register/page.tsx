"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import axios from "axios";

interface FormData {
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	role: "user" | "admin" | "creat";
}

export default function Register() {
	const [formData, setFormData] = useState<FormData>({
		username: "",
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		role: "user",
	});
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "confirmPassword") {
		  setConfirmPassword(value);
		} else {
		  setFormData(prev => ({ ...prev, [name]: value }));
		}
	  };

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

	  // Validation des champs requis
	  if (!formData.username || !formData.email || !formData.password || !formData.last_name) {
		setError("Tous les champs obligatoires doivent être remplis");
		return;
	  }
	
	  // Validation du mot de passe
	  if (formData.password !== confirmPassword) {
		setError("Les mots de passe ne correspondent pas");
		return;
	  }

	  try {
		await axios.post(
		  "http://localhost:4000/api/auth/register",
		  formData
		);
		setSuccess("Utilisateur créé avec succès");
		// Redirection ou autre logique post-inscription
	  } catch (error) {
		if (axios.isAxiosError(error)) {
		  setError(error.response?.data?.message || "Erreur lors de l'inscription");
		} else {
		  setError("Une erreur inattendue s'est produite");
		}
	  }
	};





	return (
		<div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Créer un compte
				</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{error && (
						<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
							{error}
						</div>
					)}
					{success && (
						<div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
							{success}
						</div>
					)}

					<form className="space-y-6" onSubmit={handleSubmit}>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700"
								>
									Nom d&apos;utilisateur
								</label>
								<input
									type="text"
									name="username"
									id="username"
									autoComplete="username"
									required
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									value={formData.username}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label
									htmlFor="first_name"
									className="block text-sm font-medium text-gray-700"
								>
									Prénom
								</label>
								<input
									type="text"
									name="first_name"
									id="first_name"
									autoComplete="given-name"
									required
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									value={formData.first_name}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label
									htmlFor="last_name"
									className="block text-sm font-medium text-gray-700"
								>
									Nom
								</label>
								<input
									type="text"
									name="last_name"
									id="last_name"
									autoComplete="family-name"
									required
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									value={formData.last_name}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700"
								>
									Email
								</label>
								<input
									type="email"
									name="email"
									id="email"
									required
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									value={formData.email}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Mot de passe
								</label>
								<input
									type="password"
									name="password"
									required
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									value={formData.password}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Confirmer le mot de passe
								</label>
								<input
									type="password"
									name="confirmPassword"
									required
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									value={confirmPassword}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Inscription
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
