"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CardImage } from "@/features/synthetisers/components/card/CardImage";
import { CardHeader } from "@/features/synthetisers/components/card/CardHeader";
import { CardPricing } from "@/features/synthetisers/components/card/CardPricing";
import { CardActions } from "@/features/synthetisers/components/card/CardActions";
import { useSynths } from "@/hooks/useSynths";
import { Synth } from "@/features/synthetisers/types/synth";
import { PostList } from "@/features/synthetisers/components/posts/PostList";
import { EditorDialog } from "@/features/synthetisers/components/dialogs/EditorDialog";


interface AuctionPrice {
  proposal_price: number;
  status: string;
}

interface SynthetiserCardProps {
  synthetiser: Synth;
  userRoles?: string[];
  onUpdateSuccess?: () => void;
}

export const SynthetiserCard = ({ synthetiser, userRoles = [], onUpdateSuccess }: SynthetiserCardProps) => {



// Déstructuration des props
const { id, image_url, marque, modele, note, nb_avis, specifications, price, auctionPrices =[],  posts = [] } = synthetiser;



	// États
	const [showPosts, setShowPosts] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isAuctionLoading, setIsAuctionLoading] = useState(false);
	const [currentAuctionPrices, setCurrentAuctionPrices] = useState<AuctionPrice[]>(auctionPrices); // Utilisation de auctionPrices  
	// Router et Hooks
	const router = useRouter();
	const { updateSynth, isUpdating, updateError } = useSynths();

	const fullTitle = `${marque} ${modele}`;

  
	
  
	// Authentification
	const checkToken = useCallback(() => {
	  const token = localStorage.getItem("token");
	  if (!token) {
		console.error("Token d'authentification manquant");
		return null;
	  }
	  return token;
	}, []);
  
	const isAuthenticated = useCallback(() => !!localStorage.getItem("userId"), []);
  
	// Logique des enchères
	useEffect(() => {
	  const loadAuctions = async () => {
		
			if (!synthetiser?.id) return;

		
			const token = checkToken();
			if (!token) throw new Error("Non authentifié");
  

		try{
		  const response = await fetch(`/api/synthetisers/${synthetiser.id}/auctions`, {
			headers: {
			  Authorization: `Bearer ${token}`,
			  "Content-Type": "application/json",
			},
		  });
  
		  if (!response.ok) { throw new Error("Erreur de chargement des enchères");
		  };


		  const data = await response.json();
		  setCurrentAuctionPrices(data);
		} catch (error) {
		  console.error("Erreur:", error);
		}
	  };
  
	  loadAuctions();
	}, [synthetiser?.id, checkToken]);
  
	const getLatestAuctionPrice = useCallback((): AuctionPrice | null => {
	  if (!currentAuctionPrices.length) return null;
	  return currentAuctionPrices.reduce((prev, current) => 
		prev.proposal_price > current.proposal_price ? prev : current
	  );
	}, [currentAuctionPrices]);
  
	const canBid = useCallback(() => {
	  if (!isAuthenticated()) return false;
	  const latestAuction = getLatestAuctionPrice();
	  if (!latestAuction) return true;
	  return latestAuction.status !== "active";
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

		 const basePrice = latestAuction?.proposal_price || 
      (typeof price === "object" ? price.value : price);
  
		const response = await fetch(`/synthetisers/${synthetiser.id}/auctions`, {
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
  
		if (!response.ok) throw new Error("Erreur lors de la création de l'enchère");
  
		const newAuction = await response.json();
		setCurrentAuctionPrices([newAuction, ...auctionPrices]); 
		toast.success("Enchère créée avec succès");
		if (onUpdateSuccess) onUpdateSuccess();
	  } catch (error) {
		toast.error(error instanceof Error ? error.message : "Erreur lors de la création de l'enchère");
	  } finally {
		setIsAuctionLoading(false);
	  }
	};
  
	// Handlers pour les autres fonctionnalités
	const handleTogglePost = useCallback(() => setShowPosts(prev => !prev), []);
	const handleImageError = useCallback(() => console.error("Erreur de chargement d'image"), []);
	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleDelete = useCallback(() => console.log("Suppression du synthétiseur:", id), [id]);
  
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
		if (error instanceof Error && (error.message.includes("401") || error.message.includes("Token"))) {
		  router.push("/login");
		  return;
		}
		toast.error("Erreur lors de la mise à jour");
		setIsEditing(false);
	  }
	};
  
	

  
  return (
		
	<article className="bg-white rounded-lg shadow-lg h-full w-full">
	
		<div className="flex flex-col h-full space-y-4 p-4">
			<div
				className="relative h-[200px]" // Ajout d'une hauteur fixe et position relative
				style={{
					width: "100%", // Largeur à 100%
				}}
			>
				<CardImage
					image_url={image_url}
					title={fullTitle}
					onError={handleImageError}
				/>
			</div>
			<CardHeader
				title={fullTitle}
				note={note}
				nb_avis={nb_avis}
				specifications={specifications}
			/>

			<CardPricing
				price={price}
				auctionPrices={currentAuctionPrices}
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
				<CardActions onEdit={handleEdit} onDelete={handleDelete} />
			)}

		</div>

		
		<EditorDialog
isOpen={isEditing}
onOpenChange={(open) => {
setIsEditing(open);
if (!open) router.refresh();
}}
synthetiser={synthetiser}
onSubmit={handleEditSubmit}
isUpdating={isUpdating}
updateError={updateError}

/>
		
	</article>
);
  



};

	

