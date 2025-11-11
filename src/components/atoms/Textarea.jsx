import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Textarea = forwardRef(({
  className,
  error,
  rows = 3,
  ...props
}, ref) => {
  return (
    <textarea
      rows={rows}
      className={cn(
        "flex w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 resize-none",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        "placeholder:text-slate-400",
        error 
          ? "border-red-300 focus:ring-red-500" 
          : "border-slate-300 hover:border-slate-400",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;