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

				// Mise à jour modifiée pour gérer correctement la pagination
				if (data) {
					// Accédez aux synthétiseurs
					const synthsList = data.synths || data.data || [];
					setSynths(synthsList);

					// Calcul correct des pages
					const total =
						data.pagination?.total || data.total || synthsList.length;
					const calculatedTotalPages = Math.max(1, Math.ceil(total / pageSize));
					setTotalPages(calculatedTotalPages);

					// Mise à jour de la page courante
					setCurrentPage(page);
				}
			} catch (error) {
				console.error("Erreur:", error);
				toast.error("Erreur lors du chargement des synthétiseurs");
				setSynths(initialSynths);
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
				<div className="text-white text-bold col-span-8 mx-auto bg-slate-400 p-10 opacity-50 rounded-lg">
					<span>
						Liste de synthetiseurs Kawai - Korg - Roland
						<br />
						Données issues d&apos;un scraping éthique en Python du site
						<a href="https://synthetiseur.net"> synthetiseur.net</a>
						<br />
						Les prix indiqués sont totalement fictifs
					</span>
				</div>

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
