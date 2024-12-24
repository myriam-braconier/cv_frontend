// import { useCallback } from 'react';
import { AuctionPrice } from '@/features/synthetisers/types';
// import { toast } from 'react-hot-toast';

interface CardPricingProps {
 price: number | { value: number; currency: string };
 auctionPrice: AuctionPrice | null;
 onBid: () => Promise<void>;
 isAuthenticated: () => boolean;
 canBid: () => boolean;
 isLoading: boolean;
}

export const CardPricing = ({ 
 price, 
 auctionPrice, 
 onBid, 
 isAuthenticated, 
 canBid,
 isLoading 
}: CardPricingProps) => {
 
  const formatPrice = (price: number | { value: number; currency: string } | null): string => {
    if (!price) return "Prix non disponible";
    const numericPrice = typeof price === 'number' ? price : price.value;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(numericPrice);
  };

 return (
   <div className="flex flex-col px-3 mb-4">
     <div>
       <label>
         <h6>Prix initial</h6>
       </label>
       <p className="text-xl font-bold text-blue-600">
         {formatPrice(price)}
       </p>
     </div>
     
     {auctionPrice && (
       <div className="mt-2">
         <label>
           <h6>Dernière enchère</h6>
         </label>
         <p className="text-lg font-semibold text-green-600">
           {formatPrice(auctionPrice.proposal_price)}
         </p>
       </div>
     )}

     {isAuthenticated() && canBid() && (
       <button
         onClick={onBid}
         disabled={isLoading}
         className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
       >
         {isLoading ? 'Enchère en cours...' : 'Enchérir'}
       </button>
     )}
   </div>
 );
};