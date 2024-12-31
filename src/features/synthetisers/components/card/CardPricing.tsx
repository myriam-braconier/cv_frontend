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
	isAdmin?: boolean;
}

const CardPricing = ({
	price = 0,
	auctionPrices = [],
	isAuthenticated,
	isLoading = false,
	synthId,
	onUpdateSuccess,
	isAdmin = false, // Valeur par defaut
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



	const fetchLatestAuction = useCallback(async () => {
		try {
			const response = await api.get(`${API_URL}/api/synthetisers/${synthId}/auctions/latest`);
			if (response.data) {
				setLocalAuctionPrices(prev => [response.data, ...prev]);
			}
		} catch (error) {
			console.error("Erreur lors de la récupération de la dernière enchère:", error);
		}
	}, [synthId]);
	


	const handleCreateAuction = async () => {
		if (!isAuthenticated() || !newBidAmount) {
			router.push("/login");
			return;
		}
	
		try {
			setIsLoadingAuctions(true);
			const response = await api.post(`${API_URL}/api/synthetisers/${synthId}/auctions`, {
				proposal_price: Number(newBidAmount),
				status: "active"
			});
	
			if (response.status === 201) {
				await fetchLatestAuction(); // Récupérer la dernière enchère
				setNewBidAmount(null);
				setAuctionError(null);
				toast.success("Enchère créée avec succès");
				if (onUpdateSuccess) {
					onUpdateSuccess();
				}
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				setAuctionError(error.message);
				toast.error(error.message);
			} else {
				setAuctionError("Erreur lors de la création de l'enchère");
				toast.error("Erreur lors de la création de l'enchère");
			}
		} finally {
			setIsLoadingAuctions(false);
		}
	};
	
	
	useEffect(() => {
		if (auctionPrices && auctionPrices.length > 0) {
			setLocalAuctionPrices(auctionPrices);
		}
	}, [auctionPrices]);

	useEffect(() => {
		if (synthId) {
			fetchLatestAuction();
		}
	}, [fetchLatestAuction, synthId])

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

			{isAuthenticated() && isAdmin && ( // Ajout de la condition isAdmin
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
