import { forwardRef } from "react";
import { cn } from "../lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-ocean text-white hover:bg-teal-700",
        variant === "secondary" && "bg-coral text-white hover:bg-orange-600",
        variant === "ghost" && "bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50",
        className
      )}
      {...props}
    />
  );
});
