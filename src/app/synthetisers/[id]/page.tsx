"use client";


import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/axios";
import { Synth, Post } from "@/features/synthetisers/types";
import { AxiosError } from "axios";
import Image from "next/image";
import { AddPost } from "@/features/synthetisers/components/posts/AddPost";

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
				params: {
					include: ["posts", "auctionPrices"],
				},
			});

			if (response.data?.data) {
				setSynth(response.data.data);
			}
		} catch (error) {
			if (
				error instanceof AxiosError &&
				(error.response?.status === 401 || error.response?.status === 403)
			) {
				localStorage.removeItem("token");
				window.location.href = "/login";
				return;
			}
			setError("Une erreur est survenue lors du chargement du synthétiseur");
		} finally {
			setIsLoading(false);
		}
	}, [params?.id]);

	useEffect(() => {
		fetchSynth();
	}, [fetchSynth]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-lg">Chargement...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	if (!synth) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p>Synthétiseur non trouvé</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">
				{synth.marque} {synth.modele}
			</h1>

			<div className="bg-white shadow-lg rounded-lg p-6">
				{synth.image_url && (
					<div className="relative h-64 mb-6">
						<Image
							src={synth.image_url}
							alt={`${synth.marque} ${synth.modele}`}
							fill
							className="object-contain rounded-lg"
							priority
						/>
					</div>
				)}

				<div className="space-y-8">
					{synth.specifications && (
						<section>
							<h2 className="text-xl font-semibold mb-3">Spécifications</h2>
							<p className="text-gray-600 leading-relaxed">
								{synth.specifications}
							</p>
						</section>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{synth.note && (
							<section>
								<h2 className="text-xl font-semibold mb-3">Évaluation</h2>
								<div className="flex items-center space-x-3">
									<span className="text-lg font-medium">{synth.note}/5</span>
									{synth.nb_avis && (
										<span className="text-gray-500">
											({synth.nb_avis} avis)
										</span>
									)}
								</div>
							</section>
						)}

						{synth.price && (
							<section>
								<h2 className="text-xl font-semibold mb-3">Prix</h2>
								<p className="text-blue-600 font-bold text-2xl">
									{new Intl.NumberFormat("fr-FR", {
										style: "currency",
										currency: "EUR",
										minimumFractionDigits: 0,
									}).format(
										typeof synth.price === "object"
											? synth.price.value
											: synth.price
									)}
								</p>
							</section>
						)}
					</div>

					{/* Section enchères */}
					{Array.isArray(synth.auctionPrices) &&
						synth.auctionPrices.length > 0 && (
							<section className="border-t pt-6">
								<h2 className="text-xl font-semibold mb-3">Dernière enchère</h2>
								<p className="text-green-600 font-bold text-2xl">
									{new Intl.NumberFormat("fr-FR", {
										style: "currency",
										currency: "EUR",
										minimumFractionDigits: 0,
									}).format(synth.auctionPrices[0].proposal_price)}
								</p>
							</section>
						)}

					<section className="border-t pt-6">
						<h2 className="text-2xl font-semibold mb-4">Ajouter un post</h2>
						<AddPost synthetiserId={synth.id} onPostAdded={fetchSynth} />
					</section>

					{synth.posts && synth.posts.length > 0 && (
						<section className="border-t pt-6">
							<h2 className="text-2xl font-semibold mb-4">
								Posts ({synth.posts.length})
							</h2>
							<div className="space-y-4">
								{synth.posts.map((post: Post) => (
									<article
										key={post.id}
										className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
									>
										{post.titre && (
											<h3 className="font-semibold text-lg">{post.titre}</h3>
										)}
										{post.commentaire && (
											<p className="mt-2 text-gray-700">{post.commentaire}</p>
										)}
										{post.createdAt && (
											<time className="text-sm text-gray-500 mt-2 block">
												Posté le{" "}
												{new Date(post.createdAt).toLocaleDateString("fr-FR", {
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</time>
										)}
									</article>
								))}
							</div>
						</section>
					)}
				</div>
			</div>
		</div>
	);
}
