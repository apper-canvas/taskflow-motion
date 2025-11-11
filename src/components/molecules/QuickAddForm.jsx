import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import FormField from "@/components/molecules/FormField";

const QuickAddForm = ({ onSubmit, categories = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    categoryId: "personal"
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        dueDate: formData.dueDate || null
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        categoryId: "personal"
      });
      setIsExpanded(false);
      
      toast.success("Task created successfully!");
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickAdd = () => {
    if (!formData.title.trim()) {
      setIsExpanded(true);
      return;
    }
    handleSubmit({ preventDefault: () => {} });
  };
  
  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What needs to be done?"
              className="text-base border-white/50 bg-white/80 backdrop-blur-sm"
              onFocus={() => !isExpanded && setIsExpanded(true)}
            />
          </div>
          
          {!isExpanded && (
            <Button
              type="button"
              onClick={handleQuickAdd}
              disabled={isLoading}
              className="px-6"
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add
            </Button>
          )}
        </div>
        
        <motion.div
          initial={false}
          animate={{ 
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="pt-6 space-y-4">
            <FormField label="Description">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add more details (optional)"
                rows={2}
                className="border-white/50 bg-white/80 backdrop-blur-sm"
              />
            </FormField>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Priority">
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="border-white/50 bg-white/80 backdrop-blur-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormField>
              
              <FormField label="Due Date">
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="border-white/50 bg-white/80 backdrop-blur-sm"
                />
              </FormField>
              
              <FormField label="Category">
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="border-white/50 bg-white/80 backdrop-blur-sm"
                >
                  {categories
                    .filter(cat => !["all", "today", "upcoming"].includes(cat.Id))
                    .map(category => (
                      <option key={category.Id} value={category.Id}>
                        {category.name}
                      </option>
                    ))}
                </Select>
              </FormField>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Plus" size={16} className="mr-2" />
                    Create Task
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
                className="px-6 bg-white/80 backdrop-blur-sm border-white/50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </form>
    </Card>
  );
};

export default QuickAddForm;