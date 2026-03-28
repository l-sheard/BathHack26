import type { PropsWithChildren } from "react";
import { cn } from "../lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-violet-400/25 bg-[#0a041c]/78 p-5 shadow-lift backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-violet-300/12 before:to-transparent before:content-['']",
        "relative overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
