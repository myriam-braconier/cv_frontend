"use client";
import { memo } from "react";
import { Post } from "@/features/synthetisers/types/synth";
import { AddPost } from "../posts/AddPost";
import Link from "next/link";

import { API_URL } from '@/config/constants';


interface CardPostProps {
  posts?: Post[];
  showPosts: boolean;
  onToggle: () => void;
  synthetiserId: number;
}

export const CardPost = memo(({ 
  posts = [], 
  showPosts,
  onToggle,
  synthetiserId 
}: CardPostProps) => {
  const filteredPosts = posts.filter(post => post.synthetiserId === synthetiserId);

  const handlePostAdded = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts?synthetiserId=${synthetiserId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des posts');
      }
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la mise à jour des posts:", error);
    }
  };

  return (
    <div className="mt-4 space-y-4 divide-y divide-gray-200">
      <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
        <span className="text-gray-700 font-medium">
          Posts ({filteredPosts.length})
        </span>
        <button 
          onClick={onToggle}
          className="px-3 py-1 text-sm text-black  hover:bg-pink-200 rounded-full transition-colors"
        >
          {showPosts ? 'Masquer les posts ▼' : 'Voir les posts ▶'}
        </button>
      </div>

      {showPosts && (
        <>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="pt-4">
                {post.titre && (
                  <h3 className="font-semibold text-gray-900">{post.titre}</h3>
                )}
                {post.commentaire && (
                  <p className="mt-1 text-gray-600 text-sm">{post.commentaire}</p>
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

CardPost.displayName = 'CardPost';

export default CardPost;
