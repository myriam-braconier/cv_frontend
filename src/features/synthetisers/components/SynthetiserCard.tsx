import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CardImage } from "@/features/synthetisers/components/card/CardImage";
import { CardHeader } from "@/features/synthetisers/components/card/CardHeader";
import CardPricing from "@/features/synthetisers/components/card/CardPricing";
import { CardActions } from "@/features/synthetisers/components/card/CardActions";
import { ListPost } from "@/features/synthetisers/components/list/ListMainPost";
import { EditorDialog } from "@/features/synthetisers/components/dialogs/EditorDialog";
import { useSynths } from "@/hooks/useSynths";
import { Synth } from "@/features/synthetisers/types/synth";

interface SynthetiserCardProps {
	synth: Synth;
	userRoles?: string[];
	onUpdateSuccess?: () => void;
	isAuthenticated: () => boolean;
}

export const SynthetiserCard = ({
	synth,
	userRoles = [],
	onUpdateSuccess,
}: SynthetiserCardProps) => {
	const [showPosts, setShowPosts] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const { updateSynth, isUpdating, updateError } = useSynths();

	const isAdmin = userRoles?.includes("admin");
	console.log("userRoles:", userRoles);
	console.log("isAdmin:", isAdmin);

	const {
		id,
		image_url,
		marque,
		modele,
		note,
		nb_avis,
		specifications,
		price,
		posts = [],
		auctionPrices = [],
	} = synth;

	const fullTitle = `${marque} ${modele}`;

	const isAuthenticated = useCallback(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const tokenData = JSON.parse(atob(token.split(".")[1]));
				console.log("tokenData:", tokenData); // Pour voir le rôle dans le token
				// Stockage de l'userId décodé
				localStorage.setItem("userId", tokenData.userId);
				return true;
			} catch (error) {
				console.error("Erreur de décodage du token:", error);
				return false;
			}
		}
		return false;
	}, []);

	const handleTogglePost = useCallback(() => setShowPosts((prev) => !prev), []);

	const handleImageError = useCallback(
		() => console.error("Erreur de chargement d'image"),
		[]
	);

	const handleEdit = useCallback(() => setIsEditing(true), []);

	const handleDelete = useCallback(async () => {
		if (!window.confirm(`Voulez-vous vraiment supprimer ${fullTitle} ?`)) {
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch(`/api/synthetisers/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					router.push("/login");
					return;
				}
				throw new Error(`Erreur ${response.status}`);
			}

			toast.success(`${fullTitle} supprimé avec succès`);
			if (onUpdateSuccess) onUpdateSuccess();
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			toast.error(`Erreur lors de la suppression de ${fullTitle}`);
		} finally {
			setIsLoading(false);
		}
	}, [id, fullTitle, router, onUpdateSuccess]);

	const handleEditSubmit = async (updatedData: Partial<Synth>) => {
		setIsLoading(true);
		try {
			await updateSynth(id, updatedData);
			toast.success("Mise à jour réussie");
			setIsEditing(false);
			if (onUpdateSuccess) onUpdateSuccess();
		} catch (error) {
			if (error instanceof Error && error.message.includes("401")) {
				router.push("/login");
				return;
			}
			toast.error("Erreur lors de la mise à jour");
		} finally {
			setIsLoading(false);
		}
	};

	// gestion des données utilisateur
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			const tokenData = JSON.parse(atob(token.split(".")[1]));
			localStorage.setItem("userId", tokenData.userId.toString());
		}
	}, []);

	console.log({
		token: localStorage.getItem("token"),
		userId: localStorage.getItem("userId"),
		price,
		auctionPrices,
	});

	// RENDU
	return (
		<article className="bg-white rounded-lg shadow-lg h-full w-full">
			<div className="flex flex-col h-full space-y-4 p-4">
				<div className="relative h-48 w-full">
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
					auctionPrices={auctionPrices}
					isAuthenticated={isAuthenticated}
					isLoading={isLoading}
					synthId={id.toString()}
					onUpdateSuccess={onUpdateSuccess}
				/>

				<ListPost
					posts={posts}
					showPosts={showPosts}
					onToggle={handleTogglePost}
					synthetiserId={synth.id} // Ajout de la prop manquante
				/>

				<CardActions
					onEdit={handleEdit}
					onDelete={handleDelete}
					isAdmin={isAdmin}
				/>
			</div>

			{isAdmin && (
				<EditorDialog
					isOpen={isEditing}
					onOpenChange={(open) => {
						setIsEditing(open);
						if (!open) router.refresh();
					}}
					synth={synth}
					onSubmit={handleEditSubmit}
					isLoading={isUpdating}
					error={updateError}
					onCancel={() => setIsEditing(false)}
					isAuthenticated={isAuthenticated}
				/>
			)}
			
		</article>
	);
};
