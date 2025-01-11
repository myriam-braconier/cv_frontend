"use client";

import { useEffect, useState, useCallback } from "react";
import { Synth } from "@/features/synthetisers/types/synth";
import { SynthetiserCard } from "../SynthetiserCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { API_URL } from "@/config/constants";
import { toast } from "react-hot-toast";

interface ListSynthetisersProps {
	synths: Synth[];
}

export const ListSynthetisers = ({
	synths: initialSynths,
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
				const response = await fetch(
					`${API_URL}/api/synthetisers?page=${page}&limit=${pageSize}`
				);

				if (!response.ok)
					throw new Error("Erreur lors du chargement des synthétiseurs");

				const data = await response.json();
				console.log("Data reçue:", data); // Pour déboguer
				// Mise à jour pour correspondre à la nouvelle structure de réponse
				if (data.synths || data.data) {
					// Vérifie les deux possibilités
					setSynths(data.synths || data.data); // Utilise synths ou data selon ce qui existe
					setTotalPages(Math.ceil(data.pagination?.total / pageSize));
					setCurrentPage(data.pagination?.currentPage || page);
				}
			} catch (error) {
				console.error("Erreur:", error);
				toast.error("Erreur lors du chargement des synthétiseurs");
				setSynths(initialSynths); // Fallback aux données initiales
			} finally {
				setIsLoading(false);
			}
		},
		[initialSynths, pageSize]
	);

	// Initialisation
	useEffect(() => {
		fetchSynths(1); // Charger la première page au montage
	}, [fetchSynths]);

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

	return (
		<ErrorBoundary>
			<div className="flex flex-col space-y-8">
				<h1 className="text-white text-bold">
					Liste de synthetiseurs Kawai - Korg - Roland
					<br />
					Données issues d&apos;un scraping éthique en Python du site
					synthetiseur.net
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
					{isLoading ? (
						<div className="col-span-full text-center text-white">
							Chargement...
						</div>
					) : (
						synths
							.sort((a, b) => {
								const marqueComparison = a.marque.localeCompare(b.marque);
								return marqueComparison !== 0
									? marqueComparison
									: a.modele.localeCompare(b.modele);
							})
							.map((synth) => (
								<div key={synth.id}>
									<SynthetiserCard
										synth={synth}
										onUpdateSuccess={handleUpdateSuccess}
										isAuthenticated={() => true}
									/>
								</div>
							))
					)}
				</div>

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
				</div>

				<div className="text-center text-white">
					{synths.length} synthétiseurs affichés
				</div>
			</div>
		</ErrorBoundary>
	);
};
