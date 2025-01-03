// hooks/useBackgroundRotator.ts
import { useState, useEffect, useCallback } from 'react';

export const useBackgroundRotator = (images: string[]): number => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const getRandomIndex = useCallback((): number => {
    const newIndex = Math.floor(Math.random() * images.length);
    return newIndex === currentImageIndex 
      ? (newIndex + 1) % images.length 
      : newIndex;
  }, [images.length, currentImageIndex]);

  useEffect(() => {
    // Ne change l'image qu'au montage initial
    if (currentImageIndex === 0) {
      setCurrentImageIndex(getRandomIndex());
    }
  }, [getRandomIndex, currentImageIndex]);

  return currentImageIndex;
};