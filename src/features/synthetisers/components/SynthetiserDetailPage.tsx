"use client";

import { useEffect, useState, useCallback } from "react";
import { AddPost } from "./AddPost";
import { api } from "@/services/axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AxiosError } from "axios";

interface Post {
    id: number;
    content: string;
    createdAt: string;
}

interface Synthetiser {
    id: number;
    marque: string;
    modele: string;
    specifications: string | null;
    image_url: string | null;
    note: string | null;
    nb_avis: string | null;
    auctionPrice: number | null;
    posts: Post[];
}

interface ApiError {
    error: string;
    details: string;
}

export default function SynthetiserDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [synthetiser, setSynthetiser] = useState<Synthetiser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSynthetiser = useCallback(async () => {
        try {
            const { data: responseData } = await api.get<{ data: Synthetiser; message: string }>(
                `/synthetisers/${params.id}`
            );
            setSynthetiser(responseData.data);
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            setError(axiosError.response?.data?.error || "Une erreur est survenue");
            if (axiosError.response?.status === 401) {
                router.push("/login");
            }
        } finally {
            setIsLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        fetchSynthetiser();
    }, [fetchSynthetiser]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!synthetiser) {
        return (
            <div className="text-center py-8">
                <p>Synthétiseur non trouvé</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* En-tête avec image */}
                {synthetiser.image_url && (
                    <div className="relative h-64 w-full">
                        <Image
                            src={synthetiser.image_url}
                            alt={`${synthetiser.marque} ${synthetiser.modele}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                        />
                    </div>
                )}

                {/* Informations du synthétiseur */}
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">
                        {synthetiser.marque} {synthetiser.modele}
                    </h1>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            {synthetiser.note && (
                                <div>
                                    <span className="text-sm text-gray-600">Note: </span>
                                    <span className="font-semibold">{synthetiser.note}</span>
                                </div>
                            )}
                            {synthetiser.nb_avis && (
                                <div>
                                    <span className="text-sm text-gray-600">Avis: </span>
                                    <span className="font-semibold">{synthetiser.nb_avis}</span>
                                </div>
                            )}
                        </div>

                        {synthetiser.specifications && (
                            <p className="text-gray-600 mb-4">{synthetiser.specifications}</p>
                        )}

                        {synthetiser.auctionPrice && (
                            <p className="text-2xl font-bold text-blue-600">
                                {new Intl.NumberFormat("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                    minimumFractionDigits: 0,
                                }).format(synthetiser.auctionPrice)}
                            </p>
                        )}
                    </div>

                    {/* Section des posts */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Posts</h2>
                        <AddPost 
                            synthetiserId={synthetiser.id} 
                            onPostAdded={fetchSynthetiser}
                        />

                        <div className="space-y-4">
                            {synthetiser.posts.map((post) => (
                                <div 
                                    key={post.id} 
                                    className="bg-gray-50 rounded-lg p-4"
                                >
                                    <p className="text-gray-800">{post.content}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}