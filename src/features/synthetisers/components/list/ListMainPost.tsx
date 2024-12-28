"use client";
import { memo, useState, useEffect } from "react";
import { Post } from "@/features/synthetisers/types/synth";
import { AddPost } from "../posts/AddPost";
import Link from "next/link";

interface ListPostProps {
	posts?: Post[];
	showPosts: boolean;
	onToggle: () => void;
	synthetiserId: number;
}

export const ListPost = memo(function ListPost({
	posts = [],
	synthetiserId,
	onToggle,
	showPosts,
}: ListPostProps) {
	const handlePostAdded = async () => {
		try {
			// Attendre la réponse de l'API
			const response = await fetch(`/api/posts?synthetiserId=${synthetiserId}`);
			const updatedPosts = await response.json();
			onToggle();
			// Mettre à jour l'état local avec les nouveaux posts
		} catch (error) {
			console.error("Erreur lors de la mise à jour des posts:", error);
		}
	};

	// RENDYU

	return (
		<div className="mt-4 space-y-4 divide-y divide-gray-200">
			<button 
        onClick={onToggle}
        className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 flex items-center justify-between"
      >
        <span>Posts ({posts?.length || 0})</span>
        <span>{showPosts ? '▼' : '▶'}</span>
      </button>
      {showPosts && (
        <>
          {posts && posts.length > 0 ? (
            posts.map((post) => (

							<div key={post.id} className="pt-4">
								{post.titre && (
									<h3 className="font-semibold text-gray-900">{post.titre}</h3>
								)}
								{post.commentaire && (
									<p className="mt-1 text-gray-600 text-sm">
										{post.commentaire}
									</p>
								)}
								{post.url_contenu && (
									<Link
										href={post.url_contenu}
										className="mt-2 inline-flex items-center text-sm text-blue-500 hover:text-blue-700"
										target="_blank"
										rel="noopener noreferrer"
									>
										Voir le contenu
									</Link>
								)}
								<span className="block mt-2 text-sm text-gray-500">
									Statut: {post.statut}
								</span>
							</div>
						))
					) : (
						<p>Aucun post pour le moment</p>
					)}

					<AddPost
						synthetiserId={synthetiserId}
						onPostAdded={handlePostAdded}
					/>
				</>
			)}
		</div>
	);
});

export default ListPost;
