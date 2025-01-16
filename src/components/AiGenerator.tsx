"use client";

import { useState } from "react";
import { setBackgroundInCache } from "@/lib/cache";

export default function AiGenerator({
	children,
}: {
	children: React.ReactNode;
}) {
	const [bgImage, setBgImage] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
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

			<div className="fixed top-16 right-4 z-50 bg-white/90 p-4 rounded-lg shadow-lg">
				<input
					type="text"
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					className="w-64 px-3 py-4 border rounded-lg mb-2"
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
					</div>
				)}
			</div>

			<div className="relative z-10">{children}</div>
		</div>
	);
}
