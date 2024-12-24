interface CardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
 }
 
 export const CardActions = ({ onEdit, onDelete }: CardActionsProps) => (
  <div className="flex gap-2 mt-4 p-4">
    <button
      onClick={onEdit}
      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
    >
      Éditer
    </button>
    <button
      onClick={onDelete}
      className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
    >
      Supprimer
    </button>
  </div>
 );