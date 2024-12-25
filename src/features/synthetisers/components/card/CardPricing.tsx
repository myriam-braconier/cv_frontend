import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AuctionPrice {
  proposal_price: number;
  status: string;
}

interface CardPricingProps {
  price: (number | { value: number }) | null;
  auctionPrices: AuctionPrice[];
  onBid: () => Promise<void>;
  isAuthenticated: () => boolean;
  canBid: () => boolean;
  isLoading: boolean;
  synthId?: string;
}

export const CardPricing: React.FC<CardPricingProps> = ({
  price,
  auctionPrices = [],
  onBid,
  isAuthenticated,
  canBid,
  isLoading,
  synthId
}) => {
  const [localAuctionPrices, setLocalAuctionPrices] = useState<AuctionPrice[]>(auctionPrices);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);
  const [auctionError, setAuctionError] = useState<string | null>(null);

  const displayPrice = price
    ? typeof price === "object"
      ? price.value
      : price
    : "Prix indisponible";

  const latestAuctionPrice = localAuctionPrices.length > 0 ? localAuctionPrices[0] : null;

  useEffect(() => {
    const loadAuctionPrices = async () => {
      if (!synthId) {
        console.log('Pas de synthId disponible');
        return;
      }

      setIsLoadingAuctions(true);
      
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await axios.get<AuctionPrice[]>(`/api/synthetisers/${synthId}/auctions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });

        setLocalAuctionPrices(response.data);

      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Erreur API:", error.response?.data || error.message);
          setAuctionError(error.response?.data?.message || error.message);
        } else if (error instanceof Error) {
          console.error("Erreur:", error.message);
          setAuctionError(error.message);
        } else {
          console.error("Erreur inconnue:", error);
          setAuctionError("Une erreur inconnue est survenue");
        }
      } finally {
        setIsLoadingAuctions(false);
      }
    };

    loadAuctionPrices();
  }, [synthId]);

  const handleBid = async () => {
    try {
      await onBid();
    } catch (error) {
      console.error("Erreur d'enchère:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {auctionError && (
        <div className="text-red-500 mb-2">
          {auctionError}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          {typeof displayPrice === "number"
            ? `Prix: ${displayPrice}€`
            : displayPrice}
        </div>
        <div>
          {latestAuctionPrice 
            ? `Enchère actuelle: ${latestAuctionPrice.proposal_price}€`
            : "Enchère ouverte"
          }
        </div>
      </div>

      {isAuthenticated() && canBid() && (
        <button
          onClick={handleBid}
          disabled={isLoading || isLoadingAuctions}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Enchère en cours..." : "Enchérir"}
        </button>
      )}
    </div>
  );
};
  