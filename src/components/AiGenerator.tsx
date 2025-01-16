'use client';

import { useState } from 'react';
import { setBackgroundInCache } from '@/lib/cache';

export default function AiGenerator({ children }: { children: React.ReactNode }) {
  const [bgImage, setBgImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('abstract digital art background, colorful, vibrant');

  const generateBackground = async (customPrompt?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: customPrompt || prompt 
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.imageUrl) {
        setBgImage(data.imageUrl);
        setBackgroundInCache(data.imageUrl);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      <div
        className={`
          absolute inset-0 bg-cover bg-center transition-opacity duration-1000
          ${isLoading ? 'opacity-50' : 'opacity-100'}
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
            ${isLoading ? 'opacity-50' : 'hover:bg-blue-600'}
          `}
        >
          {isLoading ? 'Génération...' : 'Générer le fond'}
        </button>
        {error && (
          <div className="mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}