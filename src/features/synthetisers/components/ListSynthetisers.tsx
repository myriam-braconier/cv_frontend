"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Synth } from "@/types";
import axios from "axios";
import { SynthetiserCard } from "./SynthetiserCard";
import { api } from "@/services/axios";

export default function ListSynthetisers() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [synths, setSynths] = useState<Synth[]>([]);
	const [userRoles, setUserRoles] = useState<string[]>([]);

	const checkAuth = useCallback(async (): Promise<boolean> => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return false;
			}
			const response = await api.get("/auth/me");
			console.log("Réponse checkAuth:", response.data);

			return response.status === 200;
		} catch {
			router.push("/login");
			return false;
		}
	}, [router]);

	const fetchSynths = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const isAuthenticated = await checkAuth();
			if (!isAuthenticated) return;

			// recupération des roles de l'utilisateur
			const roleResponse = await api.get("/auth/me");
			console.log("Réponse role:", roleResponse.data);
			// on s'assure que le role est bien l'attribut correct dans la réponse
			const userRole = roleResponse.data.role;
			console.log("Role reçu:", userRole);

			if (userRole === "admin") {
				setUserRoles(["admin"]);
			} else {
				setUserRoles([userRole]);
			}

			// recupération des synthétiseurs
			const { data } = await api.get("/api/synthetisers");
            console.log("Données synthétiseurs:", data.data);

			//Mise à jour des synthétiseurs
			setSynths(data.data);

			// Ne pas écraser les roles ici
			// const rolesArray = Array.isArray(data.roles) ? data.roles : [data.roles];
			// setUserRoles(rolesArray);
			// console.log("Rôles après traitement:", rolesArray);

			console.log("Rôle actuel:", userRole);
			console.log("Est admin:", userRole === "admin");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					localStorage.removeItem("token");
					router.push("/login");
				} else {
					setError(
						error.response?.data?.message ||
							"Une erreur inattendue est survenue"
					);
				}
			} else {
				setError("Une erreur inattendue est survenue");
			}
		} finally {
			setIsLoading(false);
		}
	}, [router, checkAuth]);

	// Log des rôles à chaque changement
	useEffect(() => {
		console.log("userRoles mis à jour:", userRoles);
	}, [userRoles]);

	useEffect(() => {
		fetchSynths();
	}, [fetchSynths]);

	// affichage du loader pendant le chargement
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}
	// affichage des erreurs avec bouton de retry
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[200px] p-4">
				<div className="text-red-500 mb-4">{error}</div>
				<button
					onClick={() => fetchSynths()}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
				>
					Réessayer
				</button>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Panel Administrateur - visible uniquement pour les admins */}
			{userRoles.includes("admin") && (
				<div className="bg-white rounded-lg shadow-lg p-4 mb-6">
					<h2 className="text-2xl font-bold">Panel Administrateur</h2>
					<p className="text-sm text-gray-600">
						Rôles actuels : {userRoles.join(", ")}
					</p>
				</div>
			)}

			{/* Grille des synthétiseurs avec configuration responsive :
                - Mobile (< 640px) : 1 carte par ligne
                - Tablette (≥ 640px) : 2 cartes par ligne
                - Desktop (≥ 1024px) : 3 cartes par ligne 
                - Espacement de 2rem (32px) entre les cartes (gap-8)
            */}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
				{synths.length > 0 ? (
					// tri alpphabétique par marques et affichage des cartes
					[...synths]
						.sort((a, b) => a.marque.localeCompare(b.marque))
						.map((synth) => (
							// <div key={synth.id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
							<SynthetiserCard
								key={synth.id} // ajout de la prop directement sur le composant
								synthetiser={synth}
								userRoles={userRoles} // Ajout des userRoles ici
							/>
							// </div>
						))
				) : (
					// message si aucun synthetiseur n'est trouvé
					<div className="col-span-full text-center py-8">
						<p className="text-gray-500">Aucun synthétiseur trouvé</p>
					</div>
				)}
			</div>
		</div>
	);
}
