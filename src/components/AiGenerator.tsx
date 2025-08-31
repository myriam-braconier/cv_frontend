// AIgenerator.tsx

"use client";

import { useState, useEffect } from "react";
import { setBackgroundInCache } from "@/lib/cache";
import { X } from 'lucide-react'; 

export default function AiGenerator({
	children,
}: {
	children: React.ReactNode;
}) {
	const [bgImage, setBgImage] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(true); 
	const [prompt, setPrompt] = useState(
		"abstract digital art background, colorful, vibrant"
	);
	const [retryCount, setRetryCount] = useState(0);

	// Debug : vérifier si le composant se monte correctement
	useEffect(() => {
		console.log("AiGenerator monté, isOpen:", isOpen);
	}, [isOpen]);

	const generateBackground = async () => {
		console.log("Génération démarrée avec prompt:", prompt);
		setIsLoading(true);
		setError(null);
		
		try {
			const res = await fetch("/api/generate-background", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});

			console.log("Réponse reçue:", res.status);

			if (!res.ok) {
				const errorData = await res.json();
				console.error("Erreur API:", errorData);
				
				if (res.status === 503 && retryCount < 3) {
					setRetryCount((prev) => prev + 1);
					setTimeout(() => generateBackground(), 2000 * (retryCount + 1));
					setError(
						"Service temporairement indisponible, nouvelle tentative en cours..."
					);
					return;
				}
				throw new Error(errorData.error || "Erreur lors de la génération");
			}

			const data = await res.json();
			console.log("Données reçues:", data);
			
			// Adaptation pour la nouvelle structure de réponse Freepik
			if (data.images && data.images.length > 0) {
				setBgImage(data.images[0].imageUrl);
				setBackgroundInCache(data.images[0].imageUrl);
				setRetryCount(0);
			} else if (data.imageUrl) {
				// Fallback pour l'ancienne structure
				setBgImage(data.imageUrl);
				setBackgroundInCache(data.imageUrl);
				setRetryCount(0);
			} else {
				throw new Error("Aucune image reçue");
			}
		} catch (error) {
			console.error("Erreur génération:", error);
			setError(error instanceof Error ? error.message : "Erreur inconnue");
		} finally {
			setIsLoading(false);
		}
	};

	// Version fermée - bouton de réouverture
	if (!isOpen) {
		return (
			<div className="min-h-screen w-full relative">
				<div
					className="absolute bottom-4 inset-0 bg-cover bg-center"
					style={{
						backgroundImage: bgImage ? `url(${bgImage})` : undefined,
					}}
				/>
				{/* Bouton pour réouvrir - plus visible */}
				<button
					onClick={() => {
						console.log("Réouverture du générateur");
						setIsOpen(true);
					}}
					className="fixed bottom-4 right-4 z-[9999] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 font-medium"
				>
					🎨 Générateur de fond
				</button>
				<div className="relative z-10">{children}</div>
			</div>
		);
	}

	// Version ouverte - interface complète
	return (
		<div className="min-h-screen w-full relative">
			{/* Background image */}
			<div
				className={`
					absolute inset-0 bg-cover bg-center transition-opacity duration-1000
					${isLoading ? "opacity-50" : "opacity-100"}
				`}
				style={{
					backgroundImage: bgImage ? `url(${bgImage})` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				}}
			/>
			
			{/* Interface de génération - z-index très élevé */}
			<div className="fixed bottom-4 right-4 z-[9999] bg-white shadow-2xl rounded-lg p-4 w-80 border border-gray-200">
				{/* Header avec bouton de fermeture */}
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-semibold text-gray-800">🎨 Générateur IA</h3>
					<button
						onClick={() => {
							console.log("Fermeture du générateur");
							setIsOpen(false);
						}}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{/* Input pour le prompt */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Description du fond :
					</label>
					<textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Décrivez le fond souhaité..."
						rows={3}
					/>
				</div>

				{/* Bouton de génération - style plus visible */}
				<button
					onClick={generateBackground}
					disabled={isLoading}
					className={`
						w-full px-4 py-3 rounded-lg font-medium transition-all duration-200
						${isLoading 
							? "bg-gray-400 cursor-not-allowed text-white" 
							: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg"
						}
					`}
				>
					{isLoading ? (
						<div className="flex items-center justify-center">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							Génération en cours...
						</div>
					) : (
						"✨ Générer le fond"
					)}
				</button>

				{/* Informations additionnelles */}
				{bgImage && (
					<div className="mt-3 text-xs text-gray-600">
						✅ Fond généré avec succès
					</div>
				)}
			</div>

			{/* Messages d'erreur - position fixe */}
			{error && (
				<div className="fixed bottom-4 right-4 z-[9999] bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
					<div className="flex items-start justify-between">
						<div>
							<div className="font-medium">❌ Erreur</div>
							<div className="text-sm mt-1">{error}</div>
							{retryCount > 0 && (
								<div className="text-xs mt-1 opacity-90">
									Tentative {retryCount}/3
								</div>
							)}
						</div>
						<button
							onClick={() => setError(null)}
							className="text-white hover:text-gray-200 ml-2"
						>
							<X size={16} />
						</button>
					</div>
				</div>
			)}

			{/* Contenu principal */}
			<div className="relative z-10">{children}</div>
		</div>
	);
}