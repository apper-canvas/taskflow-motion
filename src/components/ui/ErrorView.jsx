import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const ErrorView = ({ 
  title = "Something went wrong", 
  message = "We couldn't load your tasks. Please try again.", 
  onRetry,
  showRetry = true 
}) => {
  return (
    <motion.div 
      className="min-h-[400px] flex flex-col items-center justify-center text-center p-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-full p-6 mb-6">
        <ApperIcon 
          name="AlertTriangle" 
          size={48} 
          className="text-red-500"
        />
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        {title}
      </h3>
      
      <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
        {message}
      </p>
      
      {showRetry && onRetry && (
        <div className="flex gap-3">
          <Button onClick={onRetry} className="px-6 py-3">
            <ApperIcon name="RotateCcw" size={16} className="mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="px-6 py-3"
          >
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Refresh Page
          </Button>
        </div>
      )}
      
      <div className="mt-8 text-sm text-slate-500">
        <p>If the problem persists, try refreshing the page or check your internet connection.</p>
      </div>
    </motion.div>
  );
};

export default ErrorView;