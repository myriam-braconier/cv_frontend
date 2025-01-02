"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Synth } from "@/features/synthetisers/types/synth";
import DuplicateSynthForm from "@features/synthetisers/components/duplicate/DuplicateSynthForm";

interface DuplicateSynthDialogProps {
	originalSynth: Synth;
	trigger?: React.ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	synth: Synth;
	onClose: () => void;
	onSuccess?: () => void;
	isAdmin: boolean;
}

export const DuplicateSynthDialog = ({
	originalSynth,
	
	onSuccess,
}: DuplicateSynthDialogProps) => {
	const [open, setOpen] = React.useState(false);

	const handleSuccess = () => {
		if (onSuccess) {
			onSuccess();
		}
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Dupliquer le synthétiseur</DialogTitle>
				</DialogHeader>
				<DuplicateSynthForm
					originalSynth={originalSynth}
					onSuccess={handleSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default DuplicateSynthDialog;
