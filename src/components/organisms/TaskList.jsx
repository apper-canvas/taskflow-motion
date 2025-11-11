import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import TaskCard from "@/components/molecules/TaskCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { taskService } from "@/services/api/taskService";

const TaskList = ({ 
  categoryId = "all", 
  searchQuery = "", 
  filters = {},
  onTaskUpdate,
  onEdit 
}) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    loadTasks();
  }, [categoryId, searchQuery, filters]);
  
  const loadTasks = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      let data;
      
      if (searchQuery) {
        data = await taskService.search(searchQuery);
      } else {
        data = await taskService.getByCategory(categoryId);
      }
      
      // Apply filters
      let filteredTasks = [...data];
      
      if (filters.status === "active") {
        filteredTasks = filteredTasks.filter(task => !task.completed);
      } else if (filters.status === "completed") {
        filteredTasks = filteredTasks.filter(task => task.completed);
      }
      
      if (filters.priority && filters.priority !== "all") {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }
      
      // Sort tasks
      filteredTasks.sort((a, b) => {
        switch (filters.sort) {
          case "dueDate":
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          case "priority":
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case "title":
            return a.title.localeCompare(b.title);
          default: // created
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
      
      // Separate completed and active tasks, but keep completed tasks visible
      const activeTasks = filteredTasks.filter(task => !task.completed);
      const completedTasks = filteredTasks.filter(task => task.completed);
      
      setTasks([...activeTasks, ...completedTasks]);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleComplete = async (id, completed) => {
    try {
      await taskService.update(id, { completed });
      await loadTasks();
      onTaskUpdate?.();
      
      toast.success(
        completed ? "Task completed! 🎉" : "Task marked as active"
      );
    } catch (err) {
      toast.error("Failed to update task");
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    try {
      await taskService.delete(id);
      await loadTasks();
      onTaskUpdate?.();
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };
  
  if (isLoading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadTasks} />;
  if (tasks.length === 0) {
    return (
      <Empty
        title={searchQuery ? "No matching tasks" : "No tasks yet"}
        message={
          searchQuery 
            ? `No tasks found matching "${searchQuery}". Try adjusting your search.`
            : "Create your first task to get started with TaskFlow."
        }
        icon={searchQuery ? "Search" : "CheckSquare"}
        actionLabel={searchQuery ? "Clear Search" : "Add Task"}
        onAction={searchQuery ? () => window.location.reload() : undefined}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <motion.div
            key={task.Id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.2,
              delay: index * 0.05,
              layout: { duration: 0.3 }
            }}
          >
            <TaskCard
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;