"use client"
import React, { useState, useEffect } from 'react';

const OverlayAnimation = () => {
  const [phase, setPhase] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(1);
  
  // Effet pour gérer les phases d'animation
  useEffect(() => {
    const phaseTimers = [
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 6000)
    ];

    return () => phaseTimers.forEach(timer => clearTimeout(timer));
  }, []);

  // Effet pour l'animation de position aléatoire
  useEffect(() => {
    if (phase === 2) {
      const moveInterval = setInterval(() => {
        setPosition({
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50
        });
      }, 500);

      return () => clearInterval(moveInterval);
    }
  }, [phase]);

  // Effet pour l'animation de fade out
  useEffect(() => {
    if (phase === 3) {
      const fadeInterval = setInterval(() => {
        setOpacity(prev => Math.max(0, prev - 0.1));
      }, 100);

      return () => clearInterval(fadeInterval);
    }
  }, [phase]);

  // Si phase 4, on ne rend plus rien
  if (phase === 4) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
      <div 
        className={`
          transition-all duration-500 ease-in-out
          ${phase === 1 ? 'animate-bounce' : ''}
          ${phase === 2 ? 'animate-spin' : ''}
        `}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          opacity: opacity
        }}
      >
        <div className={`
          w-32 h-32 
          rounded-full 
          bg-gradient-to-r 
          from-blue-500 
          to-orange-700
          ${phase === 1 ? 'animate-pulse' : ''}
        `} />
      </div>
    </div>
  );
};

export default OverlayAnimation;