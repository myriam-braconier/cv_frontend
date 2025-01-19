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
	onClose: () => void;
	onSuccess?: () => void;
	isAdmin: boolean;
}

export const DuplicateSynthDialog = ({
	originalSynth,
	isOpen,
	onOpenChange,
	onSuccess,
	onClose,
}: DuplicateSynthDialogProps) => {

	const handleSuccess = () => {
		if (onSuccess) {
			onSuccess();
		}
	onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className=" text-white">Dupliquer le synthétiseur</DialogTitle>
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
