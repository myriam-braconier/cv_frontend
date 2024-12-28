interface CardActionsProps {
	onEdit: () => void;
	onDelete: () => void;
	isAdmin: boolean;
}

export const CardActions = ({
	onEdit,
	onDelete,
	isAdmin,
}: CardActionsProps) => {
	console.log("CardActions isAdmin:", isAdmin);
	return (
		<div className="flex gap-2 justify-center items-center mt-4 p-4">
       
			<button
				onClick={onEdit}
				className="flex-1 max-w-[200px] bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
			>
				Éditer
			</button>
			
			<button
				onClick={onDelete}
				className="flex-1 max-w-[200px] bg-red-500 bg-opacity-200 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
			>
				Supprimer
			</button>
     
		</div>
	);
};
