"use client";
import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useState, useCallback } from "react";
import { Synth, AuctionPrice, Post } from "@/features/synthetisers/types/synth";
import { useRouter } from "next/navigation";

// Remove duplicate interfaces since they're already imported from synth.ts
interface FormData {
	marque: string;
	modele: string;
	image_url: string;
	specifications: string;
	price: number | null;
	proposal_price: number | null;
	auctionPrices: AuctionPrice[];
	posts: Post[];
}

interface EditorFormProps {
	error: string | null;
	synth?: Synth;
	onSubmit: (data: Partial<Synth>) => Promise<void>;
	onOpenChange: (open: boolean) => void;
	isLoading?: boolean;
	onCancel: () => void;
	isAuthenticated: boolean; // Changed from function to boolean
	onUpdateSuccess?: () => void;
}

export const EditorForm = ({
	error,
	synth,
	onSubmit,
	isLoading,
	onCancel,
	onOpenChange,
	onUpdateSuccess,
	isAuthenticated,
}: EditorFormProps): React.ReactElement => {
	const [formError, setFormError] = useState<string>("");
	const [imageError, setImageError] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const router = useRouter();

	const [formData, setFormData] = useState<FormData>({
		marque: synth?.marque ?? "",
		modele: synth?.modele ?? "",
		image_url: synth?.image_url ?? "",
		specifications: synth?.specifications ?? "",
		price:
			typeof synth?.price === "number"
				? synth.price
				: synth?.price?.value ?? null,
		proposal_price: synth?.auctionPrices?.[0]?.proposal_price ?? null,
		auctionPrices: synth?.auctionPrices ?? [],
		posts: synth?.posts ?? [],
	});

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = e.target;
			setFormData((prev) => ({
				...prev,
				[name]:
					name === "price" || name === "proposal_price"
						? value === ""
							? null
							: Number(value)
						: value,
			}));
		},
		[]
	);

	const handleImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setImageError(false);
			setFormData((prev) => ({
				...prev,
				image_url: e.target.value,
			}));
		},
		[]
	);

	const handleImageError = useCallback(() => {
		setImageError(true);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}

		setFormError("");
		setIsSubmitting(true);

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return;
			}

			try {
				const tokenData = JSON.parse(atob(token.split(".")[1]));
				if (tokenData.exp && tokenData.exp * 1000 < Date.now()) {
					localStorage.removeItem("token");
					router.push("/login");
					return;
				}

				const submissionData: Partial<Synth> = {
					id: synth?.id,
					marque: formData.marque,
					modele: formData.modele,
					image_url: formData.image_url || undefined,
					specifications: formData.specifications || undefined,
					price:
						formData.price !== null
							? {
									value: Number(formData.price),
									currency: "EUR",
							  }
							: undefined,
				};

				await onSubmit(submissionData);
				onOpenChange(false);
				if (onUpdateSuccess) onUpdateSuccess();
			} catch {
				localStorage.removeItem("token");
				router.push("/login");
				return;
			}
		} catch (error) {
			setFormError(
				error instanceof Error ? error.message : "Erreur lors de la mise à jour"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = useCallback(() => {
		if (formData.marque || formData.modele) {
			if (window.confirm("Voulez-vous vraiment annuler ?")) {
				onCancel();
				onOpenChange(false);
			}
		} else {
			onCancel();
			onOpenChange(false);
		}
	}, [formData.marque, formData.modele, onCancel, onOpenChange]);

	return (
		<div className="w-full max-w-6xl mx-auto p-6 space-y-6">
			{(formError || error) && (
				<Alert variant="destructive" className="mb-6">
					<AlertDescription>{formError || error}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Layout responsive avec grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Colonne de gauche : Informations principales */}
					<div className="space-y-6">
						<div className="bg-gray-50 p-6 rounded-lg space-y-6">
							<h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
								Informations principales
							</h3>
							
							{/* Marque et Modèle sur la même ligne */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Marque *
									</label>
									<input
										type="text"
										name="marque"
										value={formData.marque}
										onChange={handleChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										disabled={isLoading}
										placeholder="Ex: Moog, Roland..."
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Modèle *
									</label>
									<input
										type="text"
										name="modele"
										value={formData.modele}
										onChange={handleChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										disabled={isLoading}
										placeholder="Ex: Minimoog, Juno-106..."
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									URL de l&apos;image
								</label>
								<input
									type="url"
									name="image_url"
									value={formData.image_url}
									onChange={handleImageChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									disabled={isLoading}
									placeholder="https://..."
								/>
								{imageError && (
									<p className="text-red-500 text-sm mt-1">
										Impossible de charger cette image
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Prix (EUR)
								</label>
								<div className="relative">
									<input
										type="number"
										name="price"
										value={formData.price ?? ""}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												price: e.target.value === "" ? null : Number(e.target.value),
											}))
										}
										min="0"
										step="0.01"
										className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										disabled={isLoading}
										placeholder="0.00"
									/>
									<span className="absolute right-3 top-2 text-gray-500 text-sm">€</span>
								</div>
							</div>
						</div>

						{/* Spécifications */}
						<div className="bg-gray-50 p-6 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
								Spécifications techniques
							</h3>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Description détaillée
								</label>
								<textarea
									name="specifications"
									value={formData.specifications}
									onChange={handleChange}
									rows={8}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
									disabled={isLoading}
									placeholder="Décrivez les caractéristiques techniques, l'état, les accessoires inclus..."
								/>
							</div>
						</div>
					</div>

					{/* Colonne de droite : Aperçu et enchères */}
					<div className="space-y-6">
						{/* Aperçu de l'image */}
						<div className="bg-gray-50 p-6 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
								Aperçu
							</h3>
							<div className="flex justify-center">
								<div className="relative h-64 w-64">
									{formData.image_url && !imageError ? (
										<div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200">
											<Image
												src={formData.image_url}
												alt="Aperçu du synthétiseur"
												fill
												className="object-cover"
												onError={handleImageError}
											/>
										</div>
									) : (
										<div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 rounded-lg border-2 border-dashed border-gray-300">
											<svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<span className="text-gray-500 text-sm text-center">
												Aucune image disponible
												<br />
												Ajoutez une URL d&apos;image
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Informations sur les enchères */}
						{synth?.auctionPrices && synth.auctionPrices.length > 0 && (
							<div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
								<h3 className="text-lg font-semibold text-red-800 border-b border-red-300 pb-2 mb-4">
									Informations d&apos;enchères
								</h3>
								<div className="space-y-2">
									<label className="block text-sm font-medium text-red-700">
										Dernière enchère
									</label>
									<div className="text-2xl font-bold text-red-600">
										{formData.proposal_price?.toLocaleString('fr-FR')} €
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Boutons d'action */}
				<div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
					<button
						type="button"
						onClick={handleCancel}
						disabled={isLoading}
						className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={isLoading || isSubmitting}
						className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
					>
						{(isLoading || isSubmitting) && (
							<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
						)}
						<span>
							{isLoading ? "Sauvegarde..." : synth ? "Mettre à jour" : "Créer"}
						</span>
					</button>
				</div>
			</form>
		</div>
	);
};
