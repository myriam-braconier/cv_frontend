"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/axios";
import { toast } from "react-hot-toast";
import { AuctionPrice } from "@/features/synthetisers/types/synth";
import { API_URL } from "@/config/constants";

interface CardPricingProps {
	price: number | Price | null;
	auctionPrices: AuctionPrice[];
	isAuthenticated: () => boolean;
	isLoading?: boolean;
	synthId: string;
	onUpdateSuccess?: () => void;
	isAdmin?: boolean;
}

interface Price {
	value: number;
	currency: string;
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
	const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);
	const [auctionError, setAuctionError] = useState<string | null>(null);
	const [newBidAmount, setNewBidAmount] = useState<number | null>(null);
	const router = useRouter();

	// solution de timestamp en temps réel
	const [timeElapsed, setTimeElapsed] = useState<string>("");

	const formatTimeElapsed = (date: Date): string => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `il y a ${days} jour${days > 1 ? "s" : ""}`;
		if (hours > 0) return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
		if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
		return `il y a ${seconds} seconde${seconds > 1 ? "s" : ""}`;
	};
	//_______________________________________________________

	const displayPrice: number = price
		? typeof price === "object" && "value" in price
			? price.value
			: typeof price === "number"
			? price
			: 0
		: 0;

	const getLatestAuction = useCallback((): AuctionPrice | null => {
		if (!localAuctionPrices || localAuctionPrices.length === 0) return null;
		const sortedAuctions = [...localAuctionPrices].sort(
			(a, b) => b.proposal_price - a.proposal_price
		);
		return sortedAuctions[0];
	}, [localAuctionPrices]);

	const fetchLatestAuction = useCallback(async () => {
		try {
			const response = await api.get(
				`${API_URL}/api/synthetisers/${synthId}/auctions/latest`
			);
			if (response.data) {
				const lastAuctionDate = Date.now();
				const formattedData = {
					...response.data,
					createdAt: lastAuctionDate,
					proposal_price: parseFloat(response.data.proposal_price),
				};
				localStorage.setItem(
					`auction_${formattedData.id}_date`,
					lastAuctionDate.toString()
				);
				setLocalAuctionPrices([formattedData]);
			}
		} catch (error) {
			console.error("Erreur:", error);
			toast.error("Impossible de récupérer la dernière enchère");
		} finally {
			setIsLoadingAuctions(false);
		}
	}, [synthId]);

	const handleCreateAuction = async () => {
		if (!isAuthenticated()) {
			router.push("/login");
			return;
		}

		if (!newBidAmount) {
			toast.error("Veuillez entrer un montant");
			return;
		}

		const latestAuction = getLatestAuction();
		const minimumBid = latestAuction
			? latestAuction.proposal_price
			: displayPrice;

		if (newBidAmount <= minimumBid) {
			toast.error(
				latestAuction
					? "Le montant doit être supérieur à la dernière enchère"
					: "Le montant doit être supérieur au prix initial"
			);
			return;
		}

		try {
			setIsLoadingAuctions(true);
			setAuctionError(null);

			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return;
			}

			const userId = JSON.parse(atob(token.split(".")[1])).id;
			const response = await api.post(
				`${API_URL}/api/synthetisers/${synthId}/auctions`,
				{
					proposal_price: Number(newBidAmount),
					status: "active",
					userId,
				}
			);

			if (response.status === 201) {
				await fetchLatestAuction();
				setNewBidAmount(null);
				toast.success("Enchère placée avec succès");
				if (onUpdateSuccess) {
					onUpdateSuccess();
				}
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Erreur lors de la création de l'enchère";
			setAuctionError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoadingAuctions(false);
		}
	};

	useEffect(() => {
		if (synthId) {
			fetchLatestAuction();
		}
	}, [fetchLatestAuction, synthId]);

	const latestAuction = getLatestAuction();
	const minimumBid = latestAuction
		? latestAuction.proposal_price + 1
		: displayPrice + 1;

	// Fonction utilitaire pour convertir une date de façon sûre
	const getAuctionDate = (auction: AuctionPrice | null): Date | null => {
		if (!auction) return null;

		// Si updatedAt existe et est valide
		if (auction.updatedAt) {
			const updatedAtDate = new Date(auction.updatedAt);
			if (!isNaN(updatedAtDate.getTime())) {
				return updatedAtDate;
			}
		}

		// Si createdAt existe et est un nombre valide
		if (auction.createdAt && typeof auction.createdAt === "number") {
			return new Date(auction.createdAt);
		}

		return null;
	};
// gestion de l'affichage temporel
	useEffect(() => {
    if (!latestAuction) return;
  
    // Fonction pour mettre à jour le timestamp
    const updateTimestamp = () => {
      const auctionDate = getAuctionDate(latestAuction);
      if (auctionDate) {
        setTimeElapsed(formatTimeElapsed(auctionDate));
        console.log("Latest Auction Date:", auctionDate); // Garde la fonctionnalité de debug
      }
    };
  
    // Mise à jour initiale
    updateTimestamp();
  
    // Mise à jour toutes les secondes
    const interval = setInterval(updateTimestamp, 1000);
  
    // Cleanup
    return () => clearInterval(interval);
  }, [latestAuction]);

	// RENDU
	return (
		<div className="flex flex-col space-y-4">
			{auctionError && <div className="text-red-500">{auctionError}</div>}
			<div className="flex justify-between items-center">
				<div className="text-lg font-semibold">
					Prix initial: {displayPrice}€
				</div>

        <div>
    {latestAuction ? (
        <div className="text-right">
            <div className="font-semibold">
                Dernière enchère: {latestAuction.proposal_price}€
            </div>
            <div className="text-sm text-gray-600">
                {timeElapsed || (() => {
                    if (typeof latestAuction.updatedAt === 'string') {
                        return new Date(latestAuction.updatedAt).toLocaleString("fr-FR");
                    }
                    if (typeof latestAuction.createdAt === 'number') {
                        return new Date(latestAuction.createdAt).toLocaleString("fr-FR");
                    }
                    return "Date non disponible";
                })()}
            </div>
        </div>
    ) : (
        <div>Aucune enchère - Soyez le premier à enchérir!</div>
    )}
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
						min={minimumBid}
						className="w-full p-2 border rounded"
						placeholder={`Montant minimum: ${minimumBid}€`}
					/>
					<button
						onClick={handleCreateAuction}
						disabled={
							isLoading ||
							isLoadingAuctions ||
							!newBidAmount ||
							newBidAmount < minimumBid
						}
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
