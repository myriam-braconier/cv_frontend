"use client";
import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { JSX } from "react"; // pour le type JSX.Element
import Image from "next/image";
import { useState, useCallback } from "react";
import { Synth, AuctionPrice, Post } from "@/features/synthetisers/types/synth";
interface FormData {
	marque: string;
	modele: string;
	image_url: string;
	specifications: string;
	price: number | null;
	proposal_price: number | null;
	auctionPrices: AuctionPrice[];
	post: Post[];
	userName?: string;
}
interface EditorFormProps extends React.PropsWithChildren {
	error: string | null;
	synth?: Synth;
	onSubmit: (data: Partial<Synth>) => Promise<void>;
	onOpenChange: (open: boolean) => void;
	isLoading?: boolean;
	onCancel: () => void;
	isAuthenticated: () => boolean; // Ajout de la prop
	onUpdateSuccess?: () => void; // Ajout de cette prop optionnelle
}

export const EditorForm = ({
	error,
	synth,
	onSubmit,
	isLoading,
	onCancel,
	onOpenChange,
	onUpdateSuccess, // Ajout ici
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
				updatedAt: auction.updatedAt,
				createdAt: auction.createAt,
			})) || [],

		post: synth?.posts || [],
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
		setFormError("");
		setIsSubmitting(true);

		try {
			// Récupérer l'userId depuis le token
			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("Non authentifié");
			}

			// Décoder le token pour obtenir les informations de l'utilisateur
			const tokenData = JSON.parse(atob(token.split(".")[1]));
			const userId = tokenData.userId;

			const submissionData = {
				id: synth?.id,
				marque: formData.marque,
				modele: formData.modele,
				image_url: formData.image_url || undefined,
				specifications: formData.specifications || undefined,
				price:
					formData.price !== null
						? {
								value: formData.price,
								currency: "EUR",
						  }
						: undefined,
				userId: userId,
				lastUpdatedBy: userId, // Ajout de l'ID de l'utilisateur qui fait la mise à jour
			};

			await onSubmit(submissionData);
			onOpenChange(false);
			if (onUpdateSuccess) onUpdateSuccess();
			window.location.reload(); // Force le rafraîchissement des données
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

	// Rendu

	return (
		<div className="w-full space-y-4">
			 {/* Affichage des erreurs */}
			 {(formError || error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {formError || error || ""}
          </AlertDescription>
        </Alert>
      )}
			{/* Formulaire principal */}
			<form onSubmit={handleSubmit} id="main-form" className="space-y-4 flex justify-between">
			

				<div>
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
						<div className="mt-2 relative h-[300px] w-[300px] mx-auto">
							{formData.image_url && !imageError ? (
								<Image
									src={formData.image_url}
									alt="Aperçu"
									fill
									// width={300}
									// height={300}
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
				</div>

				<div className="space-y-4 ">
					<div className="flex">
						{/* Spécifications */}
						<div>
							<label className="block text-sm font-medium text-white mb-1">
								Spécifications
							</label>
							<textarea
								name="specifications"
								value={formData.specifications}
								onChange={handleChange}
								className="min-w-[500px] p-2 border rounded focus:ring-2 focus:ring-blue-500 min-h-[200px]"
								disabled={isLoading}
							/>
						</div>
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
							className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
					</div>

					{/* Pas de section encherir*/}
					<div className="border-t pt-4 mt-4">
						{/* Affichage de la dernière enchère */}
						<div className="space-y-2 mt-4">
							<label className="block text-sm font-medium text-white">
								Dernière enchère
							</label>
							<div className="text-lg font-semibold text-red-600">
								value={formData.proposal_price}
							</div>
						</div>

						{/* Boutons d'action */}
					</div>

					{/* boutons actions */}
					<div className="justify-end space-x-2 pt-4">
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
