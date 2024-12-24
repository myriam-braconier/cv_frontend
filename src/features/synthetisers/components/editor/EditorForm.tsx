import React, { useState, useCallback, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { Synth } from "@/types/synth";

interface EditorFormProps {
 synth?: Synth;
 onSubmit: (data: Partial<Synth>) => Promise<void>;
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
 isLoading?: boolean;
 error?: string | null;
 onCancel: () => void;
}

interface FormData {
 marque: string;
 modele: string;
 image_url?: string;
 specifications?: string;
 price: number | null;
 auctionPrice: number | null; 
 auctionPrices: Array<{
  proposal_price: number;
  status: string;
}>;
}

export const EditorForm = ({
 synth,
 onSubmit,
 onOpenChange,
 isLoading = false,
 error: apiError,
 onCancel
}: EditorFormProps) => {

 const [formData, setFormData] = useState<FormData>({
   marque: synth?.marque ?? "",
   modele: synth?.modele ?? "",
   image_url: synth?.image_url ?? "",
   specifications: synth?.specifications ?? "",
   price: typeof synth?.price === 'number' ? synth.price : synth?.price?.value ?? null,
   auctionPrices: synth?.auctionPrices ?? [],
 auctionPrice: synth?.auctionPrices?.[0]?.proposal_price ?? null });

 const [imageError, setImageError] = useState(false);
 const [formError, setFormError] = useState("");

useEffect(() => {
  if (synth) {
    setFormData({
      marque: synth.marque,
      modele: synth.modele,
      image_url: synth.image_url,
      specifications: synth.specifications,
      price: typeof synth.price === 'number' ? synth.price : synth.price?.value ?? null,
      auctionPrice: synth.auctionPrices?.[0]?.proposal_price ?? null,
      auctionPrices: synth.auctionPrices ?? []
    });
    setFormError("");
  }
}, [synth]);

 const handleChange = useCallback(
   (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({
       ...prev,
       [name]: (name === "price" || name === "auctionPrice") 
       ? (value === "" ? null : Number(value))
       : value
   }));
   },
   []
 );

 const handleImageChange = useCallback(
   (e: React.ChangeEvent<HTMLInputElement>) => {
     setImageError(false);
     setFormData(prev => ({
       ...prev,
       image_url: e.target.value
     }));
   },
   []
 );

 const handleImageError = useCallback(() => {
   setImageError(true);
 }, []);

 const handleSubmit = useCallback(
	async (e: React.FormEvent) => {
	  e.preventDefault();
	  setFormError("");
  
	  try {
		if (!formData.marque || !formData.modele) {
		  throw new Error("La marque et le modèle sont requis");
		}
		
		// Modifiez cette partie pour envoyer seulement la valeur du prix
		const submissionData: Partial<Synth> = {
		  ...formData,
		  price: formData.price || 0 // Envoie la valeur numérique directe
		};
		
		await onSubmit(submissionData);
		onOpenChange(false);
	  } catch (error) {
		setFormError(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
	  }
	},
	[formData, onSubmit, onOpenChange]
  );



 return (
<div className="w-full">
			<h2 className="text-2xl font-bold mb-6">
				{synth ? "Modifier le synthétiseur" : "Ajouter un synthétiseur"}
			</h2>

			{(formError || apiError) && (
				<Alert variant="destructive" className="mb-6">
					<AlertDescription>{formError || apiError || ""}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Marque
						</label>
						<input
							type="text"
							name="marque"
							value={formData.marque}
							onChange={handleChange}
							className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
							required
							disabled={isLoading}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Modèle
						</label>
						<input
							type="text"
							name="modele"
							value={formData.modele}
							onChange={handleChange}
							className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
							required
							disabled={isLoading}
						/>
					</div>
				</div>

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
					{formData.image_url && !imageError ? (
						<div className="relative h-[200px] mb-4 mx-4"
						style={{
							height: "100px",
						}}>
							<Image
								src={formData.image_url}
								alt="Aperçu"
								className="object-contain"
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								quality={75}
								onError={handleImageError} // Ajout du handler ici
							/>
						</div>
					) : (
						<div className="relative mt-2 h-40 w-full flex items-center justify-center bg-gray-100 rounded">
							<span className="text-gray-500">Image non disponible</span>
						</div>
					)}
				</div>

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

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Prix
						</label>
						<input
							type="number"
							name="price"
							value={formData.price ?? ''}  // Utilisation de l'opérateur de coalescence nulle
							onChange={handleChange}
							min="0"
							step="0.01"
							className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Prix d&apos;enchère
						</label>
						<input
							type="number"
							name="auctionPrice"
							value={formData.auctionPrice ?? ''}
							onChange={handleChange}
							min="0"
							step="0.01"
							className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
							disabled={isLoading}
						/>
					</div>
				</div>

				<div className="flex justify-end gap-4 mt-6">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
						disabled={isLoading}
					>
						Annuler
					</button>
					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
						disabled={isLoading}
					>
						{isLoading ? "Sauvegarde..." : synth ? "Mettre à jour" : "Créer"}
					</button>
				</div>
			</form>
		</div>
 );
};

export default EditorForm;