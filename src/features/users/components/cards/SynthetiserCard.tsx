// components/cards/SynthetiserCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Synth, Post } from '@/features/synthetisers/types/synth';
import { Music, DollarSign, Star, MessageSquare, Clock } from 'lucide-react';
import Image from 'next/image';

interface SynthetiserCardProps {
  synth: Synth;
  posts?: Post[];
  onAuctionClick?: (synthId: number) => void;
}

export function SynthetiserCard({ synth, posts, onAuctionClick }: SynthetiserCardProps) {
  const formatPrice = (price: number | { value: number; currency: string } | null | undefined) => {
    if (!price) return 'Prix non disponible';
    
    if (typeof price === 'number') {
      return `${price.toLocaleString()} €`;
    }
    return `${price.value.toLocaleString()} ${price.currency}`;
  };

  const latestAuctions = synth.auctionPrices?.sort((a, b) =>
    (typeof b.createdAt === 'number' ? b.createdAt : Number(new Date(b.createdAt))) -
    (typeof a.createdAt === 'number' ? a.createdAt : Number(new Date(a.createdAt)))
  ).slice(0, 3);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        {/* En-tête avec titre et prix */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              {synth.marque} {synth.modele}
            </CardTitle>
            {/* Note et avis */}
            {(synth.note || synth.nb_avis) && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm">
                  {synth.note}/5
                  {synth.nb_avis && (
                    <span className="text-gray-500"> ({synth.nb_avis} avis)</span>
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xl font-bold text-primary">
            <DollarSign className="h-6 w-6" />
            {formatPrice(synth.price)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Image du synthétiseur */}
        {synth.image_url && (
          <div className="relative h-24 rounded-lg overflow-hidden">
            <Image
              src={synth.image_url}
              alt={`${synth.marque} ${synth.modele}`}
              width={200}
              height={200}
              className="object-cover"
            />
          </div>
        )}

        {/* Spécifications */}
        {synth.specifications && (
          <p className="text-sm text-gray-600">{synth.specifications}</p>
        )}

        {/* Section des enchères */}
        {latestAuctions && latestAuctions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Dernières enchères
            </h4>
            <div className="space-y-2">
              {latestAuctions.map((auction) => (
                <div 
                  key={auction.id}
                  className="bg-gray-50 p-3 rounded-md flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {auction.proposal_price.toLocaleString()} €
                    </span>
                  </div>
                  <Badge variant="secondary">{auction.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section des posts */}
        {posts && posts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Posts associés
            </h4>
            <div className="space-y-2">
              {posts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  className="border-l-2 border-gray-200 pl-3 py-2"
                >
                  {post.titre && (
                    <h5 className="text-sm font-medium">{post.titre}</h5>
                  )}
                  {post.commentaire && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {post.commentaire}
                    </p>
                  )}
                  <div className="mt-1 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {post.type_contenu}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {post.statut}
                    </Badge>
                  </div>
                  {post.author && (
                    <p className="text-xs text-gray-500 mt-1">
                      Par @{post.author.username}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton d'enchère */}
        {onAuctionClick && (
          <button
            onClick={() => onAuctionClick(synth.id)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Faire une enchère
          </button>
        )}
      </CardContent>
    </Card>
  );
}