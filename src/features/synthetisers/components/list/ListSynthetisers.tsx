"use client";

import { useEffect, useState, useCallback } from "react";
import { Synth } from "@/features/synthetisers/types/synth";
import { SynthetiserCard } from "../SynthetiserCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { API_URL } from "@/config/constants";
import { toast } from "react-hot-toast";
import api from "@/lib/axios/index";

interface ListSynthetisersProps {
	synths: Synth[];
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

	// Fonction de récupération des données
	const fetchSynths = useCallback(
		async (page: number) => {
			if (page < 1) return;
			setIsLoading(true);
			try {
				const response = await api.get(`${API_URL}/api/synthetisers`, {
					params: {
						page,
						limit: pageSize,
					},
				});

				const synthsList = response.data.synths;

				if (synthsList && Array.isArray(synthsList)) {
					// Improved sorting logic
					const sortedSynths = [...synthsList].sort((a, b) => {
						// First, compare by brand (marque)
						const marqueA = (a.marque || "").toLowerCase().trim();
						const marqueB = (b.marque || "").toLowerCase().trim();
						const marqueCompare = marqueA.localeCompare(marqueB, "fr");

						// If brands are the same, then compare by model (modele)
						if (marqueCompare === 0) {
							const modeleA = (a.modele || "").toLowerCase().trim();
							const modeleB = (b.modele || "").toLowerCase().trim();
							return modeleA.localeCompare(modeleB, "fr");
						}

						return marqueCompare;
					});

					setSynths(sortedSynths);

					if (response.data.pagination) {
						setTotalPages(response.data.pagination.totalPages);
						setCurrentPage(response.data.pagination.currentPage);
					}
				} else {
					throw new Error("Structure de données inattendue");
				}
			} catch (error) {
				console.error("Erreur:", error);
				toast.error("Erreur lors du chargement des synthétiseurs");
				setSynths([]);
			} finally {
				setIsLoading(false);
			}
		},
		[pageSize]
	);

	// Gestion de la pagination
	const handlePreviousPage = () => {
		if (currentPage > 1) fetchSynths(currentPage - 1);
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) fetchSynths(currentPage + 1);
	};

	const handleUpdateSuccess = () => {
		fetchSynths(currentPage);
	};

	// Initialisation
	useEffect(() => {
		fetchSynths(1); // Charger la première page au montage
	}, [fetchSynths]);

	console.log("Auth status:", isAuthenticated);

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
				{!isAuthenticated() && ( // isAuthenticated est une fonction, si c'est une simple variable alors : {!isAuthenticated}
					<div className="col-span-8 mx-auto bg-gray-600/60">
						<h3 className="text-center text-xl font-bold text-white">
							Pour découvrir les synthétiseurs et les fonctionnalités,
							connectez-vous : Aficionado 012345678
						</h3>
					</div>
				)}

{isAuthenticated() && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
					{isLoading ? (
						<div className="col-span-full text-center text-white">
							Chargement...
						</div>
					) : (
						synths.map((synth) => (
							<div key={synth.id}>
								<SynthetiserCard
									synth={synth}
									onUpdateSuccess={handleUpdateSuccess}
									isAuthenticated={isAuthenticated}
								/>
							</div>
						))
					)}
				</div>
				)}

				{isAuthenticated() && (
					<div className="flex justify-center items-center gap-4 p-4">
						<button
							onClick={handlePreviousPage}
							disabled={currentPage === 1 || isLoading}
							className="px-4 py-2 bg-pink-600 text-white rounded-lg disabled:opacity-50"
						>
							Précédent
						</button>

						<span className="text-white">
							Page {currentPage} sur {totalPages}
						</span>

						<button
							onClick={handleNextPage}
							disabled={currentPage === totalPages || isLoading}
							className="px-4 py-2 bg-pink-600 text-white rounded-lg disabled:opacity-50"
						>
							Suivant
						</button>
						<div className="text-center text-white">
							{synths.length} synthétiseurs affichés
						</div>
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
};
