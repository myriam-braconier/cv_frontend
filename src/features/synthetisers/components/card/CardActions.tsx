interface CardActionsProps {
	onEdit: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	isLoading: boolean;
	isAdmin: boolean;
}

export const CardActions = ({
	onEdit,
	onDelete,
	isAdmin,
  }: CardActionsProps) => {
	console.log("CardActions isAdmin:", isAdmin);
	if (!isAdmin) return null;
	
	return (
	  <div className="flex bg-white gap-2 justify-center items-center mt-4 p-4">
		<button
		  onClick={onEdit}
		  className="max-w-[200px] bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
		>
		  Éditer
		</button>
		<button
		  onClick={onDelete}
		  className="max-w-[200px] bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"		>
		  Supprimer
		</button>
	  </div>
	);
  };