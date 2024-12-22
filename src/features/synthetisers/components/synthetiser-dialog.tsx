"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SynthEditor } from "@/features/synthetisers/components/SynthEditor";
import { Synth } from "@/types/synth";

interface SynthesizerDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    synthetiser: Synth;
    onSubmit: (data: Partial<Synth>) => void;
    isUpdating: boolean;
    updateError: string | null; // Changé ici de unknown à string | null
}

export function SynthesizerDialog({
    isOpen,
    onOpenChange,
    synthetiser,
    onSubmit,
    isUpdating,
    updateError
}: SynthesizerDialogProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <Dialog.Title className="text-lg font-semibold mb-4">
                    Édition du synthétiseur
                </Dialog.Title>
               
                <Dialog.Description className="text-sm text-gray-500 mb-6">
                    Formulaire de modification du synthétiseur
                </Dialog.Description>

                <SynthEditor
                    synth={synthetiser}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isLoading={isUpdating}
                    error={updateError}
                />
            </DialogContent>
        </Dialog.Root>
    );
}