// import { X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogOverlay,
} from "@/components/ui/dialog";
import { EditorForm } from "@features/synthetisers/components/editor/EditorForm";
import { Synth } from "@/features/synthetisers/types/synth";

interface EditorDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	synth: Synth; // Rendu optionnel pour correspondre à EditorFormProps
	onSubmit: (data: Partial<Synth>) => Promise<void>;
	isLoading?: boolean;
	error: string | null; // Changé de string | undefined à string | null
	onCancel: () => void;
	isAuthenticated: () => boolean; 
	onClose: () => void;
	onSuccess?: () => void;
}

export const EditorDialog = ({
	isOpen,
	onOpenChange,
	synth,
	error,
	isLoading,
	onSubmit,
	onCancel,

}: EditorDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogOverlay className="bg-black/50 backdrop-blur-sm" />{" "}
			{/* Ajout de l'overlay avec flou */}
			<DialogContent className="max-h-[95vh] w-[200vw] max-w-5xl overflow-y-auto p-6">
				<div className="sticky top-0 right-0 z-50 flex justify-end">
					<button
						onClick={() => onOpenChange(false)}
						className="rounded-full p-2 hover:bg-gray-100"
						aria-label="Fermer"
					>
						{/* <X className="h-4 w-4" /> */}
					</button>
				</div>
				<DialogHeader className="pt-6">
					<DialogTitle className="text-2xl font-bold text-white">
						{synth
							? `Modifier ${synth.marque} ${synth.modele}`
							: "Modifier le synthétiseur"}
					</DialogTitle>

					<DialogDescription>
						{" "}
						{synth
							? `Modifiez les informations de votre synthétiseur ${synth.marque} ${synth.modele}`
							: "Modifiez les informations de votre synthétiseur"}
					</DialogDescription>
				</DialogHeader>
				{/* Reste du contenu du dialogue */}
				{error && <p className="text-red-500">{error}</p>}
				<EditorForm
					synth={synth}
					onSubmit={onSubmit}
					isLoading={isLoading}
					onCancel={onCancel}
					error={error}
					onOpenChange={onOpenChange}
					isAuthenticated={(): boolean => !!localStorage.getItem("userId")}
				/>
			</DialogContent>
		</Dialog>
	);
};
