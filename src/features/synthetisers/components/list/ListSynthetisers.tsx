"use client";

import { useEffect, useState, useCallback } from "react";
import { Synth } from "@/features/synthetisers/types/synth";
import { SynthetiserCard } from "../SynthetiserCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useRouter } from "next/navigation";

interface ListSynthetisersProps {
    synths: Synth[];
    onUpdateSuccess?: () => void;
}

export const ListSynthetisers = ({
    synths: initialSynths,
    onUpdateSuccess,
}: ListSynthetisersProps) => {
    const [synths, setSynths] = useState<Synth[]>(initialSynths);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [authState, setAuthState] = useState<boolean>(false);
    const router = useRouter();

    const isAuthenticated = useCallback(() => {
        return authState;
    }, [authState]);

    useEffect(() => {
        const checkAuth = async () => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");
                
                if (!token || !userId) {
                    router.push('/login');
                    return;
                }

                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const isAdminUser = payload.roleId === 2;
                    setIsAdmin(isAdminUser);
                    setAuthState(true);
                } catch (error) {
                    console.error("Erreur de vérification du token:", error);
                    router.push('/login');
                }
            }
        };

        checkAuth();
    }, [router]);

    useEffect(() => {
        setSynths(initialSynths);
    }, [initialSynths]);

    if (!authState) {
        return null;
    }

    return (
        <ErrorBoundary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {synths
                    .sort((a, b) => {
                        const marqueComparison = a.marque.localeCompare(b.marque);
                        if (marqueComparison !== 0) return marqueComparison;
                        return a.modele.localeCompare(b.modele);
                    })
                    .map((synth) => (
                        <div key={synth.id} className="flex flex-col space-y-4">
                            <SynthetiserCard
                                key={synth.id}
                                synth={synth}
                                hasAdminRole={isAdmin}
                                onUpdateSuccess={onUpdateSuccess}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    ))}
            </div>
        </ErrorBoundary>
    );
};

export default ListSynthetisers;