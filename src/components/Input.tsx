import { forwardRef } from "react";
import { cn } from "../lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-3.5 py-2.5 text-sm outline-none",
        "border border-border rounded-input bg-white text-black shadow-input",
        "placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]",
        "transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
});
