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

// Ajoutez une interface pour TimeElapsed
type TimeElapsed = string;

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
	const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>("");

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

// Fonction pour obtenir le montant minimum
const getMinimumBid = (): number => {
    // Si une enchère existe et son montant est valide
    if (latestAuction && typeof latestAuction.proposal_price === 'number' && !isNaN(latestAuction.proposal_price)) {
        return latestAuction.proposal_price + 1;
    }
    // Sinon, on prend le prix initial + 1
    return displayPrice + 1;
};

// const minimumBid = getMinimumBid();

	// On utilise fetch pour cette fonction, car accessible non authentifié
	const fetchLatestAuction = useCallback(async () => {
		try {
			const response = await fetch(
				`${API_URL}/api/synthetisers/${synthId}/auctions/latest`
			);
			const data = await response.json();

			if (data) {
				const now = new Date();
				const formattedData = {
					...data,
					createdAt: data.createdAt || now.toISOString(),
					updatedAt: data.updatedAt || now.toISOString(),
					proposal_price: parseFloat(data.proposal_price),
				};

				setLocalAuctionPrices([formattedData]);
			}
		} catch (error) {
			console.error("Erreur détaillée du fetch:", error);
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
		// on évite l'affichage du NaN
		const minimumBid = latestAuction 
		? Math.max(latestAuction.proposal_price + 1, displayPrice + 1)
		: displayPrice + 1;

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

	

	const latestAuction = getLatestAuction();


	const minimumBid = latestAuction && !isNaN(latestAuction.proposal_price)
    ? Math.max(latestAuction.proposal_price + 1, displayPrice + 1)
    : displayPrice + 1;

	// D'abord, modifions getAuctionDate pour qu'il ne retourne que Date | null
	const getAuctionDate = (auction: AuctionPrice | null): Date | null => {
		if (!auction) {
			console.log("Pas d'enchère fournie à getAuctionDate");
			return null;
		}

		console.log("Tentative de création de date avec:", {
			updatedAt: auction.updatedAt,
			typeUpdatedAt: typeof auction.updatedAt,
			createdAt: auction.createdAt,
			typeCreatedAt: typeof auction.createdAt,
		});

		console.log("Tentative de création de date avec:", {
			updatedAt: auction.updatedAt,
			typeUpdatedAt: typeof auction.updatedAt,
			createdAt: auction.createdAt,
			typeCreatedAt: typeof auction.createdAt,
		});

		// Si updatedAt existe et est valide
		if (auction.updatedAt) {
			const updatedAtDate = new Date(auction.updatedAt);
			console.log("Date créée depuis updatedAt:", updatedAtDate);
			if (!isNaN(updatedAtDate.getTime())) {
				return updatedAtDate;
			}
		}
		// Si createdAt existe et est un nombre valide
		if (auction.createdAt) {
			const createdAtDate = new Date(auction.createdAt);
			console.log("Date créée depuis createdAt:", createdAtDate);
			if (!isNaN(createdAtDate.getTime())) {
				return createdAtDate;
			}
		}

		console.log("Aucune date valide n'a pu être créée");
		return null;
	};



	useEffect(() => {
		if (synthId) {
			fetchLatestAuction();
		}
	}, [fetchLatestAuction, synthId]);


	// gestion de l'affichage temporel
	// Puis dans l'useEffect, gérer le texte à afficher :
	useEffect(() => {
		if (!latestAuction) {
			console.log("Pas d'enchère disponible");
			setTimeElapsed("rien pour le moment");
			return;
		}

		console.log("Données brutes de l'enchère:", latestAuction);

		const updateTimestamp = () => {
			const auctionDate = getAuctionDate(latestAuction);

			console.log("Tentative de récupération de la date:", {
				updatedAt: latestAuction.updatedAt,
				createdAt: latestAuction.createdAt,
				resultingDate: auctionDate,
			});

			if (auctionDate && !isNaN(latestAuction.proposal_price)) {
				const formattedTime = formatTimeElapsed(auctionDate);
				console.log("Temps formaté:", formattedTime);
				setTimeElapsed(formattedTime);
			} else {
				console.log("Impossible de créer une date valide ou montant invalide");
				setTimeElapsed("Pas d'enchère pour le moment");
			}
		};

		updateTimestamp();
		const interval = setInterval(updateTimestamp, 1000);

		return () => clearInterval(interval);
	}, [latestAuction]);

	console.log("Prix reçu:", price);
	console.log("Type du prix:", typeof price);
	console.log("Prix affiché:", displayPrice);

	// RENDU
	return (
		<div className="flex flex-col space-y-4">
			{auctionError && <div className="text-red-500">{auctionError}</div>}
			<div className="flex justify-between">
				<div className="text-left font-semibold">
					{price === null || displayPrice === 0 ? (
						<span className="text-white">
							Fixez votre prix ! <br /> Sur inscription
						</span>
					) : (
						`Prix initial: ${displayPrice}€`
					)}
				</div>

				<div>
					{latestAuction ? (
						<div className="text-right">
							<div className="font-semibold text-white">
								Dernière enchère:{" "}
								{isNaN(latestAuction.proposal_price)
									? "0€"
									: `${latestAuction.proposal_price}€`}
							</div>

							<div className="text-sm text-gray-600">
								{/* Si on a le temps écoulé, on l'affiche, sinon on affiche la date formatée */}
								{timeElapsed || latestAuction.updatedAt
									? new Date(latestAuction.updatedAt).toLocaleString("fr-FR", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
									  })
									: latestAuction.createdAt
									? new Date(latestAuction.createdAt).toLocaleString("fr-FR", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
									  })
									: "Date non disponible"}
							</div>
						</div>
					) : (
						<div>
							Aucune enchère - Soyez le premier à enchérir! Avec inscription
						</div>
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
						min={String(minimumBid)} // Conversion en string pour éviter les NaN
						className="w-full p-2 border rounded"
						placeholder={`Montant minimum: ${minimumBid}€`}
					/>
					<button
						onClick={handleCreateAuction}
						disabled={
							isLoading ||
							isLoadingAuctions ||
							!newBidAmount ||
							newBidAmount < minimumBid || // Garde la vérification ici aussi
							isNaN(newBidAmount) // Ajouter une vérification pour NaN
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
