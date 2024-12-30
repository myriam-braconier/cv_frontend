"use client";
import { useState } from "react";
import { api } from "@/services/axios";
import { API_URL } from '@/config/constants';

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
      const userResponse = await api.get(`${API_URL}/auth/me`);
      const userId = userResponse.data.id;

      await api.post(`${API_URL}/api/posts`, {
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

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <div>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre du commentaire"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Votre commentaire"
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Envoi en cours...' : 'Ajouter un commentaire'}
      </button>
    </form>
  );
}
