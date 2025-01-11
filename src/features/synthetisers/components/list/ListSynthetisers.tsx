"use client";

import { useEffect, useState, useCallback } from "react";
import { Synth } from "@/features/synthetisers/types/synth";
import { SynthetiserCard } from "../SynthetiserCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { API_URL } from "@/config/constants";
import { toast } from "react-hot-toast";

interface ListSynthetisersProps {
	synths: Synth[];
	onUpdateSuccess?: () => void;
}

export const ListSynthetisers = ({
	synths: initialSynths,
	onUpdateSuccess,
}: ListSynthetisersProps) => {
	const [synths, setSynths] = useState<Synth[]>(initialSynths);
	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const pageSize = 12; // Nombre de synthés par page

	const fetchSynths = useCallback(async (page: number) => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`${API_URL}/api/synthetisers?page=${page}&limit=${pageSize}`
			);

			if (!response.ok) {
				throw new Error("Erreur lors du chargement des synthétiseurs");
			}

			const data = await response.json();
			setSynths(data.synths);
			setTotalPages(Math.ceil(data.total / pageSize));
			setCurrentPage(page);
		} catch (error) {
			console.error("Erreur:", error);
			toast.error("Erreur lors du chargement des synthétiseurs");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		setSynths(initialSynths);
	}, [initialSynths]);

	return (
		<ErrorBoundary>
			<div className="flex flex-col space-y-8">
            {/* Titre */}
				<h1>
					Liste de synthetiseurs Kawai - Korg - Roland
					<br /> Données issues d&apos;un scraping éthique en Python du site
					synthetiseur.net
				</h1>

				{/* Grille de synthétiseurs */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
					{isLoading ? (
						<div className="col-span-full text-center text-white">
							Chargement...
						</div>
					) : (
						synths
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
										onUpdateSuccess={() => fetchSynths(currentPage)}
										isAuthenticated={() => true}
									/>
								</div>
							))
					)}
				</div>
                
				{/* Contrôles de pagination */}
				<div className="flex justify-center items-center gap-4 p-4">
					<button
						onClick={() => fetchSynths(currentPage - 1)}
						disabled={currentPage === 1 || isLoading}
						className="px-4 py-2 bg-pink-600 text-white rounded-lg disabled:opacity-50 transition-opacity"
					>
						Précédent
					</button>

					<div className="flex items-center gap-2 text-white">
						<span>
							Page {currentPage} sur {totalPages}
						</span>
					</div>

					<button
						onClick={() => fetchSynths(currentPage + 1)}
						disabled={currentPage === totalPages || isLoading}
						className="px-4 py-2 bg-pink-600 text-white rounded-lg disabled:opacity-50 transition-opacity"
					>
						Suivant
					</button>
				</div>

				{/* Indicateur du nombre total */}
				<div className="text-center text-white">
					{synths.length} synthétiseurs affichés
				</div>
			</div>
		</ErrorBoundary>
	);
};
