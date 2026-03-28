import type { MouseEvent, PropsWithChildren } from "react";

export function Modal({ open, onClose, children }: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6" onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
