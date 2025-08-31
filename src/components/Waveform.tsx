import React, { useState, useEffect } from 'react';

const Waveform = ({ initialColor = '#FF5733' }) => {
  const [color, setColor] = useState(initialColor);
  const [waveData, setWaveData] = useState<Array<{y: number, height: number}>>([]);

  useEffect(() => {
    // Générer les données d'onde aléatoirement seulement côté client après l'hydratation
    const data = [...Array(20)].map(() => ({
      y: 7 + Math.random() * 15,
      height: 8 + Math.random() * 8
    }));
    setWaveData(data);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <svg 
        viewBox="0 0 100 30" 
        className="w-full h-32"
        preserveAspectRatio="none"
      >
        {/* Simulation de forme d'onde audio */}
        <path
          d="M0 15 Q 5 5, 10 15 T 20 15 T 30 15 T 40 15 T 50 15 T 60 15 T 70 15 T 80 15 T 90 15 T 100 15"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
        />
        <path
          d="M0,15 Q10,5 20,15 T40,15 T60,15 T80,15 T100,15"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
        />
        {/* Simulation des pics audio */}
        {waveData.map((bar, i) => (
          <rect
            key={i}
            x={i * 5}
            y={bar.y}
            width="2"
            height={bar.height}
            fill={color}
          />
        ))}
      </svg>
      
      {/* Contrôle de couleur */}
      <div className="mt-4 text-right rounded-md">
        <label className="block text-sm font-medium mb-2">
          Choisir une couleur:
        </label>
        <input 
          type="color" 
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-20 h-10 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Waveform;