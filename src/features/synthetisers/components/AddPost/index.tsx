"use client";

import { useState } from "react";
import { api } from "@/services/axios";
import { AxiosError } from "axios";

interface AddPostProps {
    synthetiserId: number;
    onPostAdded: () => void;
}

interface ApiError {
    error: string;
    details: string;
}


export const AddPost = ({ synthetiserId, onPostAdded }: AddPostProps) => {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await api.post(`/api/synthetisers/${synthetiserId}/posts`, { content });
            setContent("");
            onPostAdded(); // Rafraîchit la liste des posts
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            setError(  axiosError.response?.data?.error || 
                "Une erreur est survenue lors de l'ajout du post"
);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label 
                        htmlFor="content" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Nouveau post
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Écrivez votre post ici..."
                        disabled={isLoading}
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !content.trim()}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors duration-200"
                >
                    {isLoading ? "Envoi en cours..." : "Ajouter le post"}
                </button>
            </form>
        </div>
    );
};