import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { EditorForm } from "@features/synthetisers/components/editor/EditorForm";
import { Synth } from "@/features/synthetisers/types/synth";



interface EditorDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	synth?: Synth; // Rendu optionnel pour correspondre à EditorFormProps
	onSubmit: (data: Partial<Synth>) => Promise<void>;
	isLoading?: boolean;
	error: string | null; // Changé de string | undefined à string | null
	onCancel: () => void;
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{" "}
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
				/>
			</DialogContent>
		</Dialog>
	);
};
