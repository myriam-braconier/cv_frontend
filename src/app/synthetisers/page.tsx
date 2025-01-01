"use client";

import { API_URL } from "@/config/constants";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ListSynthetisers from "@/features/synthetisers/components/list/ListSynthetisers";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import api from "@/lib/axios/index";

export default function SynthetisersPage() {
    const router = useRouter();
    const [synths, setSynths] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkAdminAccess = useCallback(async () => {
        try {
            const response = await api.get(`${API_URL}/auth/verify`);
            const roleId = response.data?.user?.roleId;
            return roleId === 2; // Retourne true si l'utilisateur est admin
        } catch {
            return false;
        }
    }, []);

    const fetchSynths = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const isAdmin = await checkAdminAccess();
            if (!isAdmin) {
                router.push('/login');
                return;
            }

            const synthResponse = await api.get(`${API_URL}/api/synthetisers`);
            setSynths(synthResponse.data.data);
        } catch (error) {
            console.error(error);
            setError("Une erreur est survenue");
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    }, [router, checkAdminAccess]);

    const onUpdateSuccess = useCallback(() => {
        fetchSynths();
    }, [fetchSynths]);

    useEffect(() => {
        fetchSynths();
    }, [fetchSynths]);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <main className="min-h-screen">
            <div className="w-full px-4 py-6">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Liste des Synthétiseurs
                </h1>
                
                <ListSynthetisers
                    synths={synths}
                    onUpdateSuccess={onUpdateSuccess}
                />
            </div>
        </main>
    );
}