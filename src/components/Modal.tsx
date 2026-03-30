import type { MouseEvent, PropsWithChildren } from "react";

export function Modal({
  open,
  onClose,
  children,
}: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-[#FAFAFD]/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="modal w-full max-w-lg p-6"
        onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
