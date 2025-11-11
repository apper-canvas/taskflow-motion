import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import QuickAddForm from "@/components/molecules/QuickAddForm";
import FilterBar from "@/components/molecules/FilterBar";
import TaskList from "@/components/organisms/TaskList";
import { taskService } from "@/services/api/taskService";
import { categoryService } from "@/services/api/categoryService";

const Dashboard = () => {
  const { categoryId = "all" } = useParams();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all", 
    sort: "created"
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  
  useEffect(() => {
    loadCategories();
    loadCompletedCount();
  }, [refreshKey]);
  
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };
  
  const loadCompletedCount = async () => {
    try {
      const tasks = await taskService.getAll();
      const completed = tasks.filter(task => task.completed).length;
      setCompletedCount(completed);
    } catch (error) {
      console.error("Failed to load completed count:", error);
    }
  };
  
  const handleCreateTask = async (taskData) => {
    await taskService.create(taskData);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleTaskUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleClearCompleted = async () => {
    if (!window.confirm(`Delete ${completedCount} completed tasks permanently?`)) {
      return;
    }
    
    try {
      const result = await taskService.deleteCompleted();
      toast.success(`${result.deletedCount} completed tasks deleted`);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to delete completed tasks");
    }
  };
  
  const handleEditTask = (task) => {
    // For simplicity, we'll just show a toast for now
    // In a real app, this would open an edit modal
    toast.info("Edit functionality would open a modal here");
  };
  
  return (
    <div className="space-y-6">
      <QuickAddForm 
        onSubmit={handleCreateTask}
        categories={categories}
      />
      
      <FilterBar
        onSearch={setSearchQuery}
        onFilter={setFilters}
        onClearCompleted={handleClearCompleted}
        completedCount={completedCount}
      />
      
      <TaskList
        key={refreshKey}
        categoryId={categoryId}
        searchQuery={searchQuery}
        filters={filters}
        onTaskUpdate={handleTaskUpdate}
        onEdit={handleEditTask}
      />
    </div>
  );
};

export default Dashboard;