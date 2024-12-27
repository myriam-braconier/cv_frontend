"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/axios";
import { toast } from "react-hot-toast";
import { AuctionPrice } from "@/features/synthetisers/types/synth"; // Import direct des types

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
	// Mettre à jour le state local quand les props changent
	useEffect(() => {
		setLocalAuctionPrices(auctionPrices);
		if (onUpdateSuccess) {
			onUpdateSuccess();
		}
	}, [auctionPrices, onUpdateSuccess]);

	const router = useRouter();
	const [localAuctionPrices, setLocalAuctionPrices] =
		useState<AuctionPrice[]>(auctionPrices);
	const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);
	const [auctionError, setAuctionError] = useState<string | null>(null);
	const [newBidAmount, setNewBidAmount] = useState<number | null>(null);

	const displayPrice = price
		? typeof price === "object"
			? price.value
			: price
		: 0;

	const getLatestAuctionPrice = useCallback((): number | null => {
		if (!localAuctionPrices || localAuctionPrices.length === 0) return null;

		const highestBid = localAuctionPrices.reduce(
			(max, current) =>
				current.proposal_price > max ? current.proposal_price : max,
			localAuctionPrices[0].proposal_price
		);

		return highestBid;
	}, [localAuctionPrices]);

	const latestAuctionPrice = getLatestAuctionPrice();

	const handleCreateAuction = async () => {
		if (!isAuthenticated() || !newBidAmount) {
		  router.push("/login");
		  return;
		}
	  
		try {
		  const token = localStorage.getItem("token");
		  if (!token) {
			throw new Error("Token non trouvé");
		  }
	  
		  const tokenData = JSON.parse(atob(token.split('.')[1]));
	  
		  const response = await api.post(`/api/auctions/${synthId}`, {
			proposal_price: Number(newBidAmount),
			userId: tokenData.userId,
			synthetiserId: Number(synthId),
			status: 'active'
		  });

// Création d'un objet qui correspond au type AuctionPrice
const newAuction: AuctionPrice = {
	id: response.data.id,
	proposal_price: response.data.proposal_price,
	status: response.data.status,
	synthetiserId: response.data.synthetiserId,
	userId: response.data.userId,
	createdAt: response.data.createdAt,
	createAt: response.data.createdAt, // Pour correspondre au type AuctionPrice
	updateAt: response.data.updatedAt || response.data.createdAt // Fallback si updatedAt n'existe pas
  };
	  
	 // Mettre à jour le state local avec la nouvelle enchère
	 setLocalAuctionPrices(prev => [newAuction, ...prev]);
		  setNewBidAmount(null);
		  if (onUpdateSuccess) onUpdateSuccess();
		  toast.success("Enchère créée avec succès");
		} catch (error) {
		  const errorMsg = error instanceof Error ? error.message : "Erreur lors de la création de l'enchère";
		  setAuctionError(errorMsg);
		  toast.error(errorMsg);
		} finally {
		  setIsLoadingAuctions(false);
		}
	  };
	  
	  
	useEffect(() => {
		console.log("Debug CardPricing:", {
			isAuthenticated: isAuthenticated(),
			price,
			displayPrice,
			latestAuctionPrice,
			localAuctionPrices,
			newBidAmount,
		});
	}, [
		isAuthenticated,
		price,
		displayPrice,
		latestAuctionPrice,
		localAuctionPrices,
		newBidAmount,
	]);

	useEffect(() => {
		if (auctionPrices && auctionPrices.length > 0) {
			setLocalAuctionPrices(auctionPrices);
		}
	}, [auctionPrices]);


	console.log({
		token: localStorage.getItem('token'),
		userId: localStorage.getItem('userId'),
		price,
		auctionPrices
	  });


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
					{latestAuctionPrice
						? `Dernière enchère: ${latestAuctionPrice}€`
						: "Aucune enchère"}
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
							latestAuctionPrice
								? latestAuctionPrice + 1
								: typeof displayPrice === "number"
								? displayPrice + 1
								: 0
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
