import type { PropsWithChildren } from "react";
import { cn } from "../lib/utils";

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "card p-6 relative overflow-hidden",
        "rounded-card border border-border bg-white shadow-card transition-all duration-200",
        "bg-gradient-to-b from-white to-[#FBF8FF]",
        "hover:shadow-[0_16px_48px_0_rgba(139,92,246,0.16)] hover:scale-[1.01]",
        className,
      )}
    >
      {children}
    </div>
  );
}
