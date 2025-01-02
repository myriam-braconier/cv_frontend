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


interface SynthetiserCardProps {
	synth: Synth;
	userRoles?: string[];
	onUpdateSuccess?: () => void;
	isAuthenticated: () => boolean;
	hasAdminRole?: boolean;
}

export const SynthetiserCard = ({
	synth,
	onUpdateSuccess,
	hasAdminRole,
}: SynthetiserCardProps) => {
	const [showPosts, setShowPosts] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [localPosts, setLocalPosts] = useState<Post[]>(synth.posts || []);
	const [isDuplicating, setIsDuplicating] = useState(false);

	const router = useRouter();

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

	// Vérification du role de l'utilisateur
	const checkUserRole = useCallback(() => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				return false;
			}
	
			// Décodage du token
			const payload = JSON.parse(atob(token.split('.')[1]));
			
			// Vérification du rôle (admin ou rôles spécifiques)
			return payload.role === 'admin' || payload.roleId === 1 || payload.roleId === 2;
		} catch (error) {
			console.error("Erreur lors de la vérification du rôle:", error);
			return false;
		}
	}, []);
	
	

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
				console.error('Erreur détaillée:', data);
				if (response.status === 401) {
					localStorage.removeItem("token");
					router.push("/login");
					return;
				}
				throw new Error(`Erreur ${response.status}: ${data.error || data.message}`);
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
			const payload = JSON.parse(atob(token.split('.')[1]));
			const isAdmin = payload.role === 'admin' || payload.roleId === 1 || payload.roleId === 2;
	
			if (!isAdmin) {
				toast.error("Accès non autorisé");
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
		const token = localStorage.getItem('token');
		return !!token;
	};

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await fetch(
					`${API_URL}/api/posts?synthetiserId=${id}`
				);
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

	// pour vérification du role de l'utilisateur
	// Plus bas dans le code, dans le hook useEffect
	useEffect(() => {
		const verifyAccess = async () => {
			if (!checkUserRole()) {
				toast.error("Accès non autorisé");
				router.push('/login');
			}
		};
	
		verifyAccess();
	}, [checkUserRole, router]);

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
					isAdmin={checkUserRole()}
				/>

				{/* Posts */}
				<CardPost
					posts={localPosts}
					showPosts={showPosts}
					onToggle={handleTogglePost}
					synthetiserId={synth.id}
				/>

				{/* Actions admin */}
				{checkUserRole() && (
					<div className="mt-4">
						<CardActions
							onEdit={handleEdit}
							onDelete={handleDelete}
							onDuplicate={handleDuplicate}
							isLoading={isLoading}
							isAdmin={true}
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
								isAdmin={true}
							/>
						)}

						{isDuplicating && (
							<DuplicateSynthDialog
							isOpen={isDuplicating}
							onOpenChange={setIsDuplicating}
							synth={synth}
							onClose={() => setIsDuplicating(false)}
							onSuccess={onUpdateSuccess}
							originalSynth={synth}
							isAdmin={true}
							/>
						)}
					</div>
				)}
			</div>
		</article>
	);

};
