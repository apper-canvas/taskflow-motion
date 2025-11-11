import tasksData from "@/services/mockData/tasks.json";
import { isToday, isFuture, isPast } from "date-fns";

// Initialize localStorage with mock data if not exists
const STORAGE_KEY = "taskflow_tasks";

const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksData));
  }
};

const getStoredTasks = () => {
  initializeLocalStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveTasksToStorage = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  async getAll() {
    await delay();
    return [...getStoredTasks()];
  },

  async getById(id) {
    await delay();
    const tasks = getStoredTasks();
    const task = tasks.find(t => t.Id === parseInt(id));
    return task ? { ...task } : null;
  },

  async getByCategory(categoryId) {
    await delay();
    const tasks = getStoredTasks();
    
    if (categoryId === "all") {
      return [...tasks];
    }
    
    if (categoryId === "today") {
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        return isToday(new Date(task.dueDate));
      });
    }
    
    if (categoryId === "upcoming") {
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return isFuture(dueDate) && !isToday(dueDate);
      });
    }
    
    return tasks.filter(task => task.categoryId === categoryId);
  },

  async getOverdue() {
    await delay();
    const tasks = getStoredTasks();
    return tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      return isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
    });
  },

  async create(taskData) {
    await delay();
    const tasks = getStoredTasks();
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0;
    
    const newTask = {
      Id: maxId + 1,
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      dueDate: taskData.dueDate || null,
      categoryId: taskData.categoryId || "personal",
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    const updatedTasks = [...tasks, newTask];
    saveTasksToStorage(updatedTasks);
    return { ...newTask };
  },

  async update(id, updateData) {
    await delay();
    const tasks = getStoredTasks();
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id));
    
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...updateData,
      Id: parseInt(id) // Ensure ID remains integer
    };
    
    // Handle completion status
    if (updateData.completed !== undefined) {
      updatedTask.completedAt = updateData.completed 
        ? new Date().toISOString() 
        : null;
    }
    
    tasks[taskIndex] = updatedTask;
    saveTasksToStorage(tasks);
    return { ...updatedTask };
  },

  async delete(id) {
    await delay();
    const tasks = getStoredTasks();
    const filteredTasks = tasks.filter(t => t.Id !== parseInt(id));
    
    if (filteredTasks.length === tasks.length) {
      throw new Error("Task not found");
    }
    
    saveTasksToStorage(filteredTasks);
    return { success: true };
  },

  async deleteCompleted() {
    await delay();
    const tasks = getStoredTasks();
    const activeTasks = tasks.filter(t => !t.completed);
    saveTasksToStorage(activeTasks);
    return { deletedCount: tasks.length - activeTasks.length };
  },

  async search(query) {
    await delay();
    const tasks = getStoredTasks();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return [...tasks];
    }
    
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
  }
};