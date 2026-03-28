import type { MouseEvent, PropsWithChildren } from "react";

export function Modal({ open, onClose, children }: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0b1426]/90 p-6 shadow-lift backdrop-blur-xl"
        onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
