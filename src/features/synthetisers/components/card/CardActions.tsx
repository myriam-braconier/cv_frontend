import React from "react";
import { DuplicateSynthDialog } from "@/features/synthetisers/components/dialogs/DuplicateSynthDialog";
import { Synth } from "@/features/synthetisers/types/synth";

interface CardActionsProps {
	onEdit: () => void;
	onDelete: () => void;
	originalSynth: Synth; // Ajout de la prop pour le synth original
	onDuplicate: () => void;
	isLoading: boolean;
	isAdmin: boolean;
}

export const CardActions = ({
	onEdit,
	onDelete,
	isAdmin,
	originalSynth,
	isLoading,
}: CardActionsProps) => {
	

	// État pour contrôler l'ouverture du dialogue
	const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] =
		React.useState(false);

		console.log("CardActions isAdmin:", isAdmin);

	// Gestionnaires pour le dialogue
	const handleOpenDuplicateDialog = () => setIsDuplicateDialogOpen(true);
	const handleCloseDuplicateDialog = () => setIsDuplicateDialogOpen(false);

	
	if (!isAdmin) return null;

	return (
		<>
			<div className="flex bg-white gap-2 justify-center items-center mt-4 p-4">
				<button
					onClick={onEdit}
					disabled={isLoading}
					className="max-w-[200px] bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
				>
					Éditer
				</button>
				<button
					onClick={onDelete}
					disabled={isLoading}
					className="max-w-[200px] bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
				>
					Supprimer
				</button>
				<button
					onClick={handleOpenDuplicateDialog}
					disabled={isLoading}
					className="max-w-[200px] bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
				>
					Dupliquer
				</button>
			</div>
			<DuplicateSynthDialog
				originalSynth={originalSynth}
				isOpen={isDuplicateDialogOpen}
				onOpenChange={setIsDuplicateDialogOpen}
				onClose={handleCloseDuplicateDialog}
				isAdmin={isAdmin}
				onSuccess={() => {
					handleCloseDuplicateDialog();
					//ajouter ici une logique supplémentaire après la duplication réussie ??
				}}
			/>
		</>
	);
};
