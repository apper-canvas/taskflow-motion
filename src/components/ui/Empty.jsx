import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No tasks yet", 
  message = "Create your first task to get started with TaskFlow.", 
  onAction,
  actionLabel = "Add Task",
  icon = "CheckSquare"
}) => {
  return (
    <motion.div 
      className="min-h-[400px] flex flex-col items-center justify-center text-center p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-full p-8 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <ApperIcon 
            name={icon} 
            size={64} 
            className="text-primary-500"
          />
        </motion.div>
      </div>
      
      <motion.h3 
        className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        className="text-slate-600 mb-8 max-w-md leading-relaxed text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {message}
      </motion.p>
      
      {onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={onAction} size="lg" className="px-8 py-4">
            <ApperIcon name="Plus" size={20} className="mr-2" />
            {actionLabel}
          </Button>
        </motion.div>
      )}
      
      <motion.div 
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mb-3">
            <ApperIcon name="Plus" size={24} className="text-green-600 mx-auto" />
          </div>
          <p className="text-sm font-medium text-slate-700">Quick Add</p>
          <p className="text-xs text-slate-500 mt-1">Create tasks instantly</p>
        </div>
        
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-3">
            <ApperIcon name="Tag" size={24} className="text-blue-600 mx-auto" />
          </div>
          <p className="text-sm font-medium text-slate-700">Organize</p>
          <p className="text-xs text-slate-500 mt-1">Sort by categories</p>
        </div>
        
        <div className="text-center">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-3">
            <ApperIcon name="CheckCircle" size={24} className="text-purple-600 mx-auto" />
          </div>
          <p className="text-sm font-medium text-slate-700">Complete</p>
          <p className="text-xs text-slate-500 mt-1">Track progress</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Empty;