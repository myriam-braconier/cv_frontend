"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { PostList } from "./PostList";
import { Rating } from "./Rating";
import Link from "next/link";
import { useSynths } from "@/features/synthetisers/hooks/useSynths";
import { SynthesizerDialog } from "@/features/synthetisers/components/synthetiser-dialog";
import { Synth, Post } from "@/types/synth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface SynthetiserCardProps {
		synthetiser: Synth;
		userRoles?: string[];
		onUpdateSuccess?: () => void;
}

export const SynthetiserCard = ({
	synthetiser, // récupération de la prop synthetiser
	userRoles = [],
	onUpdateSuccess,
}: SynthetiserCardProps) => {
	// déstructuration après avoir récupéré la prop
	const {
		image_url,
		marque,
		modele,
		note,
		nb_avis,
		specifications,
		price,
		auctionPrices = [],
		posts,
	} = synthetiser;

	const router = useRouter();
	const [showPosts, setShowPosts] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const { updateSynth, isUpdating, updateError } = useSynths();

	const checkToken = () => {
		const token = localStorage.getItem("token");
		if (!token) {
			console.error("Token d'authentification manquant");
			return false;
		}
		return token;
	};

	const handleTogglePost = useCallback(() => {
		setShowPosts((prev) => !prev);
	}, []);

	const handleImageError = useCallback(() => {
		console.log("Erreur de chargement d'image");
		setImageError(true);
	}, []);

	const handleEdit = useCallback(() => {
		setIsEditing(true);
	}, []);

	const handleEditSubmit = async (updatedData: Partial<Synth>) => {
		console.log("📝 Début de la soumission:", updatedData);
		try {
			const token = checkToken();
			if (!token) {
				router.push("/login");
				return;
			}

			console.log("🔑 Token vérifié:", {
				exists: true,
				preview: `${token.substring(0, 10)}...`,
			});

			console.log("📤 Données envoyées:", {
				id: synthetiser.id,
				data: JSON.stringify(updatedData, null, 2),
			});

			await updateSynth(synthetiser.id, updatedData);

			toast.success("Mise à jour réussie");
			setIsEditing(false);

			if (onUpdateSuccess) {
				onUpdateSuccess();
			}
			toast.success("Mise à jour réussie");
		} catch (error) {
			console.error("❌ Erreur:", error);

			if (error instanceof Error) {
				if (error.message.includes("401") || error.message.includes("Token")) {
					router.push("/login");
					return;
				}
			}

			setIsEditing(false);
		}
	};

	const handleDelete = useCallback(() => {
		console.log("Suppression du synthétiseur:", synthetiser.id);
	}, [synthetiser.id]);

	if (!synthetiser) return null;

	// Logging avec vérification
	console.log("Prix:", price);
	console.log("Type de price:", typeof price);
	console.log("auctionPrices:", auctionPrices);

	const fullTitle = `${marque} ${modele}`;

	// Conversion sécurisée du prix
	const formatPrice = (price: number | string | null | undefined): string  => {
		if (!price) return "Prix non défini";
		
		const numericPrice = typeof price === 'string' 
		? parseFloat(price) 
		: price;
		
		if (isNaN(numericPrice)) return "Prix invalide";
	  
		return new Intl.NumberFormat("fr-FR", {
		  style: "currency",
		  currency: "EUR",
		  minimumFractionDigits: 0,
		}).format(numericPrice);
	  };

	return (
		<>
			<article className="bg-white rounded-lg shadow-lg h-full w-full">
				<div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="border border-black flex flex-col h-full mx-3">
						<Link href={`/synthetisers/${synthetiser.id}`}>
							{/* Image section */}
							{image_url && !imageError && (
								<div
									className="relative h-[200px] mb-4 mx-4"
									style={{ height: "100px" }}
								>
									<Image
										src={image_url}
										alt={fullTitle}
										fill
										className="object-cover rounded-lg"
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										quality={75}
										loading="eager"
										priority
										onError={handleImageError}
									/>
								</div>
							)}

							{/* Header section */}
							<header className="flex justify-between items-start mb-4 px-3">
								<h2
									className="text-xl font-bold text-gray-900 truncate"
									title={fullTitle}
								>
									{fullTitle}
								</h2>
								<Rating note={note} nb_avis={nb_avis} />
							</header>

							{/* Specifications */}
							{specifications && (
								<p
									className="text-gray-600 text-sm mb-4 line-clamp-3 px-3"
									title={specifications}
								>
									{specifications}
								</p>
							)}
						</Link>

						{/* Prix et enchères */}
						<div className="flex justify-between items-center px-3 mb-4">
							{/* section prix */}
							<div>
								<label>
									<h6>Prix initial</h6>
								</label>
								<p className="text-xl font-bold text-blue-600">
									{formatPrice(price)}
								</p>
							</div>

							{/* Bouton enchérir */}
							<div className="ml-4">
								<button
									onClick={async () => {
										const token = checkToken();
										if (!token) {
											router.push("/login");
											return;
										}

										try {
											const userId = localStorage.getItem("userId");
											const response = await fetch("/api/synth-auctions", {
												method: "POST",
												headers: {
													"Content-Type": "application/json",
													Authorization: `Bearer ${token}`,
												},
												body: JSON.stringify({
													proposal_price: Number(price) + 100,
													synthetiserId: synthetiser.id,
													userId: userId,
													status: "active",
												}),
											});

											if (!response.ok) {
												const errorData = await response.json();
												throw new Error(
													errorData.message ||
														"Erreur lors de la création de l'enchère"
												);
											}

											const newAuction = await response.json();
											if (newAuction.status === "active") {
												toast.success(
													"Votre enchère a été placée avec succès !"
												);
											} else if (newAuction.status === "outbid") {
												toast.warning("Une enchère plus élevée existe déjà !");
											}

											if (onUpdateSuccess) {
												onUpdateSuccess();
											}
										} catch (error) {
											console.error("Erreur:", error);
											if (error instanceof Error) {
												toast.error(
													error.message ||
														"Erreur lors de la création de l'enchère"
												);
											} else {
												toast.error("Erreur lors de la création de l'enchère");
											}
										}
									}}
									className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
								>
									Enchérir (+100€)
								</button>
							</div>
						</div>

						{/* Posts et boutons admin */}
						<div className="mt-auto p-4">
							<button
								onClick={handleTogglePost}
								className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
								type="button"
								aria-expanded={showPosts}
							>
								{showPosts
									? "Masquer les posts"
									: `Voir les posts (${posts?.length || 0})`}
							</button>

							{showPosts && <PostList posts={posts as Post[]} />}

							{userRoles.includes("admin") && (
								<div className="flex gap-2 mt-4 w-full">
									<button
										onClick={handleEdit}
										className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
									>
										Éditer
									</button>
									<button
										onClick={handleDelete}
										className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
									>
										Supprimer
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</article>

			{isEditing && (
				<SynthesizerDialog
					isOpen={isEditing}
					onOpenChange={setIsEditing}
					synthetiser={synthetiser}
					onSubmit={handleEditSubmit}
					isUpdating={isUpdating}
					updateError={updateError}
				/>
			)}
		</>
	);
};
