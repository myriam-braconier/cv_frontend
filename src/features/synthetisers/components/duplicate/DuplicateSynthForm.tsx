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

	const initialPrice = originalSynth?.price
		? typeof originalSynth.price === "object"
			? originalSynth.price.value
			: originalSynth.price
		: 0;
	// Initialiser directement le prix à null pour forcer l'utilisateur à entrer un nouveau prix

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

			// Convertir le prix en nombre et vérifier sa validité
			const numericPrice = parseFloat(formData.price);
			if (isNaN(numericPrice) || numericPrice <= 0) {
				throw new Error("Veuillez définir un prix valide");
			}

			const response = await api.post(
				`${API_URL}/api/synthetisers/${originalSynth.id}/duplicate`,
				{
					price: {
						value: numericPrice,
						currency: "EUR",
					},
				}
			);

			if (response.status === 201) {
				toast.success("Synthétiseur dupliqué avec succès");
				//    forcer le rafraichissement de la page et rediriger

				// D'abord appeler onSuccess pour fermer le dialog
				if (onSuccess) {
					onSuccess();
				}

				// Attendre un court instant avant de rafraîchir
				setTimeout(() => {
					router.refresh();
					window.location.href = "/synthetisers";
				}, 100);
			}
		} catch (error: unknown) {
            if (error instanceof AxiosError) {
                const errorMessage = error.response?.data?.message || 
                                   "Erreur lors de la duplication du synthétiseur";
                setError(errorMessage);
                toast.error(errorMessage);
                
                if (error.response?.status === 403) {
                    router.push("/login");
                }
            } else if (error instanceof Error) {
                setError(error.message);
                toast.error(error.message);
            } else {
                setError("Une erreur inattendue est survenue");
                toast.error("Une erreur inattendue est survenue");
            }
        }  finally {
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
                            `${typeof originalSynth.price === 'object' ? originalSynth.price.value : originalSynth.price} EUR`
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
