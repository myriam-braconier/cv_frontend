// Dans AddPost.tsx
"use client";
import { useState } from 'react';
import { api } from '@/services/axios';

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
            // D'abord, récupérer l'userId
            const userResponse = await api.get('/auth/me');
            const userId = userResponse.data.id; // Assurez-vous que c'est le bon chemin pour l'ID

            // Créer le post avec l'userId
            await api.post('/api/posts', {
                titre,
                commentaire,
                synthetiserId,
                userId, // Ajout de l'userId
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input
                    type="text"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Titre"
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Commentaire"
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {isLoading ? 'Ajout en cours...' : 'Ajouter un post'}
            </button>
        </form>
    );
}