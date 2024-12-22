"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/axios";
import { Synth, Post } from "@/types";
import { AxiosError } from "axios";
import Image from "next/image";
import { AddPost } from "@/features/synthetisers/components/AddPost";

export default function SynthetiserDetailPage() {
	const params = useParams();
	const [synth, setSynth] = useState<Synth | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSynth = useCallback(async () => {
		if (!params?.id) return;

		try {
			const token = localStorage.getItem("token");
			const response = await api.get(`/api/synthetisers/${params.id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setSynth(response.data.data);
		} catch (error) {
			if (
				error instanceof AxiosError &&
				(error.response?.status === 401 || error.response?.status === 403)
			) {
				localStorage.removeItem("token");
				window.location.href = "/login";
				return;
			}
			setError("Une erreur est survenue");
		} finally {
			setIsLoading(false);
		}
	}, [params?.id]);

	useEffect(() => {
		fetchSynth();
	}, [fetchSynth]);

	if (isLoading) return <div>Chargement...</div>;
	if (error) return <div>{error}</div>;
	if (!synth) return <div>Synthétiseur non trouvé</div>;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-4">
				{synth.marque} {synth.modele}
			</h1>
			<div className="bg-white shadow-lg rounded-lg p-6">
				{synth.image_url && (
					<div className="relative h-48 mb-4">
						<Image
							src={synth.image_url}
							alt={synth.modele}
							fill
							className="object-cover rounded-lg"
						/>
					</div>
				)}

				{/* Informations de base */}
				<div className="space-y-4">
					{synth.specifications && (
						<div>
							<h2 className="text-xl font-semibold">Spécifications</h2>
							<p className="text-gray-600">{synth.specifications}</p>
						</div>
					)}

					{synth.note && (
						<div>
							<h2 className="text-xl font-semibold">Note</h2>
							<p>{synth.note}</p>
						</div>
					)}

					{synth.price && (
						<div>
							<h2 className="text-xl font-semibold">Prix</h2>
							<p className="text-blue-600 font-bold text-2xl">
								{new Intl.NumberFormat("fr-FR", {
									style: "currency",
									currency: "EUR",
									minimumFractionDigits: 0,
								}).format(synth.price)}
							</p>
						</div>
					)}
				</div>

				{/* Section Ajout de Post */}
				<div className="mt-8">
					<h2 className="text-2xl font-semibold mb-4">Ajouter un post</h2>
					<AddPost
						synthetiserId={synth.id}
						onPostAdded={() => {
							// Recharger les données du synthétiseur pour afficher le nouveau post
							fetchSynth();
						}}
					/>
				</div>

				{/* list des Posts */}
				{synth.posts && synth.posts.length > 0 && (
					<div className="mt-8">
						<h2 className="text-2xl font-semibold mb-4">Posts</h2>
						<div className="space-y-4">
							{synth.posts.map((post: Post) => (
								<div key={post.id} className="bg-gray-50 p-4 rounded-lg">
									{post.titre && (
										<h3 className="font-semibold">{post.titre}</h3>
									)}
									{post.commentaire && (
										<p className="mt-2">{post.commentaire}</p>
									)}
									{post.createdAt && (
										<p className="text-sm text-gray-500 mt-2">
											{new Date(post.createdAt).toLocaleDateString()}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
