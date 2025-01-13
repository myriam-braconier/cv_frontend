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

	// RENDU ------------------------------------------------------------
	return (
		<div className="w-full space-y-4">
			{(formError || error) && (
				<Alert variant="destructive">
					<AlertDescription>{formError || error}</AlertDescription>
				</Alert>
			)}
			<form
				onSubmit={handleSubmit}
				id="main-form"
				className=" flex justify-around"
			>
				<div className="space-y-9">
					<div>
						<label className="block text-sm font-medium text-white">
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

					<div>
						<label className="block text-sm font-medium text-white mb-1">
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

					<div>
						<div>
							<label className="block text-sm font-medium text-white mb-1">
								Spécifications
							</label>
							<textarea
								name="specifications"
								value={formData.specifications}
								onChange={handleChange}
								className="w-96 p-2 border rounded focus:ring-2 focus:ring-blue-500 h-48"
								disabled={isLoading}
							/>
						</div>
						<label className="block text-sm font-medium text-white  mt-3">
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
					</div>
				</div>

				<div className="space-y-10">
					<div className="relative h-64 w-64 mx-auto">
						{formData.image_url && !imageError ? (
							<div className="relative w-full h-full rounded-full overflow-hidden">
								<Image
									src={formData.image_url}
									alt="Aperçu"
									fill
									className="object-cover"
									onError={handleImageError}
								/>
							</div>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
								<span className="text-gray-500">Image non disponible</span>
							</div>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-white mb-1">
							Prix
						</label>
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
							min="0" // Ajout d'une valeur minimale fixe
							step="0.01" // Pour permettre les décimales
							className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
					</div>

					{synth?.auctionPrices && synth.auctionPrices.length > 0 && (
						<div className="border-t pt-4 mt-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-white">
									Dernière enchère
								</label>
								<div className="text-lg font-semibold text-red-600">
									{formData.proposal_price} EUR
								</div>
							</div>
						</div>
					)}

					<div className="flex justify-start space-x-2 pt-2">
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
