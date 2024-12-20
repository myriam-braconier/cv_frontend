"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Synth } from "@/types";
import { PostList } from "./PostList";
import { Rating } from "./Rating";

interface SynthetiserCardProps {
	synthetiser: Synth;
	userRoles?: string[]; // Rendre userRoles optionnel
}

export const SynthetiserCard = ({
	synthetiser,
	userRoles = [],
}: SynthetiserCardProps) => {
	const [showPosts, setShowPosts] = useState(false);
	const [imageError, setImageError] = useState(false);

	const handleTogglePosts = useCallback(() => {
		setShowPosts((prev) => !prev);
	}, []);

	const handleImageError = useCallback(() => {
		setImageError(true);
	}, []);


  const handleEdit = useCallback(() => {
		console.log("Édition du synthétiseur:", synthetiser.id);
	}, [synthetiser.id]);

	const handleDelete = useCallback(() => {
		console.log("Suppression du synthétiseur:", synthetiser.id);
	}, [synthetiser.id]);




	// Protection contre les données manquantes
	if (!synthetiser) return null;

	const {
		image_url,
		marque,
		modele,
		note,
		nb_avis,
		specifications,
		auctionPrice,
		posts,
	} = synthetiser;

	const fullTitle = `${marque} ${modele}`;

	return (
		<article className="bg-white rounded-lg shadow-lg h-full w-full">
			<div className="p-4 flex flex-col h-full">
				{image_url && !imageError && (
					<div
						className="relative w-full h-[300px] mb-4"
						style={{
							height: "200px",
						}}
					>
						<Image
							src={image_url}
							alt={fullTitle}
							fill
							className="object-cover rounded-lg"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							// optimisation de l'image
							quality={90}
							loading="eager"
							priority
							onError={handleImageError}
						/>
					</div>
				)}

				{/* En-tête avec titre et notes */}
				<header className="flex justify-between items-start mb-4">
					<h2
						className="text-xl font-bold text-gray-900 truncate"
						title={fullTitle}
					>
						{fullTitle}
					</h2>
					<Rating note={note} nb_avis={nb_avis} />
				</header>

				{/* Spécifications */}
				{specifications && (
					<p
						className="text-gray-600 text-sm mb-4 line-clamp-3"
						title={specifications}
					>
						{specifications}
					</p>
				)}

				{/* Prix et boutons - toujours en bas */}
				<div className="mt-auto flex flex-col gap-4">
					{auctionPrice && (
						<div className="mb-4">
							<p className="text-xl font-bold text-blue-600">
								{new Intl.NumberFormat("fr-FR", {
									style: "currency",
									currency: "EUR",
									minimumFractionDigits: 0,
								}).format(auctionPrice)}
							</p>
						</div>
					)}

					<button
						onClick={handleTogglePosts}
						className="w-full bg-blue-500 text-white py-2 px-4 rounded
              hover:bg-blue-600 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
						type="button"
						aria-expanded={showPosts}
					>
						{showPosts
							? "Masquer les posts"
							: `Voir les posts (${posts?.length || 0})`}
					</button>
					{/* Liste des posts */}
					{showPosts && <PostList posts={posts || []} />}

					{/* Boutons d'administration - uniquement pour les admins */}
          
          {userRoles.includes("admin")  && (
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
		</article>
	);
};
