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
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const determineUserRoles = useCallback(async () => {
        try {
            const response = await api.get(`${API_URL}/auth/verify`);
            const roleId = response.data?.user?.roleId;
            const roles = [];
            
            switch (roleId) {
                case 2:
                    roles.push("admin", "editor", "user");
                    break;
                case 1:
                    roles.push("editor", "user");
                    break;
                default:
                    roles.push("user");
            }
            
            setUserRoles(roles);
            return roles.includes("admin");
        } catch {
            setUserRoles(["user"]);
            return false;
        }
    }, []);

    const fetchSynths = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const isAdmin = await determineUserRoles();
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
    }, [router, determineUserRoles]);

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
                    userRoles={userRoles}
                    onUpdateSuccess={onUpdateSuccess}
                />
            </div>
        </main>
    );
}
