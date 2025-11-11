import { useState } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import SearchBar from "@/components/molecules/SearchBar";

const FilterBar = ({ 
  onSearch,
  onFilter,
  onClearCompleted,
  completedCount = 0,
  className 
}) => {
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    sort: "created"
  });
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };
  
  return (
    <div className={cn("flex flex-col gap-4 mb-6", className)}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar onSearch={onSearch} className="w-full sm:w-80" />
        
        <div className="flex gap-2">
          {completedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCompleted}
              className="text-slate-600 hover:text-red-600 hover:border-red-300"
            >
              <ApperIcon name="Trash2" size={14} className="mr-2" />
              Clear {completedCount} completed
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-32 h-10"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Priority:</label>
          <Select
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="w-32 h-10"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Sort:</label>
          <Select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="w-36 h-10"
          >
            <option value="created">Created Date</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;