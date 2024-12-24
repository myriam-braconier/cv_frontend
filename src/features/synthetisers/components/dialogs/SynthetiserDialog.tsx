"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogContent} from "@/components/ui/dialog";
import { EditorForm } from "@/features/synthetisers/components/editor/EditorForm";
import { Synth } from "@/types/synth";

interface SynthesiserDialogProps {
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
 synthetiser: Synth;
 onSubmit: (data: Partial<Synth>) => Promise<void>;
 isUpdating: boolean;
 updateError: string | null;
}

export const SynthesiserDialog = ({
  isOpen,
  onOpenChange,
  synthetiser,
  onSubmit,
  isUpdating,
  updateError
 }: SynthesiserDialogProps) => (
  <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <h2 className="text-lg font-semibold mb-4">Édition du synthétiseur</h2>
      <EditorForm
        synth={synthetiser}
        onSubmit={onSubmit}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onCancel={() => onOpenChange(false)}
        isLoading={isUpdating}
        error={updateError}
      />
    </DialogContent>
  </Dialog.Root>
 );
 

export default SynthesiserDialog;