interface RatingProps {
    note?: number;
    nb_avis?: number;
  }
  
  export function Rating({ note, nb_avis }: RatingProps) {
    if (!note && !nb_avis) return null;
  
    return (
      <div className="flex items-center gap-2">
        {note && (
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">★</span>
            <span className="font-medium">{note}</span>
          </div>
        )}
        {nb_avis && (
          <span className="text-sm text-gray-500">
            ({nb_avis})
          </span>
        )}
      </div>
    );
  }