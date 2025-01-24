"use client";

import { useState } from "react";
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

	const generateBackground = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/background", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});

			if (!res.ok) {
				const errorData = await res.json();
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
			if (data.imageUrl) {
				setBgImage(data.imageUrl);
				setBackgroundInCache(data.imageUrl);
				setRetryCount(0);
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : "Erreur inconnue");
		} finally {
			setIsLoading(false);
		}
	};

  if (!isOpen) {
    return (
      <div className="min-h-screen w-full relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          }}
        />
        {/* Bouton pour réouvrir le générateur */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-20 right-4 z-50 bg-blue-900/50 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Générateur de fond
        </button>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <div
        className={`
          absolute inset-0 bg-cover bg-center transition-opacity duration-1000
          ${isLoading ? "opacity-50" : "opacity-100"}
        `}
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        }}
      />
      <div className="fixed top-20 right-4 z-50 bg-white/90 p-4 rounded-lg shadow-lg">
        {/* Bouton de fermeture */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-64 px-3 py-4 border rounded-lg mb-2 text-black"
          placeholder="Décrivez le fond souhaité..."
        />
        <button
          onClick={() => generateBackground()}
          disabled={isLoading}
          className={`
            w-full px-4 py-2 bg-blue-900/50 text-white rounded-lg
            ${isLoading ? "opacity-50" : "hover:bg-blue-600"}
          `}
        >
          {isLoading ? "Génération..." : "Générer le fond"}
        </button>
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500/90 text-white p-4 rounded-lg shadow-lg">
            {error}
            {retryCount > 0 && (
              <div className="text-sm mt-1">
                Tentative {retryCount}/3
              </div>
            )}
            {/* Bouton pour fermer l'erreur */}
            <button
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
