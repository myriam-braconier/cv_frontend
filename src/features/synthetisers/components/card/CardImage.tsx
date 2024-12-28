import Image from "next/image";

interface CardImageProps {
 image_url?: string;
 title: string;
 onError?: () => void;
}

export const CardImage = ({ image_url, title, onError }: CardImageProps) => {



  return (
    <div 
      className="relative w-full bg-gray-50 rounded-lg overflow-hidden" 
      style={{ 
        height: "200px",
        minWidth: "200px"
      }}
    >
      <Image
        src={image_url || "/images/placeholder.jpg"}
        alt={title}
        className="object-contain p-2"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={75}
        priority
        onError={onError}
      />
    </div>
  );

  
};

