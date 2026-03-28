import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "orange" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "slate" && "bg-slate-100 text-slate-700",
        tone === "green" && "bg-emerald-100 text-emerald-700",
        tone === "orange" && "bg-orange-100 text-orange-700"
      )}
    >
      {children}
    </span>
  );
}
