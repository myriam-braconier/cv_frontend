"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";

const DialogContent = forwardRef<HTMLDivElement, Dialog.DialogContentProps>(
  ({ children, ...props }, ref) => (
    <Dialog.Portal>
      <Dialog.Overlay
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out"
      />
      <Dialog.Content
        ref={ref}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out"
        {...props}
      >
        {children}
        <Dialog.Close asChild>
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
);

DialogContent.displayName = "DialogContent";

export { Dialog, DialogContent };