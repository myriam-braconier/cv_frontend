import Image from "next/image";

interface CardImageProps {
	image_url?: string;
	title: string;
	onError?: () => void;
	priority?: boolean;
}

export const CardImage = ({
	image_url,
	title,
	onError,
	priority = false,
}: CardImageProps) => {
	// Fonction pour corriger le chemin de l'image
	const getImagePath = (path?: string) => {
		if (!path) return "/images/placeholder.jpg";
		if (path.startsWith("https")) return path;
		return path.startsWith("/") ? path : `/${path}`;
	};

	return (
		<div
			className="relative w-full bg-gray-50 rounded-lg overflow-hidden"
			style={{
				height: "150px",
				minWidth: "150px",
			}}
		>
			<Image
				src={getImagePath(image_url)}
				alt={title}
				className="object-cover aspect-video : ratio 16:9 rounde-lg"
				fill
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				quality={90}
				loading={priority ? "eager" : "lazy"}
				onError={onError}
			/>
		</div>
	);
};
