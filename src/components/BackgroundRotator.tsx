"use client";
import Image from 'next/image';
import { useBackgroundRotator } from '../hooks/useBackgroundRotator';

type BackgroundRotatorProps = {
  images: string[];
};

const BackgroundRotator = ({ images }: BackgroundRotatorProps) => {
  const currentImageIndex = useBackgroundRotator(images);

  return (
    <div className="relative inset-0 w-full h-full">
     				<div className="absolute inset-0 w-full h-full">
      <Image
        src={images[currentImageIndex]}
        alt="Background"
        fill
        sizes="(max-width: 414px) 414px, (max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        className="object-cover opacity-50 transition-opacity duration-500"
        priority
        quality={75}
      />
      </div>
    </div>
  );
};

export default BackgroundRotator;