import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { categoryService } from "@/services/api/categoryService";
import { taskService } from "@/services/api/taskService";

const Sidebar = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadCategories();
    loadTaskCounts();
  }, []);
  
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTaskCounts = async () => {
    try {
      const allTasks = await taskService.getAll();
      const activeTasks = allTasks.filter(task => !task.completed);
      
      const counts = {
        all: activeTasks.length,
        today: (await taskService.getByCategory("today")).filter(t => !t.completed).length,
        upcoming: (await taskService.getByCategory("upcoming")).filter(t => !t.completed).length,
        work: activeTasks.filter(t => t.categoryId === "work").length,
        personal: activeTasks.filter(t => t.categoryId === "personal").length,
        shopping: activeTasks.filter(t => t.categoryId === "shopping").length
      };
      
      setTaskCounts(counts);
    } catch (error) {
      console.error("Failed to load task counts:", error);
    }
  };
  
  // Reload task counts when tasks change
  useEffect(() => {
    const interval = setInterval(loadTaskCounts, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
            <ApperIcon name="CheckSquare" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-sm text-slate-500">Stay organized</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {categories.map((category) => (
            <NavLink
              key={category.Id}
              to={category.Id === "all" ? "/" : `/${category.Id}`}
              onClick={() => onClose?.()}
              className={({ isActive }) => cn(
                "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <ApperIcon 
                  name={category.icon} 
                  size={20}
                  className="transition-transform group-hover:scale-110"
                />
                <span className="font-medium">{category.name}</span>
              </div>
              
              {taskCounts[category.Id] !== undefined && taskCounts[category.Id] > 0 && (
                <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {taskCounts[category.Id]}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ApperIcon name="TrendingUp" size={20} className="text-primary-600" />
            <span className="font-medium text-slate-700">Productivity</span>
          </div>
          <p className="text-sm text-slate-600">
            Keep up the great work! You're staying organized and getting things done.
          </p>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
        <SidebarContent />
      </div>
      
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;