import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-full p-12 mx-auto w-fit">
          <ApperIcon 
            name="FileQuestion" 
            size={80} 
            className="text-slate-400"
          />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-slate-700">
            Page Not Found
          </h2>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            onClick={() => navigate("/")}
            size="lg"
            className="px-8"
          >
            <ApperIcon name="Home" size={20} className="mr-2" />
            Go Home
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            size="lg"
            className="px-8"
          >
            <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
            Go Back
          </Button>
        </div>
        
        <div className="pt-8 text-sm text-slate-500">
          <p>Need help? Try searching for your tasks or browse categories from the sidebar.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;