"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/axios";
import { toast } from "react-hot-toast";
import { AuctionPrice } from "@/features/synthetisers/types/synth"; // Import direct des types
import { API_URL } from '@/config/constants';

interface Price {
	value: number;
	currency: string;
}

interface CardPricingProps {
	price: number | Price | null;
	auctionPrices: AuctionPrice[];
	isAuthenticated: () => boolean;
	isLoading?: boolean;
	synthId: string;
	onUpdateSuccess?: () => void;
}

const CardPricing = ({
	price = 0,
	auctionPrices = [],
	isAuthenticated,
	isLoading = false,
	synthId,
	onUpdateSuccess,
}: CardPricingProps) => {
	const [localAuctionPrices, setLocalAuctionPrices] =
		useState<AuctionPrice[]>(auctionPrices);

		const router = useRouter();

	const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);
	const [auctionError, setAuctionError] = useState<string | null>(null);
	const [newBidAmount, setNewBidAmount] = useState<number | null>(null);

	const displayPrice = price
		? typeof price === "object"
			? price.value
			: price
		: 0;

	const getLatestAuction = useCallback((): AuctionPrice | null => {
		if (!localAuctionPrices || localAuctionPrices.length === 0) return null;

		// Trier les enchères par prix décroissant
		const sortedAuctions = [...localAuctionPrices].sort(
			(a, b) => b.proposal_price - a.proposal_price
		);

		// Log pour debug
		console.log("Latest auction data:", sortedAuctions[0]);
		return sortedAuctions[0];
	}, [localAuctionPrices]);

	const getLatestAuctionPrice = useCallback((): number | null => {
		const latestAuction = getLatestAuction();
		return latestAuction ? latestAuction.proposal_price : null;
	}, [getLatestAuction]);

	useEffect(() => {
		if (auctionPrices && auctionPrices.length > 0) {
			setLocalAuctionPrices(auctionPrices);
		}
	}, [auctionPrices]);

	const handleCreateAuction = async () => {
		if (!isAuthenticated() || !newBidAmount) {
			router.push("/login");
			return;
		}

		// Vérification que la nouvelle enchère est supérieure à la dernière
		const latestPrice = getLatestAuctionPrice();
		const minPrice = latestPrice ? latestPrice + 1 : displayPrice + 1;

		if (newBidAmount < minPrice) {
			setAuctionError(`L'enchère doit être supérieure à ${minPrice - 1}€`);
			toast.error(`L'enchère doit être supérieure à ${minPrice - 1}€`);
			return;
		}

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("Token non trouvé");
			}

			const tokenData = JSON.parse(atob(token.split(".")[1]));

			const response = await api.post(`${API_URL}/api/synthetisers/${synthId}/auctions`, {
				proposal_price: Number(newBidAmount),
				userId: tokenData.userId,
				synthetiserId: Number(synthId),
				status: "active",
			});

			console.log("Réponse reçue:", response);

			if (!response.data) {
				throw new Error("Pas de données reçues du serveur");
			}

			if (response.status === 201) {
				const newAuction = {
					...response.data,
					createdAt: new Date().toISOString(), // Ajout explicite de la date
				};

				setLocalAuctionPrices((prev) => [newAuction, ...prev]);
				setNewBidAmount(null);
				setAuctionError(null);

				if (onUpdateSuccess) {
					onUpdateSuccess();
				}
				toast.success("Enchère créée avec succès");
				router.refresh();
				window.location.reload(); // Force le rafraîchissement complet
			}
		} catch (error) {
			console.error("Erreur détaillée:", error);
			const errorMsg =
				error instanceof Error
					? error.message
					: "Erreur lors de la création de l'enchère";
			setAuctionError(errorMsg);
			toast.error(errorMsg);
		} finally {
			setIsLoadingAuctions(false);
		}
	};
	

	console.log({
		token: localStorage.getItem("token"),
		userId: localStorage.getItem("userId"),
		price,
		auctionPrices,
	});

	// RENDU
	return (
		<div className="flex flex-col space-y-4">
			{auctionError && <div className="text-red-500">{auctionError}</div>}

			<div className="flex justify-between items-center">
				<div className="text-lg font-semibold">
					{typeof displayPrice === "number"
						? `Prix initial: ${displayPrice}€`
						: displayPrice}
				</div>

				<div>
					{(() => {
						const latestAuction = getLatestAuction();
						if (!latestAuction) return <div>Aucune enchère</div>;

						const date = latestAuction.createdAt 
							? new Date(latestAuction.createdAt)
							: new Date();

						return (
							<div className="text-right">
								<div className="font-semibold">
									Dernière enchère: {latestAuction.proposal_price}€
								</div>
								<div className="text-sm text-gray-600">
									Créée le {date.toLocaleString('fr-FR', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</div>
							</div>
						);
					})()}
				</div>


			</div>

			{isAuthenticated() && (
				<div className="space-y-2">
					<input
						type="number"
						value={newBidAmount || ""}
						onChange={(e) =>
							setNewBidAmount(e.target.value ? Number(e.target.value) : null)
						}
						min={
							getLatestAuctionPrice()
								? getLatestAuctionPrice()! + 1
								: displayPrice + 1
						}
						className="w-full p-2 border rounded"
						placeholder="Montant de votre enchère"
					/>
					<button
						onClick={handleCreateAuction}
						disabled={isLoading || isLoadingAuctions || !newBidAmount}
						className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
					>
						{isLoadingAuctions ? "Enchère en cours..." : "Placer l'enchère"}
					</button>
				</div>
			)}
		</div>
	);
};

export default CardPricing;
