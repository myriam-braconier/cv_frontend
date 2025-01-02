"use client";

import { useEffect, useState } from "react";
import { Auction } from "@/features/auctions/types/auction";
import ErrorBoundary from "@/components/ErrorBoundary";
import { API_URL } from "@/config/constants";
import axios from "axios";
import Image from "next/image";

interface AuctionListProps {
	auctions: Auction[];
	onUpdateSuccess?: () => void;
}

export const AuctionsList = ({
	auctions: initialAuctions,
	onUpdateSuccess,
}: AuctionListProps) => {
	const [auctions, setAuctions] = useState<Auction[]>(initialAuctions);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [priceFilter, setPriceFilter] = useState<string>("all");
	const [synthFilter, setSynthFilter] = useState<number | "all">("all");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	// remplace handleauctionupdate car plus complet car gère l'état de chargement
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

	// Obtenir la liste unique des synthétiseurs
	const uniqueSynthIds = Array.from(
		new Set(auctions.map((auction) => auction.synthetiserId))
	);

	// Filtrer les enchères
	const filteredAuctions = auctions
    .filter((auction) => {
        const matchesSynth = 
            synthFilter === "all" || 
            auction.synthetiser.marque === synthFilter;
            
        const matchesPrice =
            priceFilter === "all" ||
            (priceFilter === "under1000" && auction.proposal_price < 1000) ||
            (priceFilter === "1000to5000" &&
                auction.proposal_price >= 1000 &&
                auction.proposal_price <= 5000) ||
            (priceFilter === "over5000" && auction.proposal_price > 5000);
            
        return matchesSynth && matchesPrice;
    })
    .sort((a, b) => {
        return sortOrder === "asc"
            ? a.proposal_price - b.proposal_price
            : b.proposal_price - a.proposal_price;
    });

	return (
		<ErrorBoundary>
			<div className="p-4">
				{/* Ajout du bouton de rafraîchissement */}
				<div className="flex justify-end mb-4">
					<button
						onClick={handleRefresh}
						disabled={isRefreshing}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
					>
						{isRefreshing ? "Rafraîchissement..." : "Rafraîchir les enchères"}
					</button>
				</div>

				{/* Filtres */}
				<div className="mb-6 space-y-4 md:space-y-0 md:flex md:space-x-4">
					{/* Filtre par prix */}
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

					{/* Filtre par synthétiseur */}
					<div className="flex-1">
						<label className="block text-sm font-medium mb-2">
							Filtrer par synthétiseur
						</label>
						<select
							className="w-full p-2 border rounded"
							value={synthFilter}
							onChange={(e) =>
								setSynthFilter(
									e.target.value === "all" ? "all" : Number(e.target.value)
								)
							}
						>
							<option value="all">Tous les synthétiseurs</option>
							{uniqueSynthIds.map((id) => (
								<option key={id} value={id}>
									Synthétiseur {id}
								</option>
							))}
						</select>
					</div>

					{/* Tri par prix */}
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

				{/* Liste des enchères */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredAuctions.map((auction) => (
						<div
							key={auction.id}
							className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
						>
							{/* Image du synthétiseur */}
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
							</div>
						</div>
					))}
				</div>

				{/* Message si aucune enchère */}
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
