"use client";

import { memo, useCallback, useState } from 'react';
import Image from 'next/image';
import { Synth } from '@/types';
import { PostList } from './PostList';
import { Rating } from './Rating';


interface SynthetiserCardProps {
  synthetiser: Synth;
}

export const SynthetiserCard = memo(function SynthetiserCard({ 
  synthetiser 
}: SynthetiserCardProps) {
  const [showPosts, setShowPosts] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleTogglePosts = useCallback(() => {
    setShowPosts(prev => !prev);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (!synthetiser) return null;

  const {
    image_url,
    marque,
    modele,
    note,
    nb_avis,
    specifications,
    auctionPrice,
    posts
  } = synthetiser;

  const fullTitle = `${marque} ${modele}`;

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
      <div className="p-6">

      {image_url && !imageError && (
  <div 
    className="relative  w-full mb-4 bg-gray-100 rounded-lg overflow-hidden" 
    style={{ height: '240px' }} // Hauteur fixe
  >
    <Image
      src={image_url}
      alt={fullTitle}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false}
      onError={handleImageError}
    />
  </div>
)}

        <header className="flex justify-between items-start mb-4">
          <h2 
            className="text-xl font-bold text-gray-900 truncate" 
            title={fullTitle}
          >
            {fullTitle}
          </h2>
          <Rating note={note} nb_avis={nb_avis} />
        </header>

        {specifications && (
          <p 
            className="text-gray-600 text-sm mb-4 line-clamp-3" 
            title={specifications}
          >
            {specifications}
          </p>
        )}

        {auctionPrice && (
          <div className="mb-4">
            <p className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0
              }).format(auctionPrice)}
            </p>
          </div>
        )}

        <button
          onClick={handleTogglePosts}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded
            hover:bg-blue-600 transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          type="button"
          aria-expanded={showPosts}
        >
          {showPosts 
            ? "Masquer les posts" 
            : `Voir les posts (${posts?.length || 0})`
          }
        </button>

        {showPosts && <PostList posts={posts || []} />}
      </div>
    </article>
  );
});