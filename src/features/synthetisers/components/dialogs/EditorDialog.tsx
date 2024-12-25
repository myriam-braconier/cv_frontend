"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogOverlay,
} from "@/components/ui/dialog";
import { EditorForm } from "@/features/synthetisers/components/editor/EditorForm";
import { Synth } from "@/features/synthetisers/types/synth";

interface EditorDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	synthetiser: Synth;
	onSubmit: (updatedData: Partial<Synth>) => Promise<void>;
	isUpdating: boolean;
	updateError: string | null;
	onCancel?: () => void;
}

export const EditorDialog = ({
	isOpen,
	onOpenChange,
	synthetiser,
	onSubmit,
	isUpdating,
	updateError,
}: EditorDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogOverlay className="fixed inset-0 bg-black/50 z-40" />
			<DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-white rounded-lg shadow-lg p-6">
				{" "}
				<DialogTitle className="text-lg font-semibold mb-4">
					{synthetiser ? "Modifier le synthétiseur" : "Ajouter un synthétiseur"}
				</DialogTitle>
				<DialogDescription className="sr-only">
					Formulaire d&apos;édition de synthétiseur
				</DialogDescription>
				<EditorForm
					error={updateError}
					synth={synthetiser}
					onSubmit={onSubmit}
					isOpen={isOpen}
					onOpenChange={onOpenChange}
					isLoading={isUpdating}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
export default EditorDialog;
