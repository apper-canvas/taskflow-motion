import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const TaskCard = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete,
  className 
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const handleToggleComplete = async () => {
    setIsCompleting(true);
    await onToggleComplete(task.Id, !task.completed);
    setIsCompleting(false);
  };
  
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !task.completed;
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  
  return (
    <Card 
      className={cn(
        "p-6 transition-all duration-300",
        task.completed && "opacity-60",
        isCompleting && "task-complete",
        className
      )}
      hover={!task.completed}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleComplete}
          className="mt-1 focus-ring rounded"
          disabled={isCompleting}
        >
          <div className={cn(
            "w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center",
            task.completed 
              ? "bg-gradient-to-r from-primary-500 to-primary-600 border-primary-500" 
              : "border-slate-300 hover:border-primary-500"
          )}>
            <AnimatePresence>
              {task.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <ApperIcon name="Check" size={12} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
        
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold text-slate-900 mb-2 transition-all duration-200",
                task.completed && "line-through text-slate-500"
              )}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={cn(
                  "text-slate-600 text-sm mb-3 leading-relaxed",
                  task.completed && "line-through text-slate-400"
                )}>
                  {task.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Priority Badge */}
              <Badge 
                variant={task.priority} 
                size="sm"
                className="text-xs"
              >
                {task.priority}
              </Badge>
              
              {/* Actions */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="p-2"
                >
                  <ApperIcon name="Edit2" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.Id)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {/* Due Date */}
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-red-600",
                  isDueToday && "text-accent-600",
                  !isOverdue && !isDueToday && "text-slate-500"
                )}>
                  <ApperIcon 
                    name={isOverdue ? "AlertTriangle" : "Calendar"} 
                    size={14} 
                  />
                  <span>
                    {isDueToday ? "Due today" : format(new Date(task.dueDate), "MMM d")}
                  </span>
                </div>
              )}
              
              {/* Category */}
              <div className="flex items-center gap-1 text-slate-500">
                <ApperIcon name="Tag" size={14} />
                <span className="capitalize">{task.categoryId}</span>
              </div>
            </div>
            
            {/* Created Date */}
            <span className="text-slate-400">
              {format(new Date(task.createdAt), "MMM d")}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;