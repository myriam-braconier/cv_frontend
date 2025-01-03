"use client";
import Image from 'next/image';
import { useBackgroundRotator } from '../hooks/useBackgroundRotator';

type BackgroundRotatorProps = { // on utilise type au lieu d'interface
  images: string[];
};

const BackgroundRotator = ({ images }: BackgroundRotatorProps) => {
  const currentImageIndex = useBackgroundRotator(images);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Image
        src={images[currentImageIndex]}
        alt="Background"
        fill
        sizes="100vw"
        className="object-cover opacity-50 transition-opacity duration-500"
        priority
      />
    </div>
  );
};

export default BackgroundRotator;

