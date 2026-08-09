import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, error, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={error || undefined}
    className={cn(
      "flex h-12 w-full rounded-lg border bg-surface-low px-3 py-2 text-sm text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.02)] transition-colors placeholder:text-outline focus-visible:bg-surface-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60",
      error ? "border-error focus-visible:ring-error/30" : "border-transparent",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
