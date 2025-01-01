"use client";

import { useState } from "react";
import { api } from "@/services/axios";
import { API_URL } from '@/config/constants';
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

interface AddPostProps {
  synthetiserId: number;
  onPostAdded: () => void;
}

interface ApiError {
  message: string;
  status: number;
}


export function AddPost({ synthetiserId, onPostAdded }: AddPostProps) {
  const [titre, setTitre] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titre.trim() || !commentaire.trim()) {
      setError('Le titre et le commentaire sont requis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Récupérer le token du localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour ajouter un commentaire');
        toast.error('Veuillez vous connecter');
        return;
      }

      // Définir le header d'authentification
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Décoder le token pour obtenir l'ID de l'utilisateur
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      const response = await api.post(`${API_URL}/api/posts`, {
        titre: titre.trim(),
        commentaire: commentaire.trim(),
        synthetiserId,
        userId,
        type_contenu: 'texte',
        statut: 'publié'
      });

      if (response.status === 201) {
        toast.success('Commentaire ajouté avec succès');
        setTitre('');
        setCommentaire('');
        onPostAdded();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'ajout du commentaire';
      setError(errorMessage);
      toast.error(errorMessage);
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
          required
          minLength={3}
        />
      </div>
      <div>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Votre commentaire"
          className="w-full p-2 border rounded"
          rows={3}
          required
          minLength={10}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !titre.trim() || !commentaire.trim()}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Envoi en cours...' : 'Ajouter un commentaire'}
      </button>
    </form>
  );
}