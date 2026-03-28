import { forwardRef } from "react";
import { cn } from "../lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none backdrop-blur",
        "placeholder:text-slate-500 focus:border-ocean/60 focus:ring-4 focus:ring-ocean/20",
        className
      )}
      {...props}
    />
  );
});
