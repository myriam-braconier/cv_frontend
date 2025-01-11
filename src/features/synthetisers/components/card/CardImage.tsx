import Image from "next/image";

interface CardImageProps {
	image_url?: string;
	title: string;
	onError?: () => void;
}

export const CardImage = ({ image_url, title, onError }: CardImageProps) => {
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
				height: "200px",
				minWidth: "200px",
			}}
		>
			<Image
				  src={getImagePath(image_url)}
				alt={title}
				className="object-cover"
				fill
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				onError={onError}
				unoptimized
			/>
		</div>
	);
};
