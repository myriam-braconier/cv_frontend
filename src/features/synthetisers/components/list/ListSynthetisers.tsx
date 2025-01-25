"use client";

import { useEffect, useState, useCallback } from "react";
import { Synth } from "@/features/synthetisers/types/synth";
import { SynthetiserCard } from "../SynthetiserCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { API_URL } from "@/config/constants";
import api from "@/lib/axios/index";

interface ListSynthetisersProps {
    isAuthenticated: () => boolean;
}

export const ListSynthetisers = ({
    isAuthenticated,
}: ListSynthetisersProps) => {
    const [synths, setSynths] = useState<Synth[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const pageSize = 12;

    const fetchSynths = useCallback(async (page: number) => {
        console.log('Fetching synths for page:', page);
        setIsLoading(true);
        try {
            const response = await api.get(`${API_URL}/api/synthetisers`, {
                params: {
                    page,
                    limit: pageSize,
                },
            });
            console.log('API Response:', response.data);
            
            if (response.data && response.data.synths) {
                setSynths(response.data.synths);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPages);
                    setCurrentPage(response.data.pagination.currentPage);
                }
            }
        } catch (error) {
            console.error('Error fetching synths:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchSynths(1);
        }
    }, [fetchSynths, isAuthenticated]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            fetchSynths(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            fetchSynths(currentPage + 1);
        }
    };

    const handleUpdateSuccess = () => {
        fetchSynths(currentPage);
    };

    return (
        <ErrorBoundary>
            <div className="flex flex-col space-y-8 relative z-10">
                <div className="text-white text-bold col-span-8 mx-auto bg-slate-400 p-10 opacity-90 rounded-lg">
                    <span>
                        Liste de synthetiseurs Kawai - Korg - Roland
                        <br />
                        Données issues d&apos;un scraping éthique en Python du site
                        <a href="https://synthetiseur.net"> synthetiseur.net</a>
                        <br />
                        Les prix indiqués sont totalement fictifs
                    </span>
                </div>

                {!isAuthenticated() ? (
                    <div className="col-span-8 mx-auto bg-gray-600/60 p-4">
                        <h3 className="text-center text-xl font-bold text-white">
                            Pour découvrir les synthétiseurs et les fonctionnalités,
                            connectez-vous : Aficionado 012345678
                        </h3>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {isLoading ? (
                                <div className="col-span-full text-center text-white">
                                    Chargement...
                                </div>
                            ) : synths && synths.length > 0 ? (
                                synths.map((synth: Synth) => (
                                    <SynthetiserCard
                                        key={synth.id}
                                        synth={synth}
                                        onUpdateSuccess={handleUpdateSuccess}
                                        isAuthenticated={isAuthenticated}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center text-white">
                                    Aucun synthétiseur disponible
                                </div>
                            )}
                        </div>

                        {synths.length > 0 && (
                            <div className="flex justify-center items-center gap-4 p-4">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-pink-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    Précédent
                                </button>
                                <span className="text-white">
                                    Page {currentPage} sur {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-pink-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </ErrorBoundary>
    );
};
