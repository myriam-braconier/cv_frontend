"use client";
import * as React from "react";
import { JSX } from "react"; // pour le type JSX.Element
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useState, useCallback } from "react";
import { Synth, AuctionPrice } from "@/features/synthetisers/types/synth";

interface FormData {
	marque: string;
	modele: string;
	image_url: string;
	specifications: string;
	price: number | null;
	proposal_price: number | null;
	auctionPrices: AuctionPrice[];
}
interface EditorFormProps extends React.PropsWithChildren {
	error: string | null;
	synth?: Synth;
	onSubmit: (data: Partial<Synth>) => Promise<void>;
	onOpenChange: (open: boolean) => void;
	isLoading?: boolean;
	onCancel: () => void;
	isAuthenticated: () => boolean; // Ajout de la prop
}

export const EditorForm = ({
	error,
	synth,
	onSubmit,
	isLoading,
	onCancel,
	onOpenChange,
}: EditorFormProps): JSX.Element => {
	const [formError, setFormError] = useState<string>("");
	const [imageError, setImageError] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const [formData, setFormData] = useState<FormData>({
		marque: synth?.marque ?? "",
		modele: synth?.modele ?? "",
		image_url: synth?.image_url ?? "",
		specifications: synth?.specifications ?? "",
		price:
			typeof synth?.price === "number"
				? synth.price
				: synth?.price?.value ?? null,

		proposal_price: synth?.auctionPrices?.length
			? Math.max(
					...synth.auctionPrices.map((auction) => auction.proposal_price)
			  )
			: null,

		auctionPrices:
			synth?.auctionPrices?.map((auction) => ({
				id: auction.id,
				proposal_price: auction.proposal_price,
				status: auction.status,
				synthetiserId: auction.synthetiserId,
				userId: auction.userId,
				createAt: auction.createAt,
				updateAt: auction.updateAt,
				createdAt: auction.createAt,
			})) || [],
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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormError("");
		setIsSubmitting(true);

		try {
			const submissionData: Partial<Synth> = {
				id: synth?.id,
				marque: formData.marque,
				modele: formData.modele,
				image_url: formData.image_url || undefined,
				specifications: formData.specifications || undefined,
				price:
					formData.price !== null
						? { value: formData.price, currency: "EUR" }
						: undefined,
			};

			await onSubmit(submissionData);
			onOpenChange(false);
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
		<div className="w-full space-y-4">
			{/* Formulaire principal */}
			<form onSubmit={handleSubmit} id="main-form" className="space-y-4">
				{/* Alertes */}
				<div>
					{isSubmitting && <div>Chargement...</div>}
					{(formError || error) && (
						<Alert variant="destructive" className="mb-6">
							<AlertDescription>{formError || error || ""}</AlertDescription>
						</Alert>
					)}
				</div>

				{/* Champs du formulaire */}
				<div className="space-y-4">
					{/* Marque */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Marque
						</label>
						<input
							type="text"
							name="marque"
							value={formData.marque}
							onChange={handleChange}
							required
							className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
					</div>

					{/* Modèle */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Modèle
						</label>
						<input
							type="text"
							name="modele"
							value={formData.modele}
							onChange={handleChange}
							required
							className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
					</div>

					{/* Image */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							URL de l&apos;image
						</label>
						<input
							type="url"
							name="image_url"
							value={formData.image_url}
							onChange={handleImageChange}
							className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
						<div className="mt-2 relative h-[150px] w-[150px] mx-auto">
							{formData.image_url && !imageError ? (
								<Image
									src={formData.image_url}
									alt="Aperçu"
									width={150}
									height={150}
									className="object-contain rounded-lg mx-auto"
									onError={handleImageError}
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
									<span className="text-gray-500">Image non disponible</span>
								</div>
							)}
						</div>
					</div>

					<div className="flex">
						{/* Spécifications */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Spécifications
							</label>
							<textarea
								name="specifications"
								value={formData.specifications}
								onChange={handleChange}
								className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 min-h-[100px]"
								disabled={isLoading}
							/>
						</div>

						{/* Prix */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Prix
							</label>
							<input
								type="number"
								name="price"
								value={formData.price ?? ""}
								onChange={handleChange}
								className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
								disabled={isLoading}
							/>
						</div>
					</div>

					{/* Section Enchères */}
					<div className="border-t pt-4 mt-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Encherir
							</label>

							<input
								type="number"
								name="proposal_price"
								value={formData.proposal_price ?? ""}
								onChange={handleChange}
								min={
									formData.auctionPrices.length > 0
										? formData.auctionPrices[formData.auctionPrices.length - 1]
												.proposal_price + 1
										: formData.price
										? formData.price + 1
										: 0
								}
								className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
								disabled={isLoading}
							/>
						</div>
						{/* <div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Nouvelle enchère
					</label>
					<input
						type="number"
						name="auctionPrice"
						value={formData.auctionPrice ?? ""} // Utiliser auctionPrice au lieu de auctionPrices
						onChange={handleChange}
						min={
							typeof synth?.price === "object"
								? synth.price.value + 1
								: (synth?.price || 0) + 1
						}
						className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
						disabled={isLoading}
					/>
				</div> */}

						{/* Affichage de la dernière enchère */}
						<div className="space-y-2 mt-4">
							<label className="block text-sm font-medium text-gray-700">
								Dernière enchère
							</label>
							<div className="text-lg font-semibold">
								{Array.isArray(synth?.auctionPrices) &&
								synth.auctionPrices.length > 0
									? `${
											synth.auctionPrices[synth.auctionPrices.length - 1]
												.proposal_price
									  }€`
									: "Aucune enchère"}
							</div>
						</div>

						{/* Boutons d'action */}
						<div className="flex justify-end space-x-2 pt-4">
							<button
								type="button"
								onClick={handleCancel}
								disabled={isLoading}
								className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
							>
								Annuler
							</button>

							<button
								type="submit"
								form="main-form"
								disabled={isLoading || isSubmitting}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
							>
								{isLoading
									? "Sauvegarde..."
									: synth
									? "Mettre à jour"
									: "Créer"}
							</button>
						</div>
					</div>
					{/* Boutons */}
					<div className="flex justify-end space-x-2 pt-4">
						<button
							type="button"
							onClick={handleCancel}
							disabled={isLoading}
							className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
						>
							Annuler
						</button>

						<button
							type="submit"
							form="main-form"
							disabled={isLoading || isSubmitting}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
						>
							{isLoading ? "Sauvegarde..." : synth ? "Mettre à jour" : "Créer"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};
