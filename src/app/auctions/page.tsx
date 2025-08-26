"use client";


import { useState, useCallback, useEffect } from "react";
import { AuctionsList } from "@/features/auctions/components/list/AuctionsList";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import api from "@/lib/axios/index";
import { useAuth } from "@/hooks/useAuth"; // import du hook
import BackgroundRotator from "@/components/BackgroundRotator";


export default function AuctionsPage() {
    const images = [
		"/images/iStock-1477817772.webp",
		"/images/login2.webp",
	];




    const { userData } = useAuth();
// Ajout de logs pour déboguer
console.log("userData:", userData);

const isAdmin = (() => {
    try {
        // Séparez le payload du token JWT
        const tokenParts = userData?.token.split('.');
        console.log("Token parts:", tokenParts);

        if (tokenParts && tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('Token Payload:', payload);
            console.log('RoleId from payload:', payload.roleId);
            console.log('isAdmin value:', payload.roleId === 2);
            return payload.roleId === 2;
        }
    } catch (error) {
        console.error('Erreur détaillée de décodage du token:', error);
    }
    return false;
})();

// Log final de isAdmin
console.log("Valeur finale de isAdmin:", isAdmin);

    
    // Vérifiez si 'admin' est dans le tableau des rôles

	const [auctions, setAuctions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);





	const fetchAuctions = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const auctionResponse = await api.get(`/api/auctions`);
			console.log("Response:", auctionResponse); // Pour voir la structure complète
			if (!auctionResponse.data.data) {
				throw new Error("Format de données invalide");
			}
			setAuctions(auctionResponse.data.data);
		} catch (error) {
			console.error(error);
			setError("Une erreur est survenue lors du chargement des données");
			// Ne pas rediriger automatiquement ici
		} finally {
			setIsLoading(false);
		}
	}, []);

	const onUpdateSuccess = useCallback(() => {
		fetchAuctions();
	}, [fetchAuctions]);

	useEffect(() => {
		fetchAuctions();
	}, [fetchAuctions]);

	// si authentification obligatoire
	// useEffect(() => {
	//     const token = localStorage.getItem("token");
	//     console.log("Token présent:", !!token);

	//     if (token) {
	//         try {
	//             const decodedToken = JSON.parse(atob(token.split('.')[1]));
	//             console.log("Token décodé:", decodedToken);
	//         } catch (e) {
	//             console.error("Erreur décodage token:", e);
	//         }
	//     }
	// }, []);

	if (isLoading) return <LoadingSpinner />;
	if (error) return <div className="text-red-500 text-center">{error}</div>;

	return (
		<main className="min-h-screen">
            {/* Background en premier avec z-index négatif */}
			<div className="fixed inset-0 -z-10">
				<BackgroundRotator images={images} />
			</div>
			<div className="w-full px-4 py-6">
				<h1 className="text-3xl font-bold mb-8 text-center  text-white ">
					Liste des Enchères
				</h1>

				<AuctionsList
					auctions={auctions}
					onUpdateSuccess={onUpdateSuccess}
					isAdmin={isAdmin}
				/>
			</div>
		</main>
	);
}
