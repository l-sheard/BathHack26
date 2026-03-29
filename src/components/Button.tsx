import { forwardRef } from "react";
import { cn } from "../lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-ocean to-mint text-white shadow-glow hover:scale-[1.02] hover:brightness-105",
        variant === "secondary" &&
          "bg-gradient-to-r from-coral to-[#a855f7] text-white shadow-[0_10px_24px_rgba(249,115,255,0.32)] hover:scale-[1.02]",
        variant === "ghost" &&
          "border border-violet-300/20 bg-white/5 text-ink backdrop-blur-xl hover:bg-violet-400/10 hover:shadow-[0_10px_24px_rgba(124,58,237,0.26)]",
        className,
      )}
      {...props}
    />
  );
});
