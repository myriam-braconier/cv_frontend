"use client";

import { useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";
import { CardImage } from "@/features/synthetisers/components/card/CardImage";
import { CardHeader } from "@/features/synthetisers/components/card/CardHeader";
import { CardPricing } from "@/features/synthetisers/components/card/CardPricing";
import { CardActions } from "@/features/synthetisers/components/card/CardActions";
import { useSynths } from "@/hooks/useSynths";
import { Synth, AuctionPrice } from "@features/synthetisers/types";
import { PostList } from "@/features/synthetisers/components/posts/PostList";
import { SynthesiserDialog } from "@/features/synthetisers/components/dialogs/SynthetiserDialog";

interface SynthetiserCardProps {
    synthetiser: Synth;
    userRoles?: string[];
    onUpdateSuccess?: () => void;
  }
  
  export const SynthetiserCard = ({
    synthetiser,
    userRoles = [],
    onUpdateSuccess,
  }: SynthetiserCardProps) => {
    const [showPosts, setShowPosts] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAuctionLoading, setIsAuctionLoading] = useState(false);
  
    const router = useRouter();
    const { updateSynth, isUpdating, updateError } = useSynths();
  
    const { id, image_url, marque, modele, note, nb_avis, specifications, price, auctionPrices = [], posts = [] } = synthetiser;
    const fullTitle = `${marque} ${modele}`;
  
    const checkToken = useCallback(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token d'authentification manquant");
        return null;
      }
      return token;
    }, []);
  
    const isAuthenticated = useCallback(() => {
      return !!localStorage.getItem("userId");
    }, []);
  
    const getLatestAuctionPrice = useCallback((): AuctionPrice | null => {
      if (!auctionPrices || auctionPrices.length === 0) return null;
      return auctionPrices.reduce((latest, current) => {
        const latestDate = new Date(latest.createdAt).getTime();
        const currentDate = new Date(current.createdAt).getTime();
        return currentDate > latestDate ? current : latest;
      });
    }, [auctionPrices]);
  
    const canBid = useCallback(() => {
      if (!isAuthenticated()) return false;
      const latestAuction = getLatestAuctionPrice();
      if (!latestAuction) return true;
      const currentUserId = localStorage.getItem("userId");
      return latestAuction.userId?.toString() !== currentUserId?.toString();
    }, [getLatestAuctionPrice, isAuthenticated]);
  
    const handleCreateAuction = async () => {
      const token = checkToken();
      if (!token) {
        router.push("/login");
        return;
      }
  
      setIsAuctionLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const latestAuction = getLatestAuctionPrice();
        const basePrice = latestAuction?.proposal_price || Number(price);
  
        const response = await fetch("/api/synth-auctions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            proposal_price: basePrice + 100,
            synthetiserId: id,
            userId,
            status: "active",
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
  
        const newAuction = await response.json();
        if (newAuction.status === "active") {
          toast.success("Votre enchère a été placée avec succès !");
        } else if (newAuction.status === "outbid") {
          toast.warning("Une enchère plus élevée existe déjà !");
        } else {
          toast.info(`Statut de l'enchère : ${newAuction.status}`);
        }
        
        if (onUpdateSuccess) onUpdateSuccess();
      } catch (error) {
        console.error("Erreur d'enchère:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Erreur lors de la création de l'enchère");
        }
      } finally {
        setIsAuctionLoading(false);
      }
    };
  
    const handleTogglePost = useCallback(() => {
      setShowPosts((prev) => !prev);
    }, []);
  
    const handleImageError = useCallback(() => {
      console.error("Erreur de chargement d'image");
      setImageError(true);
    }, []);
  
    const handleEdit = useCallback(() => {
      setIsEditing(true);
    }, []);
  
    const handleEditSubmit = async (updatedData: Partial<Synth>) => {
      const token = checkToken();
      if (!token) {
        router.push("/login");
        return;
      }
  
      try {
        await updateSynth(id, updatedData);
        toast.success("Mise à jour réussie");
        setIsEditing(false);
        if (onUpdateSuccess) onUpdateSuccess();
      } catch (error) {
        console.error("Erreur de mise à jour:", error);
        if (error instanceof Error && (error.message.includes("401") || error.message.includes("Token"))) {
          router.push("/login");
          return;
        }
        toast.error("Erreur lors de la mise à jour");
        setIsEditing(false);
      }
    };
  
    const handleDelete = useCallback(() => {
      console.log("Suppression du synthétiseur:", id);
    }, [id]);

   return (
    <article className="bg-white rounded-lg shadow-lg h-full w-full">
  <div className="flex flex-col h-full space-y-4 p-4">
               <CardImage 
                   image_url={image_url} 
                   title={fullTitle} 
                   onError={handleImageError}
               />
               
               <CardHeader 
                   title={fullTitle}
                   note={note}
                   nb_avis={nb_avis}
                   specifications={specifications}
               />
       
               <CardPricing 
                   price={price}
                   auctionPrice={getLatestAuctionPrice()}
                   onBid={handleCreateAuction}
                   isAuthenticated={isAuthenticated}
                   canBid={canBid}
                   isLoading={isAuctionLoading}
               />
       
               <PostList 
                   posts={posts}
                   showPosts={showPosts}
                   onToggle={handleTogglePost}
               />
       
               {userRoles?.includes("admin") && (
                   <CardActions 
                       onEdit={handleEdit}
                       onDelete={handleDelete}
                   />
               )}
           </div>

           {isEditing && (
               <SynthesiserDialog
                   isOpen={isEditing}
                   onOpenChange={setIsEditing}
                   synthetiser={synthetiser}
                   onSubmit={handleEditSubmit}
                   isUpdating={isUpdating}
                   updateError={updateError}
               />
           )}
       </article>
   );
};