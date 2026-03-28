import type { PropsWithChildren } from "react";
import { cn } from "../lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-2xl bg-white p-5 shadow-lift ring-1 ring-slate-100", className)}>{children}</div>;
}
