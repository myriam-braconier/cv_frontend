import { Rating } from '@/features/synthetisers/components/Rating';

interface CardHeaderProps {
  title: string;
  note?: number;
  nb_avis?: number;
  specifications?: string;
}

export const CardHeader = ({ title, note, nb_avis, specifications }: CardHeaderProps) => {
  return (
    <div className="px-3">
      {/* Header principal avec titre et note */}
      <header className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-900 truncate" title={title}>
          {title}
        </h2>
        <Rating note={note} nb_avis={nb_avis} />
      </header>

      {/* Specifications si disponibles */}
      {specifications && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3" title={specifications}>
          {specifications}
        </p>
      )}
    </div>
  );
};