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
        "inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "ghost" && "btn-ghost",
        "rounded-button shadow-button focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-30",
        "hover:-translate-y-0.5 hover:shadow-[0_4px_16px_#8B5CF633]",
        className,
      )}
      {...props}
    />
  );
});
