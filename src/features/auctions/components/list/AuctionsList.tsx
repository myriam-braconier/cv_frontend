"use client";

import { useEffect, useState } from "react";
import { Auction } from "@/features/auctions/types/auction";
import ErrorBoundary from "@/components/ErrorBoundary";
import { API_URL } from "@/config/constants";
import Image from "next/image";
import axios, { AxiosError } from "axios";

type SynthFilter = 0 | number; // 0 représente "all"

interface AuctionListProps {
	auctions: Auction[];
	onUpdateSuccess?: () => void;
	isAdmin?: boolean;
}

export const AuctionsList = ({
	auctions: initialAuctions,
	onUpdateSuccess,
	isAdmin = true,
}: AuctionListProps) => {
	const [auctions, setAuctions] = useState<Auction[]>(initialAuctions);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isDeleting, setIsDeleting] = useState<number | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [priceFilter, setPriceFilter] = useState<string>("all");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [synthFilter, setSynthFilter] = useState<SynthFilter>(0);
	const [modelFilter, setModelFilter] = useState<"all" | string>("all");

	// Fonction de suppression d'une enchère
	const handleDelete = async (auctionId: number) => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette enchère ?")) {
			return;
		}

		try {
			setIsDeleting(auctionId);
			setDeleteError(null);

			try {
				await axios.delete(`${API_URL}/auctions/${auctionId}`);
			} catch (error) {
				// Si l'erreur est 204 ou 200, on considère que c'est un succès
				const axiosError = error as AxiosError;
				if (
					axiosError.response?.status === 204 ||
					axiosError.response?.status === 200
				) {
					// Continue avec le succès
				} else {
					throw error; // Relance l'erreur si ce n'est pas 204 ou 200
				}
			}

			// Si on arrive ici, c'est que la suppression est réussie
			setAuctions((prevAuctions) =>
				prevAuctions.filter((auction) => auction.id !== auctionId)
			);

			if (onUpdateSuccess) {
				await onUpdateSuccess();
			}
		} catch (error) {
			console.error("Erreur détaillée lors de la suppression:", error);

			let errorMessage =
				"Une erreur est survenue lors de la suppression de l'enchère";

			if (axios.isAxiosError(error)) {
				const axiosError = error as AxiosError;

				// Ignorer l'erreur si le statut est 204 ou 200
				if (
					axiosError.response?.status === 204 ||
					axiosError.response?.status === 200
				) {
					return;
				}

				switch (axiosError.response?.status) {
					case 404:
						errorMessage = "Cette enchère n'existe pas ou a déjà été supprimée";
						// Si l'enchère n'existe plus, on peut la retirer de l'état local
						setAuctions((prevAuctions) =>
							prevAuctions.filter((auction) => auction.id !== auctionId)
						);
						break;
					case 403:
						errorMessage =
							"Vous n'avez pas les droits nécessaires pour supprimer cette enchère";
						break;
					case 401:
						errorMessage =
							"Veuillez vous reconnecter pour effectuer cette action";
						break;
					default:
						if (
							axiosError.response?.data &&
							typeof axiosError.response.data === "object" &&
							"message" in axiosError.response.data
						) {
							errorMessage = (axiosError.response.data as { message: string })
								.message;
						} else if (!axiosError.response) {
							errorMessage =
								"Impossible de contacter le serveur. Veuillez vérifier votre connexion.";
						}
				}
			}

			setDeleteError(errorMessage);
		} finally {
			setIsDeleting(null);
		}
	};

	const handleRefresh = async () => {
		try {
			setIsRefreshing(true);
			const response = await axios.get(`${API_URL}/api/auctions`);

			const auctionsData = Array.isArray(response.data)
				? response.data
				: response.data.data;

			setAuctions(auctionsData);
			if (onUpdateSuccess) {
				await onUpdateSuccess();
			}
		} catch (error) {
			console.error("Erreur détaillée lors du rafraîchissement:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	useEffect(() => {
		setAuctions(initialAuctions);
	}, [initialAuctions]);

	const uniqueSynthIds = Array.from(
		new Set(auctions.map((auction) => auction.synthetiserId))
	);

	const filteredAuctions = auctions
		.filter((auction) => {
			const matchesSynth =
				synthFilter === 0 || auction.synthetiser.id === synthFilter;

			const matchesModel =
				modelFilter === "all" || auction.synthetiser.modele === modelFilter;

			const matchesPrice =
				priceFilter === "all" ||
				(priceFilter === "under1000" && auction.proposal_price < 1000) ||
				(priceFilter === "1000to5000" &&
					auction.proposal_price >= 1000 &&
					auction.proposal_price <= 5000) ||
				(priceFilter === "over5000" && auction.proposal_price > 5000);

			return matchesSynth && matchesModel && matchesPrice;
		})
		.sort((a, b) => {
			return sortOrder === "asc"
				? a.proposal_price - b.proposal_price
				: b.proposal_price - a.proposal_price;
		});

	return (
		<ErrorBoundary>
			<div className="p-4">
				<div className="flex justify-end mb-4">
					<button
						onClick={handleRefresh}
						disabled={isRefreshing}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
					>
						{isRefreshing ? "Rafraîchissement..." : "Rafraîchir les enchères"}
					</button>
				</div>

				<div className="mb-6 space-y-4 md:space-y-0 md:flex md:space-x-4">
					<div className="flex-1">
						<label className="block text-sm font-medium mb-2">
							Filtrer par prix
						</label>
						<select
							className="w-full p-2 border rounded"
							value={priceFilter}
							onChange={(e) => setPriceFilter(e.target.value)}
						>
							<option value="all">Tous les prix</option>
							<option value="under1000">Moins de 1000€</option>
							<option value="1000to5000">Entre 1000€ et 5000€</option>
							<option value="over5000">Plus de 5000€</option>
						</select>
					</div>

					<div className="flex-1">
						<label className="block text-sm font-medium mb-2">
							Filtrer par modèle
						</label>
						<select
							className="w-full p-2 border rounded"
							value={modelFilter}
							onChange={(e) => setModelFilter(e.target.value)}
						>
							<option value="all">Tous les modèles</option>
							{Array.from(
								new Set(
									auctions
										.filter(
											(auction) =>
												auction.synthetiser && auction.synthetiser.modele
										)
										.map((auction) => auction.synthetiser.modele)
								)
							).map((modele) => (
								<option key={modele} value={modele}>
									{modele}
								</option>
							))}
						</select>
					</div>

					<div className="flex-1">
						<label className="block text-sm font-medium mb-2">
							Filtrer par synthétiseur
						</label>
						<select
							className="w-full p-2 border rounded"
							value={synthFilter}
							onChange={(e) => setSynthFilter(Number(e.target.value))}
						>
							<option value={0}>Tous les synthétiseurs</option>
							{uniqueSynthIds.map((id) => {
								const synth = auctions.find(
									(a) => a.synthetiserId === id
								)?.synthetiser;
								return (
									<option key={id} value={id}>
										{synth
											? `${synth.marque} ${synth.modele}`
											: `Synthétiseur ${id}`}
									</option>
								);
							})}
						</select>
					</div>

					<div className="flex-1">
						<label className="block text-sm font-medium mb-2">
							Trier par prix
						</label>
						<select
							className="w-full p-2 border rounded"
							value={sortOrder}
							onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
						>
							<option value="desc">Prix décroissant</option>
							<option value="asc">Prix croissant</option>
						</select>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredAuctions.map((auction) => (
						<div
							key={auction.id}
							className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
						>
							<div className="relative h-[150px] w-[150px] mb-1">
								{auction.synthetiser?.image_url ? (
									<Image
										src={auction.synthetiser.image_url}
										alt={`${auction.synthetiser.marque} ${auction.synthetiser.modele}`}
										width={150}
										height={150}
										className="object-cover rounded-lg"
									/>
								) : (
									<div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
										<span className="text-gray-500">
											Pas d&apos;image disponible
										</span>
									</div>
								)}
							</div>

							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="font-semibold text-lg">
										Enchère #{auction.id}
									</h3>
									<p className="text-gray-600">
										{auction.synthetiser
											? `${auction.synthetiser.marque} ${auction.synthetiser.modele}`
											: `Synthétiseur #${auction.synthetiserId}`}
									</p>
								</div>
								<span
									className={`px-2 py-1 rounded text-sm ${
										auction.status === "active"
											? "bg-green-100 text-green-800"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									{auction.status}
								</span>
							</div>

							<div className="space-y-2">
								<p className="text-xl font-bold">{auction.proposal_price}€</p>
								<p className="text-sm text-gray-500">
									Mis à jour le :{" "}
									{new Date(auction.updatedAt || "").toLocaleDateString()}
								</p>
								{isAdmin && (
									<>
										{deleteError && isDeleting === auction.id && (
											<p className="text-sm text-red-500 mb-2">{deleteError}</p>
										)}
										<button
											onClick={() => handleDelete(auction.id)}
											disabled={isDeleting === auction.id}
											className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
										>
											{isDeleting === auction.id
												? "Suppression..."
												: "Supprimer"}
										</button>
									</>
								)}
							</div>
						</div>
					))}
				</div>

				{filteredAuctions.length === 0 && (
					<p className="text-center text-gray-500 mt-8">
						Aucune enchère ne correspond aux critères sélectionnés
					</p>
				)}
			</div>
		</ErrorBoundary>
	);
};

export default AuctionsList;
