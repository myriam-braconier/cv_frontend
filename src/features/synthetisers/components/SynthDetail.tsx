// components/SynthDetail.tsx
import { useRouter } from 'next/navigation';
import { Synth } from "@/features/synthetisers/types/synth";





interface SynthDetailProps {
    synth: Synth;
    userRoles?: string[];
  }


  export default function SynthDetail({ 
    synth, 
    userRoles = [] // Valeur par défaut
  }: SynthDetailProps) {
    const router = useRouter();


  const canDuplicate = () => {
    return userRoles.some(role => ['admin', 'owner_instr'].includes(role));
  }



  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{synth.marque} {synth.modele}</h2>
      
      {synth.specifications && (
        <p className="mb-4">{synth.specifications}</p>
      )}
      
      <p className="mb-4">Prix: {
        typeof synth.price === 'object' 
          ? `${synth.price.value} ${synth.price.currency}`
          : `${synth.price} EUR`
      }</p>

      <div className="flex gap-2 mt-4">
        {canDuplicate() && (
          <button
            onClick={() => router.push(`/synthetisers/duplicate/${synth.id}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Dupliquer ce synthétiseur
          </button>
        )}
      </div>
    </div>
  );
}