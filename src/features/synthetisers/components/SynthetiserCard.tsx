import { useState, useCallback, useEffect } from "react";
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
import { API_URL } from "@/config/constants";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@components/PermissionGuard";
import { generateBackground } from '@/services/imageGeneration';

interface SynthetiserCardProps {
	synth: Synth;
	userRoles?: string[];
	onUpdateSuccess?: () => void;
	isAuthenticated: () => boolean;
}

export const SynthetiserCard = ({
	synth,
	onUpdateSuccess,
}: SynthetiserCardProps) => {
	const [showPosts, setShowPosts] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [postsLoading, setPostsLoading] = useState(false);
	const [postsError, setPostsError] = useState<string | null>(null);
	const [localPosts, setLocalPosts] = useState<Post[]>(synth.posts || []);
	const [isDuplicating, setIsDuplicating] = useState(false);
	const { hasPermission } = usePermissions();
	const router = useRouter();
	const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
	

	const {
		id,
		image_url,
		marque,
		modele,
		note,
		nb_avis,
		specifications,
		price,
		auctionPrices = [],
	} = synth;

	const fullTitle = `${marque} ${modele}`;

	// Fetch posts with proper error handling and loading states
	useEffect(() => {
		const fetchPosts = async () => {
			if (!id) return;

			setPostsLoading(true);
			setPostsError(null);

			try {
				const token = localStorage.getItem("token");
				if (!token) {
					throw new Error("No authentication token found");
				}

				const response = await fetch(
					`${API_URL}/api/posts?synthetiserId=${id}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}
				);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch posts: ${response.status} ${response.statusText}`
					);
				}

				const data = await response.json();
				setLocalPosts(data);
			} catch (error) {
				console.error("Error fetching posts:", error);
				setPostsError(
					error instanceof Error ? error.message : "Failed to load posts"
				);
				toast.error("Failed to load posts");
			} finally {
				setPostsLoading(false);
			}
		};

		if (showPosts) {
			fetchPosts();
		}
	}, [id, showPosts]);

	const handleTogglePost = useCallback(() => setShowPosts((prev) => !prev), []);
	const handleImageError = useCallback(
		() => console.error("Erreur de chargement d'image"),
		[]
	);
	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleCloseEditor = useCallback(() => setIsEditing(false), []);

	const handleDelete = useCallback(async () => {
		// Vérification de la confirmation
		if (!window.confirm(`Voulez-vous vraiment supprimer ${fullTitle} ?`)) {
			return;
		}

		setIsLoading(true);

		try {
			// Vérification du token
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return;
			}

			// Appel API
			const response = await fetch(`${API_URL}/api/synthetisers/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			// Ajouter ceci pour debug
			const data = await response.json();
			if (!response.ok) {
				console.error("Erreur détaillée:", data);
				if (response.status === 401) {
					localStorage.removeItem("token");
					router.push("/login");
					return;
				}
				throw new Error(
					`Erreur ${response.status}: ${data.error || data.message}`
				);
			}

			// Gestion des réponses
			if (!response.ok) {
				if (response.status === 401) {
					localStorage.removeItem("token");
					router.push("/login");
					return;
				}
				throw new Error(`Erreur ${response.status}`);
			}

			// Succès
			toast.success(`${fullTitle} supprimé avec succès`);

			// Mise à jour et redirection
			if (onUpdateSuccess) {
				await onUpdateSuccess();
			}

			router.refresh();
			router.replace("/synthetisers");
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			toast.error(`Erreur lors de la suppression de ${fullTitle}`);
		} finally {
			setIsLoading(false);
		}
	}, [id, fullTitle, router, onUpdateSuccess]);

	const handleDuplicate = useCallback(async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				toast.error("Session expirée");
				router.push("/login");
				return;
			}

			// Décodage direct du token
			const payload = JSON.parse(atob(token.split(".")[1]));
			// Vérifier si c'est un admin (rôle 2) uniquement
			const isAdmin = payload.roleId === 2;

			if (!isAdmin) {
				toast.error("Accès non autorisé - Action réservée aux administrateurs");
				return;
			}

			setIsDuplicating(true);
		} catch (error: unknown) {
			console.error("Erreur:", error);
			toast.error("Erreur lors de la duplication");
		}
	}, [router]);

	const handleSubmit = useCallback(
		async (data: Partial<Synth>) => {
			try {
				const response = await fetch(`${API_URL}/api/synthetisers/${id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify(data),
				});

				if (!response.ok) throw new Error();

				toast.success("Synthétiseur mis à jour");
				if (onUpdateSuccess) onUpdateSuccess();
				setIsEditing(false);
			} catch {
				toast.error("Erreur lors de la mise à jour");
			}
		},
		[id, onUpdateSuccess]
	);

	const isAuthenticated = () => {
		const token = localStorage.getItem("token");
		return !!token;
	};



useEffect(() => {
	const loadBackground = async () => {
	  const imageData = await generateBackground(`synthesizer ${marque} ${modele}`);
	  if (imageData) {
		setBackgroundImage(imageData);
	  }
	};
	loadBackground();
  }, [marque, modele]);


	// RENDU
	return (
		<article className="bg-orange-600/60 rounded-lg shadow-lg h-full w-full backdrop-blur-2xl border-2 border-blue-800"
		style={{backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined}}>
			<div className="flex flex-col h-full space-y-4 p-4">
				{/* Image */}
				<PermissionGuard permissions={["synths:read"]}>
					<div className="relative h-48 w-full">
						<CardImage
							image_url={image_url}
							title={fullTitle}
							onError={handleImageError}
						/>
					</div>
				</PermissionGuard>

				{/* Informations */}
				<PermissionGuard permissions={["synths:read"]}>
					<CardHeader
						title={fullTitle}
						note={note}
						nb_avis={nb_avis}
						specifications={specifications}
					/>
				</PermissionGuard>

				{/* Prix */}
				<PermissionGuard permissions={["synths:read"]}>
					<CardPricing
						price={price}
						auctionPrices={auctionPrices}
						isAuthenticated={isAuthenticated}
						isLoading={isLoading}
						synthId={id.toString()}
						onUpdateSuccess={onUpdateSuccess}
						isAdmin={hasPermission("synths:update")}
					/>
				</PermissionGuard>

					{/* Posts */}
					<PermissionGuard permissions={["synths:read"]}>
					<CardPost
						posts={localPosts}
						showPosts={showPosts}
						onToggle={handleTogglePost}
						synthetiserId={synth.id}
						isLoading={postsLoading}
						error={postsError}
						onPostsUpdate={setLocalPosts}
					/>
				</PermissionGuard>

				{/* Actions d'édition*/}
				<PermissionGuard
					permissions={["synths:update", "synths:delete"]}
					type="any"
				>
					<div className="mt-4">
						<CardActions
							onEdit={handleEdit}
							onDelete={handleDelete}
							onDuplicate={handleDuplicate}
							isLoading={isLoading}
							isAdmin={hasPermission("synths:delete")}
							originalSynth={synth}
						/>

						{isEditing && (
							<EditorDialog
								isOpen={isEditing}
								onOpenChange={setIsEditing}
								synth={synth}
								onSubmit={handleSubmit}
								onCancel={handleCloseEditor}
								onClose={handleCloseEditor}
								error={null}
								isLoading={isLoading}
								isAuthenticated={isAuthenticated}
								isAdmin={hasPermission("synths:update")}
							/>
						)}

						{isDuplicating && (
							<DuplicateSynthDialog
								isOpen={isDuplicating}
								onOpenChange={setIsDuplicating}
								onClose={() => setIsDuplicating(false)}
								onSuccess={onUpdateSuccess}
								originalSynth={synth}
								isAdmin={hasPermission("synths:update")}
							/>
						)}
					</div>
				</PermissionGuard>
			</div>
		</article>
	);
};
