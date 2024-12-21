"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Synth } from "@/types";
import { SynthetiserCard } from "./SynthetiserCard";
import { api } from "@/services/axios";
import { AxiosError } from "axios";

export default function ListSynthetisers() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [synths, setSynths] = useState<Synth[]>([]);
	const [userRoles, setUserRoles] = useState<string[]>([]);
 

	// Vérification de l'authentification et récupération des rôles
    const checkAuth = useCallback(async (): Promise<void> => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await api.get("/auth/me");
            const userRole = response.data.role;
            setUserRoles([userRole]); // Mettre à jour userRoles avec le rôle de l'utilisateur

        } catch (error) {
            console.error("Erreur lors de l'authentification:", error);
            localStorage.removeItem("token");
            router.push("/login");
        }
    }, [router]);

	// Récupération des synthétiseurs
	const fetchSynths = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const { data } = await api.get("/api/synthetisers");
			setSynths(data.data);
			console.log("Synthétiseurs récupérés:", data.data);
		} catch (error) {
			console.error("Erreur lors de la récupération des synthétiseurs:", error);
			if (error instanceof AxiosError && error.response?.status === 401) {
				sessionStorage.removeItem("token");
				router.push("/login");
				return;
			}
			setError(
				error instanceof AxiosError
					? error.response?.data?.message || "Erreur lors du chargement"
					: "Erreur inconnue"
			);
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	// Initialisation des données
    useEffect(() => {
        const initialize = async () => {
            await checkAuth();
            await fetchSynths();
        };
        initialize();
    }, [checkAuth, fetchSynths]);

	// Affichage des états
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

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
        <div className="w-full px-4">
        {/* Panel Administrateur - visible uniquement pour les admins */}
        {userRoles.includes('admin') && (
            <div className="container bg-white rounded-lg shadow-lg mx-auto py-4 px-4">
                <h2 className="text-center text-2xl font-bold">Panel {userRoles.join(", ")}</h2>
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
									userRoles={userRoles} 
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
	);
}