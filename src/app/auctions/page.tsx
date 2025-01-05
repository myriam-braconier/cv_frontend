"use client";

import { API_URL } from "@/config/constants";
import { useState, useCallback, useEffect } from "react";
// import { useRouter } from "next/navigation"; // si authentification
import { AuctionsList } from "@/features/auctions/components/list/AuctionsList";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import api from "@/lib/axios/index";

export default function AuctionsPage() {
    // const router = useRouter(); // si authentification
    const [auctions, setAuctions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
// imposer l'autentification
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

    // const fetchAuctions = useCallback(async () => {
    //     try {
    //         setIsLoading(true);
    //         setError(null);
            
    //         const isAuthorized = await verifyAuth();
    //         if (!isAuthorized) {
    //             setError("Accès non autorisé");
    //             return;
    //         }
    
    //         const auctionResponse = await api.get(`${API_URL}/api/auctions`);
    //         console.log('Response:', auctionResponse); // Pour voir la structure complète
    //         if (!auctionResponse.data.data) {
    //             throw new Error("Format de données invalide");
    //         }
    //         setAuctions(auctionResponse.data.data);
    //     } catch (error) {
    //         console.error(error);
    //         setError("Une erreur est survenue lors du chargement des données");
    //         // Ne pas rediriger automatiquement ici
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, [verifyAuth]);

     const fetchAuctions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
    
            const auctionResponse = await api.get(`${API_URL}/api/auctions`);
            console.log('Response:', auctionResponse); // Pour voir la structure complète
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
    }, [])

    

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
            <div className="w-full px-4 py-6">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Liste des Enchères
                </h1>
                
                <AuctionsList
                    auctions={auctions}
                    onUpdateSuccess={onUpdateSuccess}
                />
            </div>
        </main>
    );
}