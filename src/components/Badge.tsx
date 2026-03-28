import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "orange" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tone === "slate" && "border border-white/15 bg-white/10 text-slate-300",
        tone === "green" && "border border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
        tone === "orange" && "border border-orange-400/30 bg-orange-500/15 text-orange-300"
      )}
    >
      {children}
    </span>
  );
}
