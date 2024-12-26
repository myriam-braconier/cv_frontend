import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { api } from "@/services/axios";
import axios from "axios";
import { toast } from "react-hot-toast";

interface AuctionPrice {
  proposal_price: number;
  status: string;
  userId?: string;
  synthetiserId?: string;
  createdAt?: string;
}
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
  price,
  auctionPrices = [],
  isAuthenticated,
  isLoading = false,
  synthId,
  onUpdateSuccess
}: CardPricingProps) => {
  const [localAuctionPrices, setLocalAuctionPrices] = useState<AuctionPrice[]>(auctionPrices);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);
  const [auctionError, setAuctionError] = useState<string | null>(null);
  const router = useRouter();

  const displayPrice = price
    ? typeof price === "object"
      ? price.value
      : price
    : "Prix indisponible";

  const getLatestAuctionPrice = useCallback((): AuctionPrice | null => {
    if (!localAuctionPrices.length) return null;
    return localAuctionPrices.reduce((prev, current) => 
      prev.proposal_price > current.proposal_price ? prev : current
    );
  }, [localAuctionPrices]);

  const canBid = useCallback(() => {
    if (!isAuthenticated()) return false;
    const latestAuction = getLatestAuctionPrice();
    if (!latestAuction) return true;
    return latestAuction.status !== "active";
  }, [getLatestAuctionPrice, isAuthenticated]);

  const loadAuctionPrices = useCallback(async () => {
    if (!synthId) {
      console.log('Pas de synthId disponible');
      return;
    }

    setIsLoadingAuctions(true);
    setAuctionError(null);
    
    try {
      const response = await api.get<AuctionPrice[]>(`/api/synthetisers/${synthId}/auctions`);
      setLocalAuctionPrices(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des enchères:", error);
      let errorMessage = "Erreur lors du chargement des enchères";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || error.message;
        if (error.response.status === 401) {
          router.push('/login');
        }
      }
      setAuctionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingAuctions(false);
    }
  }, [synthId, router]);

 const handleCreateAuction = async () => {
  if (!isAuthenticated()) {
    router.push("/login");
    return;
  }
  setIsLoadingAuctions(true);
  setAuctionError(null);

  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("Utilisateur non connecté");
    }

    const latestAuction = getLatestAuctionPrice();
    let newPrice: number;
    
    // Détermination du nouveau prix d'enchère
    if (latestAuction && latestAuction.proposal_price > 0) {
      newPrice = latestAuction.proposal_price + 100;
    } else if (price) {
      newPrice = (typeof price === "object" ? price.value : price) + 100;
    } else {
      throw new Error("Prix de base non disponible");
    }

    // Validation du prix
    if (newPrice <= 0) {
      throw new Error("Le prix d'enchère doit être supérieur à 0");
    }

    const newAuction: Partial<AuctionPrice> = {
      proposal_price: newPrice,
      status: "active",
      userId: userId,
      synthetiserId: synthId,
      createdAt: new Date().toISOString()
    };

    const response = await api.post(`/api/synthetisers/${synthId}/auctions`, newAuction);

    // Mise à jour de l'état local
    setLocalAuctionPrices(prevPrices => [response.data, ...prevPrices]);
    toast.success("Enchère placée avec succès");
    
    if (onUpdateSuccess) {
      onUpdateSuccess();
    }
  } catch (error) {
    let errorMessage = "Erreur lors de la création de l'enchère";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || error.message;
      if (error.response.status === 401) {
        router.push('/login');
        return;
      }
    }
    
    setAuctionError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoadingAuctions(false);
  }
};

  useEffect(() => {
    if (isAuthenticated()) {
      loadAuctionPrices();
    }
  }, [loadAuctionPrices, isAuthenticated]);

  const latestAuctionPrice = getLatestAuctionPrice();



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
      {isAuthenticated() && canBid() && (!latestAuctionPrice || latestAuctionPrice.proposal_price === 0) && (
        <button
          onClick={handleCreateAuction}
          disabled={isLoading || isLoadingAuctions}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Enchère en cours..." : "Enchérir"}
        </button>
      )}
    </div>
  );





};
export default CardPricing;
