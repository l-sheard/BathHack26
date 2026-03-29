import type { PropsWithChildren } from "react";
import { cn } from "../lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "card",
        "rounded-3xl border border-violet-400/25 p-5 shadow-lift backdrop-blur-xl relative overflow-hidden",
        "bg-[#0a041c]/78 dark:bg-[#0a041c]/78",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-violet-300/12 before:to-transparent before:content-[''] dark:before:block",
        "[data-theme=light] & bg-transparent !important",
        "[data-theme=light] & before:hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
