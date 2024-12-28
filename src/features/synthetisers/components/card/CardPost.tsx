"use client";

import { memo } from "react";
import { Post } from "@/features/synthetisers/types/synth";
import Link from "next/link";
import { api } from "@/services/axios";
import { useState } from "react";

interface PostListProps {
  posts?: Post[];
  showPosts: boolean;
  onToggle: () => void;
}

interface AddPostProps {
    synthetiserId: number;
    onPostAdded: () => void;
  }


  export function AddPost({ synthetiserId, onPostAdded }: AddPostProps) {
    const [titre, setTitre] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
  
      try {
        const userResponse = await api.get('/auth/me');
        const userId = userResponse.data.id;
  
        await api.post('/api/posts', {
          titre,
          commentaire,
          synthetiserId,
          userId,
          type_contenu: 'texte',
          statut: 'publié'
        });
  
        setTitre('');
        setCommentaire('');
        onPostAdded();
      } catch (error) {
        setError('Erreur lors de l\'ajout du post');
        console.error('Erreur détaillée:', error);
      } finally {
        setIsLoading(false);
      }
    };








// Composant qui affiche la liste des posts et leurs commentaires associés
const PostList = memo(function PostList({ posts = [] }: PostListProps) {
  // Si aucun post n'existe, ne rien afficher
  if (!posts?.length) return null;

  return (
    <div className="mt-4 space-y-4 divide-y divide-gray-200">
      {posts.map((post) => (
        <div key={post.id} className="pt-4">
          {/* Affichage du titre du post s'il existe */}
          {post.titre && (
            <h3 className="font-semibold text-gray-900">{post.titre}</h3>
          )}
          
          {/* Affichage du commentaire s'il existe */}
          {post.commentaire && (
            <p className="mt-1 text-gray-600 text-sm">{post.commentaire}</p>
          )}
          
          {/* Lien vers le contenu supplémentaire si disponible */}
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
          
          {/* Affichage du statut du post */}
          <span className="block mt-2 text-sm text-gray-500">
            Statut: {post.statut}
          </span>
        </div>
      ))}
    </div>

    


  );
});

export default PostList;
