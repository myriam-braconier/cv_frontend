import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CardImage } from "@/features/synthetisers/components/card/CardImage";
import { CardHeader } from "@/features/synthetisers/components/card/CardHeader";
import CardPricing from "@/features/synthetisers/components/card/CardPricing";
import { CardActions } from "@/features/synthetisers/components/card/CardActions";
import { CardPost } from "@/features/synthetisers/components/card/CardPost";
import { EditorDialog } from "@/features/synthetisers/components/dialogs/EditorDialog";
import { Synth, Post } from "@/features/synthetisers/types/synth";
import { DuplicateSynthDialog } from "@/features/synthetisers/components/dialogs/DuplicateSynthDialog";


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
	isAuthenticated,
}: SynthetiserCardProps) => {
	const [showPosts, setShowPosts] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	// Ici on initialise localposts avec les posts du synthetiseur
	const [localPosts, setLocalPosts] = useState<Post[]>(synth.posts || []);
	const [updateError, setUpdateError] = useState<string | null>(null);
	const router = useRouter();



	const isAdmin = useMemo(() => {
		return userRoles.includes("admin");
	}, [userRoles]);

	const {
		id,
		image_url,
		marque,
		modele,
		note,
		nb_avis,
		specifications,
		price,
		// on supprime posts=[] car localposts est initialisé
		auctionPrices = [],
	} = synth;

	const fullTitle = `${marque} ${modele}`;

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
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return;
			}

			const response = await fetch(`/api/synthetisers/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
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
			router.refresh(); // on rafraichit d'abord les données
			if (onUpdateSuccess) onUpdateSuccess(); // on met à jour le parent
			
			router.replace("/synthetisers"); // Redirection via replace ua lieu de push cela évite l'ajout dans l'historique
		
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			toast.error(`Erreur lors de la suppression de ${fullTitle}`);
		} finally {
			setIsLoading(false);
		}
	}, [id, fullTitle, router, onUpdateSuccess]);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await fetch(`/api/posts?synthetiserId=${id}`);
				if (!response.ok)
					throw new Error("Erreur lors du chargement des posts");
				const data = await response.json();
				setLocalPosts(data);
			} catch (error) {
				console.error("Erreur lors du chargement des posts:", error);
			}
		};

		if (id) {
			fetchPosts();
		}
	}, [id]);

	// RENDU
	return (
		<article className="bg-white rounded-lg shadow-lg h-full w-full">
			<div className="flex flex-col h-full space-y-4 p-4">
				{/* Image */}
				<div className="relative h-48 w-full">
					<CardImage
						image_url={image_url}
						title={fullTitle}
						onError={handleImageError}
					/>
				</div>

				{/* Informations */}
				<CardHeader
					title={fullTitle}
					note={note}
					nb_avis={nb_avis}
					specifications={specifications}
				/>

				{/* Prix */}
				<CardPricing
					price={price}
					auctionPrices={auctionPrices}
					isAuthenticated={isAuthenticated}
					isLoading={isLoading}
					synthId={id.toString()}
					onUpdateSuccess={onUpdateSuccess}
				/>

				{/* Actions admin */}
				{isAdmin && (
					<div className="flex justify-end space-x-2">
						<CardActions
							onEdit={handleEdit}
							onDelete={handleDelete}
							isAdmin={isAdmin}
						/>
						<DuplicateSynthDialog
							originalSynth={synth}
							onSuccess={() => {
								if (onUpdateSuccess) {
									onUpdateSuccess();
								}
								router.refresh();
								toast.success("Synthétiseur dupliqué avec succès");
							}}
						/>
					</div>
				)}

				{/* Posts */}
				<CardPost
					posts={localPosts}
					showPosts={showPosts}
					onToggle={handleTogglePost}
					synthetiserId={synth.id}
				/>
			</div>

			{/* Dialogs */}
			{isAdmin && (
				<EditorDialog
					isOpen={isEditing}
					onOpenChange={(open) => {
						setIsEditing(open);
						if (!open) router.refresh();
					}}
					synth={synth}
					onSubmit={async (data) => {
						try {
							await fetch(`/api/synthetisers/${id}`, {
								method: "PUT",
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${localStorage.getItem("token")}`,
								},
								body: JSON.stringify(data),
							});
							router.refresh();
							setIsEditing(false);
							setUpdateError(null);
							toast.success("Synthétiseur mis à jour avec succès");
						} catch (error) {
							const errorMessage =
								error instanceof Error
									? error.message
									: "Erreur lors de la mise à jour";
							setUpdateError(errorMessage);
							toast.error(errorMessage);
						}
					}}
					isLoading={isLoading}
					error={updateError}
					onCancel={() => setIsEditing(false)}
					isAuthenticated={isAuthenticated}
				/>
			)}
		</article>
	);
};
