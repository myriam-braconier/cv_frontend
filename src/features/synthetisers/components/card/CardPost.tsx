"use client";
import { memo } from "react";
import { Post } from "@/features/synthetisers/types/synth";
import { AddPost } from "../posts/AddPost";
import Link from "next/link";

import { toast } from "react-hot-toast";

interface CardPostProps {
  posts?: Post[];
  showPosts: boolean;
  onToggle: () => void;
  synthetiserId: number;
  isLoading?: boolean;
  error?: string | null;
  onPostsUpdate?: (newPosts: Post[]) => void;  
}
// destructuration des props
export const CardPost = memo(
  ({ 
    posts = [], 
    showPosts, 
    onToggle, 
    synthetiserId,
    isLoading,
    error ,
	onPostsUpdate  
  }: CardPostProps) => {
    const filteredPosts = posts.filter((post) => {
      const postSynthId = Number(post.synthetiserId);
      const targetSynthId = Number(synthetiserId);
      return postSynthId === targetSynthId;
    });

	const handlePostAdded = async () => {
		try {
		  const response = await fetch(
			`/api/posts?synthetiserId=${synthetiserId}`,
			{
			  headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				"Content-Type": "application/json",
			  },
			}
		  );
		  if (!response.ok) {
			throw new Error("Erreur lors de la récupération des posts");
		  }
		  const newData = await response.json();
		  // Au lieu de recharger la page, on met à jour les données
		  if (onPostsUpdate) {
			onPostsUpdate(newData);
		  }
		} catch (error) {
		  console.error("Erreur lors de la mise à jour des posts:", error);
		  toast.error("Erreur lors de la mise à jour des posts");
		}
	  };

    const renderContent = () => {
      if (error) {
        return (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            <p>{error}</p>
          </div>
        );
      }

      if (isLoading) {
        return (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        );
      }

      if (filteredPosts.length === 0) {
        return <p className="p-4 text-gray-500">Aucun post pour le moment</p>;
      }

      return filteredPosts.map((post) => (
        <div key={post.id} className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {post.author?.username?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <span className="font-medium text-sm text-gray-900">
                {post.author?.username || "Utilisateur inconnu"}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : "Date inconnue"}
              </span>
            </div>
          </div>

          {post.titre && (
            <h3 className="font-semibold text-gray-900">
              {post.titre}
            </h3>
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
      ));
    };

    return (
      <div className="mt-4 space-y-4 divide-y divide-gray-200">
        <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
          <span className="text-gray-700 font-medium">
            Posts ({filteredPosts.length})
          </span>


          <button
            onClick={onToggle}
            className="px-3 py-1 text-sm text-black hover:bg-pink-200 rounded-full transition-colors"
            disabled={isLoading}
          >
            {showPosts ? "Masquer les posts ▼" : "Voir les posts ▶"}
          </button>

        </div>

        {showPosts && (
          <>
            <div className="space-y-4">
              {renderContent()}
            </div>
            {!isLoading && !error && (
              <AddPost
                synthetiserId={synthetiserId}
                onPostAdded={handlePostAdded}
              />
            )}
          </>
        )}
      </div>
    );
  }
);

CardPost.displayName = "CardPost";

export default CardPost;