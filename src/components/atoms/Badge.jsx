import { cn } from "@/utils/cn";

const Badge = ({ 
  children, 
  variant = "default", 
  size = "default",
  className 
}) => {
  const baseStyles = "inline-flex items-center rounded-full font-medium text-white shadow-sm";
  
  const variants = {
    default: "bg-gradient-to-r from-slate-500 to-slate-600",
    high: "bg-gradient-to-r from-red-500 to-red-600",
    medium: "bg-gradient-to-r from-accent-500 to-accent-600", 
    low: "bg-gradient-to-r from-blue-500 to-blue-600",
    success: "bg-gradient-to-r from-green-500 to-green-600"
  };
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    default: "px-3 py-1 text-xs",
    lg: "px-4 py-2 text-sm"
  };
  
  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

export default Badge;