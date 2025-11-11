import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

const Card = forwardRef(({
  className,
  children,
  hover = true,
  ...props
}, ref) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" } : {}}
      transition={{ duration: 0.2 }}
      ref={ref}
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200",
        hover && "hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = "Card";

export default Card;