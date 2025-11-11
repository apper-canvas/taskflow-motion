import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = forwardRef(({
  className,
  children,
  error,
  ...props
}, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-12 w-full rounded-lg border bg-white px-4 py-3 pr-10 text-sm transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "appearance-none cursor-pointer",
          error 
            ? "border-red-300 focus:ring-red-500" 
            : "border-slate-300 hover:border-slate-400",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ApperIcon 
        name="ChevronDown" 
        size={16} 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" 
      />
    </div>
  );
});

Select.displayName = "Select";

export default Select;