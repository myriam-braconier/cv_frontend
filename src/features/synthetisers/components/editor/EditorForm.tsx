"use client";
import * as React from "react";
import { JSX } from "react"; // pour le type JSX.Element
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useState, useCallback } from "react";
import { Synth } from "@/features/synthetisers/types/synth";

interface AuctionPrice {
	id?: number;
	proposal_price: number;
	status: string;
	synthetiserId: number;
	userId: number;
	createAt: string;
}

interface FormData {
	marque: string;
	modele: string;
	image_url: string;
	specifications: string;
	price: number | null;
	auctionPrice: number | null;
	auctionPrices: AuctionPrice[]; // Assurez-vous que cette propriété est définie
}

interface EditorFormProps extends React.PropsWithChildren {
	error: string | null;
	synth?: Synth;
	onSubmit: (data: Partial<Synth>) => Promise<void>;
	onOpenChange: (open: boolean) => void;
	isLoading?: boolean;
	onCancel: () => void;
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
		auctionPrices:
			synth?.auctionPrices?.map((auction: AuctionPrice) => ({
				proposal_price: auction.proposal_price,
				status: auction.status,
				synthetiserId: auction.synthetiserId,
				userId: auction.userId,
				createAt: auction.createAt,
			})) || [],
		auctionPrice: null,
	});

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = e.target;
			setFormData((prev) => ({
				...prev,
				[name]:
					name === "price" || name === "auctionPrice"
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
				auctionPrices: formData.auctionPrices,
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

	const handleAuctionBid = async () => {
		setFormError("");
		setIsSubmitting(true);

		try {
			const currentPrice: number | undefined =
				typeof synth?.price === "object" ? synth.price.value : synth?.price;

			const newPrice = formData.auctionPrice;

			if (!synth?.id || !formData.auctionPrice) {
				throw new Error("Données d'enchère invalides");
			}

			if (!newPrice || !currentPrice || newPrice <= currentPrice) {
				throw new Error("L'enchère doit être supérieure au prix actuel");
			}

			const userId = localStorage.getItem("userId");
			if (!userId) {
				throw new Error("Information utilisateur manquante");
			}

			const newAuction: AuctionPrice = {
				id: Date.now(),
				proposal_price: newPrice,
				status: "active",
				createAt: new Date().toISOString(),
				userId: Number(userId),
				synthetiserId: synth.id,
			};

			const submissionData: Partial<Synth> = {
				id: synth.id,
				price: { value: newPrice, currency: "EUR" },
				auctionPrices: [...(synth.auctionPrices || []), newAuction],
			};

			await onSubmit(submissionData);
			onOpenChange(false);
		} catch (error) {
			setFormError(
				error instanceof Error ? error.message : "Erreur lors de l'enchère"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

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
							URL de l&apropos;image
						</label>
						<input
							type="url"
							name="image_url"
							value={formData.image_url}
							onChange={handleImageChange}
							className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
						<div className="mt-2 relative h-[200px] w-full">
							{formData.image_url && !imageError ? (
								<Image
									src={formData.image_url}
									alt="Aperçu"
									width={400}
									height={200}
									className="object-contain w-full h-full"
									onError={handleImageError}
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
									<span className="text-gray-500">Image non disponible</span>
								</div>
							)}
						</div>
					</div>

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
			</form>

			{/* Section Enchères */}
			<div className="border-t pt-4 mt-4">
				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Nouvelle enchère
					</label>

					<input
						type="number"
						name="auctionPrice"
						value={formData.auctionPrices[formData.auctionPrices.length - 1]?.proposal_price ?? 0}
						onChange={handleChange}
						min={
							typeof synth?.price === "object"
							  ? synth.price.value + 1
							  : (synth?.price || 0) + 1
						  }
						className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
						disabled={isLoading}
					/>

				</div>
			</div>

			{/* Boutons d'action */}
			<div className="flex justify-end space-x-2 pt-4">
				<button
					type="button"
					onClick={handleAuctionBid}
					disabled={isLoading || isSubmitting || !formData.auctionPrice}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
				>
					{isLoading ? "Enchère en cours..." : "Placer une enchère"}
				</button>

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
	);
};
