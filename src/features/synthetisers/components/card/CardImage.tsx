import Image from "next/image";
import { useState } from "react";

interface CardImageProps {
 image_url?: string;
 title: string;
 onError?: () => void;
}

export const CardImage = ({ image_url, title, onError }: CardImageProps) => {
  // Ajout d'une image par défaut si image_url est vide
  const fallbackImage = "/images/placeholder.jpg";
 const [imageError, setImageError] = useState(false);

 const handleImageError = () => {
   setImageError(true);
   onError?.();
 };

 if (!image_url || imageError) return null;

 return (
   <div className="relative w-full h-64 overflow-hidden rounded-lg">
     <Image
       src={image_url || fallbackImage}
       alt={title}
       fill
       className="object-cover " 
       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
       quality={75}
       loading="eager"
       priority
       onError={handleImageError}
     />
   </div>
 );
};