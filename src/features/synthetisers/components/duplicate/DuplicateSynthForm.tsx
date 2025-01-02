import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/services/axios";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Synth } from "@/features/synthetisers/types/synth";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/config/constants";

interface DuplicateSynthFormProps {
	originalSynth: Synth;
	onSuccess?: () => void;
}

const DuplicateSynthForm = ({
	originalSynth,
	onSuccess,
}: DuplicateSynthFormProps) => {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [imageError, setImageError] = useState(false);

	const [formData, setFormData] = useState({
		marque: originalSynth.marque || "",
		modele: originalSynth.modele || "",
		specifications: originalSynth.specifications || "",
		image_url: originalSynth.image_url || "",
		price: "" as string, // On utilise une chaîne vide pour l'input
	});

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			price: e.target.value, // Garder la valeur comme string
		}));
	};

	const handleCancel = () => {
		if (onSuccess) {
			onSuccess();
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("Non authentifié");
			}

			const numericPrice = parseFloat(formData.price);
			if (isNaN(numericPrice) || numericPrice <= 0) {
				throw new Error("Veuillez définir un prix valide");
			}

			console.log("Prix à envoyer:", numericPrice);

			const requestData = {
				price: numericPrice,
				currency: "EUR",
				newId: true, // Indiquer qu'on veut un nouvel ID
			};

			// Log de la requête
			console.log("Requête de duplication:", {
				url: `${API_URL}/api/synthetisers/${originalSynth.id}/duplicate`,
				data: requestData,
			});

			const response = await api.post(
				`${API_URL}/api/synthetisers/${originalSynth.id}/duplicate`,
				requestData
			);

			// Log de la réponse
			console.log("Réponse de duplication:", response.data);

			if (response.status === 201 && response.data) {
				// Vérifier si nous avons un nouvel ID dans la réponse
				const newSynthId = response.data.id;
				console.log("Nouvel ID du synthétiseur:", newSynthId);

				toast.success("Synthétiseur dupliqué avec succès");

				if (onSuccess) {
					onSuccess();
				}

				// Rediriger vers la liste avec un petit délai pour permettre à l'API de finaliser
				setTimeout(() => {
					router.refresh();
					window.location.href = "/synthetisers";
				}, 500);
			} else {
				throw new Error(
					"Erreur lors de la duplication : pas de nouvel ID reçu"
				);
			}
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				console.error("Erreur de duplication:", error.response?.data);
				const errorMessage =
					error.response?.data?.message ||
					"Erreur lors de la duplication du synthétiseur";
				setError(errorMessage);
				toast.error(errorMessage);

				if (error.response?.status === 403) {
					router.push("/login");
				}
			} else if (error instanceof Error) {
				console.error("Erreur:", error.message);
				setError(error.message);
				toast.error(error.message);
			} else {
				setError("Une erreur inattendue est survenue");
				toast.error("Une erreur inattendue est survenue");
			}
		} finally {
			setIsLoading(false);
		}
	};

	// RENDU
	return (
		<div className="w-full max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<div className="bg-gray-50 p-4 rounded-lg">
					<h2 className="text-lg font-semibold mb-2">
						Synthétiseur d&apos;origine :
					</h2>
					<p>
						<span className="font-medium">Marque :</span> {originalSynth.marque}
					</p>
					<p>
						<span className="font-medium">Modèle :</span> {originalSynth.modele}
					</p>
					<p>
						<span className="font-medium">Prix de référence :</span>{" "}
						{originalSynth.price ? (
							`${
								typeof originalSynth.price === "object"
									? originalSynth.price.value
									: originalSynth.price
							} EUR`
						) : (
							<span className="text-blue-600 italic">
								Pas de prix de référence
							</span>
						)}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="mt-4">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Prix de votre annonce (EUR)*
					</label>
					<input
						type="number"
						value={formData.price === null ? "" : formData.price}
						onChange={handlePriceChange}
						required
						min="0"
						step="0.01"
						className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
						disabled={isLoading}
						placeholder="Entrez un prix"
					/>
				</div>

				{formData.image_url && !imageError && (
					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Aperçu de l&apos;image
						</label>
						<div className="relative h-48 w-48">
							<Image
								src={formData.image_url}
								alt="Aperçu"
								fill
								className="object-contain rounded"
								onError={() => setImageError(true)}
							/>
						</div>
					</div>
				)}

				<div className="flex justify-end space-x-4 mt-6">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isLoading}
					>
						Annuler
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading
							? "Duplication en cours..."
							: "Dupliquer le synthétiseur"}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default DuplicateSynthForm;
