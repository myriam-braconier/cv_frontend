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

    const [formData, setFormData] = useState({
        marque: originalSynth.marque || "",
        modele: originalSynth.modele || "",
        specifications: originalSynth.specifications || "",
        image_url: originalSynth.image_url || "",
        price: initialPrice,
    });

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setFormData((prev) => ({
            ...prev,
            price: value,
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

            // Vérifier si un prix a été défini
            if (formData.price === 0) {
                throw new Error("Veuillez définir un prix valide");
            }

            const response = await api.post(
                `${API_URL}/api/synthetisers/${originalSynth.id}/duplicate`,
                {
                    price: {
                        value: formData.price,
                        currency: "EUR",
                    },
                }
            );

            if (response.status === 201) {
                toast.success("Synthétiseur dupliqué avec succès");
                if (onSuccess) {
                    onSuccess();
                }
                router.refresh();
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
                        <span className="font-medium">Prix actuel :</span>{" "}
						{initialPrice === 0 ? (
                            <span className="text-blue-600 italic">
                                Vous êtes le premier à remettre  en vente cet instrument
                            </span>
                        ) : (
                            `${initialPrice} EUR`
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
                        {initialPrice === 0 ? "Définir le prix (EUR)*" : "Nouveau prix (EUR)*"}
                    </label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={handlePriceChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
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
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Duplication en cours..." : "Dupliquer le synthétiseur"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DuplicateSynthForm;