"use client";

import { ListSynthetisers } from "@/features/synthetisers/components/list/ListSynthetisers";
import AiGenerator from "../../components/AiGenerator";
import { useState, useEffect } from "react";
import { Synth } from "@/features/synthetisers/types/synth";


export default function SynthetisersPage() {
	
  
  
	const [synths] = useState<Synth[]>([]);
	const [isAuth, setIsAuth] = useState(false);

	// const images = [
	// 	"/images/iStock-1477817772.webp",
	// 	"/images/login2.webp",
	// ];

	// ------------IMPOSER l'authentification--------------------------------------------
	// const verifyAuth = useCallback(async () => {
	//     const token = localStorage.getItem("token");
	//     if (!token) {
	//         router.push('/login');
	//         return false;
	//     }

	//     try {
	//         const response = await api.get(`${API_URL}/auth/verify`);
	//         const roleId = response.data?.user?.roleId;
	//         // Acceptez plusieurs rôles valides
	//         const validRoles = [1, 2]; // Par exemple, admin et autres rôles autorisés
	//         if (!validRoles.includes(roleId)) {
	//             router.push('/login');
	//             return false;
	//         }
	//         return true;
	//     } catch (error) {
	//         console.error("Erreur de vérification:", error);
	//         // Ne redirigez pas automatiquement en cas d'erreur API
	//         setError("Erreur de vérification de l'authentification");
	//         return false;
	//     }
	// }, [router]);

	// const fetchSynths = useCallback(async () => {
	//     try {
	//         setIsLoading(true);
	//         setError(null);

	//         const isAuthorized = await verifyAuth();
	//         if (!isAuthorized) {
	//             setError("Accès non autorisé");
	//             return;
	//         }

	//         const synthResponse = await api.get(`${API_URL}/api/synthetisers`);
	//         if (!synthResponse.data.data) {
	//             throw new Error("Format de données invalide");
	//         }
	//         setSynths(synthResponse.data.data);
	//     } catch (error) {
	//         console.error(error);
	//         setError("Une erreur est survenue lors du chargement des données");
	//         // Ne pas rediriger automatiquement ici
	//     } finally {
	//         setIsLoading(false);
	//     }
	// }, [verifyAuth]);

	// const fetchSynths = useCallback(async () => {
	//     try {
	//         setIsLoading(true);
	//         setError(null);

	//         const synthResponse = await api.get(`${API_URL}/api/synthetisers`);
	//         if (!synthResponse.data.data) {
	//             throw new Error("Format de données invalide");
	//         }
	//         setSynths(synthResponse.data.data);
	//     } catch (error) {
	//         console.error(error);
	//         setError("Une erreur est survenue lors du chargement des données");
	//     } finally {
	//         setIsLoading(false);
	//     }
	// }, []);

	// -----------------------SI authentification------------------------------------
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

	// if (isLoading) return <LoadingSpinner />;
	// if (error) return <div className="text-red-500 text-center">{error}</div>;


    useEffect(() => {
        setIsAuth(!!localStorage.getItem("token"));
    }, []);


	return (
		<AiGenerator>
			<main className="min-h-screen relative">
				{/* Background en premier avec z-index négatif */}
				<div className="w-full px-4 py-6 relative z-10">
					{/* <BackgroundRotator images={images} /> */}

					<h1 className="text-3xl font-bold mb-8 text-center text-white">
						Synthétiseurs
					</h1>

					<ListSynthetisers
						synths={synths}
                        isAuthenticated={() => isAuth}					/>
				</div>
			</main>
		 </AiGenerator>
	);
}
