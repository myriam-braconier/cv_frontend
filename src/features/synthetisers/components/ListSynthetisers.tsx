"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Synth } from "@/types/synth";
import axios from "axios";
import { SynthetiserCard } from "./SynthetiserCard";
import { api } from "@/services/axios";
import ErrorBoundary from '@/components/ErrorBoundary';  // Importez l'ErrorBoundary

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
		  if (!isAuthenticated) {
			console.log("Non authentifié, redirection vers login");
			return;
		  }
	  
		  // Récupération des données en parallèle
		  const [roleResponse, synthResponse] = await Promise.all([
			api.get("/auth/me"),
			api.get("/api/synthetisers")
		  ]);
	  
		  // Traitement du rôle utilisateur
		  console.log("Réponse role:", roleResponse.data);
		  const userRole = roleResponse.data.role;
		  setUserRoles(userRole === "admin" ? ["admin"] : [userRole]);
	  
		  // Traitement des synthétiseurs
		  console.log("Données synthétiseurs:", synthResponse.data.data);
		  setSynths(synthResponse.data.data);
	  
		} catch (error) {
		  console.error("Erreur:", error);
		  
		  if (axios.isAxiosError(error)) {
			if (error.response?.status === 401) {
			  localStorage.removeItem("token");
			  router.push("/login");
			  return;
			}
			
			setError(
			  error.response?.data?.message || 
			  "Erreur lors de la récupération des données"
			);
		  } else {
			setError("Une erreur inattendue est survenue");
		  }
		} finally {
		  setIsLoading(false);
		}
	  }, [router, checkAuth]);
	  

	// Ne pas écraser les roles ici
	// const rolesArray = Array.isArray(data.roles) ? data.roles : [data.roles];
	// setUserRoles(rolesArray);
	// console.log("Rôles après traitement:", rolesArray);

	// Log des rôles à chaque changement
	useEffect(() => {
		console.log("userRoles mis à jour:", userRoles);
	}, [userRoles]);

	useEffect(() => {
		fetchSynths();
	}, [fetchSynths]);

	const handleUpdateSuccess = useCallback(async () => {
		await fetchSynths();
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
		<ErrorBoundary>
		<div className="w-full px-4">
			{/* Panel Administrateur - visible uniquement pour les admins */}
			{userRoles.includes("admin") && (
				<div className="container bg-white rounded-lg shadow-lg mx-auto  py-4 px-4">
					<h2 className="text-center text-2xl font-bold">
						Panel {userRoles.join(", ")}
					</h2>
					{/* <p className="text-sm text-gray-600">
						Rôles actuels : {userRoles.join(", ")}
					</p> */}
				</div>
			)}

			{/* Grille des synthétiseurs avec configuration responsive :
                - Mobile (< 640px) : 1 carte par ligne
                - Tablette (≥ 640px) : 2 cartes par ligne
                - Desktop (≥ 1024px) : 3 cartes par ligne 
                - Espacement de 2rem (32px) entre les cartes (gap-8)
            */}

			<div className="container mx-auto px-4 ">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{synths.length > 0 ? (
						// tri alpphabétique par marques et affichage des cartes
						[...synths]
							.sort((a, b) => a.marque.localeCompare(b.marque))
							.map((synth) => (
								<SynthetiserCard
									key={synth.id} // ajout de la prop directement sur le composant
									synthetiser={synth}
									userRoles={userRoles} // Ajout des userRoles ici
									onUpdateSuccess={handleUpdateSuccess}
								/>
							))
					) : (
						// message si aucun synthetiseur n'est trouvé
						<div className="col-span-full text-center">
							<p className="text-gray-500">Aucun synthétiseur trouvé</p>
						</div>
					)}
				</div>
			</div>
		</div>
		</ErrorBoundary>
	);
}
