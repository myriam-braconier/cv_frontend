"use client";

import { useEffect, useState } from "react";
import { Synth } from "@/features/synthetisers/types/synth";
import { SynthetiserCard } from "../SynthetiserCard";
import ErrorBoundary from "@/components/ErrorBoundary";

interface ListSynthetisersProps {
    synths: Synth[];
    onUpdateSuccess?: () => void;
}

export const ListSynthetisers = ({
    synths: initialSynths,
    onUpdateSuccess,
}: ListSynthetisersProps) => {
    const [synths, setSynths] = useState<Synth[]>(initialSynths);

    useEffect(() => {
        setSynths(initialSynths);
    }, [initialSynths]);

    return (
        <ErrorBoundary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                <h1>Liste de synthetiseurs Kawai - Korg - Roland
                    < br/> Données issues d&apos;un scraping éthique en Python du site 
                    synthetiseur.net
                </h1>
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
                                onUpdateSuccess={onUpdateSuccess}
                                isAuthenticated={() => true}
                            />
                        </div>
                    ))}
            </div>
        </ErrorBoundary>
    );
};