import { isFuture, isPast, isToday } from "date-fns";
import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Id_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "categoryId_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "Tags"}}
        ],
        orderBy: [{"fieldName": "createdAt_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform database data to match UI expectations
      return response.data?.map(task => ({
        Id: task.Id_c,
        title: task.title_c,
        description: task.description_c,
        priority: task.priority_c,
        dueDate: task.dueDate_c,
        categoryId: task.categoryId_c?.Id || task.categoryId_c,
        completed: task.completed_c,
        createdAt: task.createdAt_c,
        completedAt: task.completedAt_c
      })) || [];

    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('task_c', id, {
        fields: [
          {"field": {"Name": "Id_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "categoryId_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "Tags"}}
        ]
      });

      if (!response?.data) {
        return null;
      }

      // Transform to match UI expectations
      return {
        Id: response.data.Id_c,
        title: response.data.title_c,
        description: response.data.description_c,
        priority: response.data.priority_c,
        dueDate: response.data.dueDate_c,
        categoryId: response.data.categoryId_c?.Id || response.data.categoryId_c,
        completed: response.data.completed_c,
        createdAt: response.data.createdAt_c,
        completedAt: response.data.completedAt_c
      };

    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByCategory(categoryId) {
    try {
      const tasks = await this.getAll();
      
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

    } catch (error) {
      console.error(`Error fetching tasks by category ${categoryId}:`, error?.response?.data?.message || error);
      return [];
    }
  },

  async getOverdue() {
    try {
      const tasks = await this.getAll();
      return tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        return isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
      });

    } catch (error) {
      console.error("Error fetching overdue tasks:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          title_c: taskData.title,
          description_c: taskData.description || "",
          priority_c: taskData.priority || "medium",
          dueDate_c: taskData.dueDate || null,
          categoryId_c: parseInt(taskData.categoryId) || null,
          completed_c: false,
          createdAt_c: new Date().toISOString(),
          completedAt_c: null
        }]
      };

      const response = await apperClient.createRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdTask = successful[0].data;
          return {
            Id: createdTask.Id_c,
            title: createdTask.title_c,
            description: createdTask.description_c,
            priority: createdTask.priority_c,
            dueDate: createdTask.dueDate_c,
            categoryId: createdTask.categoryId_c?.Id || createdTask.categoryId_c,
            completed: createdTask.completed_c,
            createdAt: createdTask.createdAt_c,
            completedAt: createdTask.completedAt_c
          };
        }
      }

      return null;

    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const updatePayload = {
        Id: parseInt(id)
      };

      // Only include updateable fields that have values
      if (updateData.title !== undefined) updatePayload.title_c = updateData.title;
      if (updateData.description !== undefined) updatePayload.description_c = updateData.description;
      if (updateData.priority !== undefined) updatePayload.priority_c = updateData.priority;
      if (updateData.dueDate !== undefined) updatePayload.dueDate_c = updateData.dueDate;
      if (updateData.categoryId !== undefined) updatePayload.categoryId_c = parseInt(updateData.categoryId) || null;
      if (updateData.completed !== undefined) {
        updatePayload.completed_c = updateData.completed;
        updatePayload.completedAt_c = updateData.completed ? new Date().toISOString() : null;
      }

      const params = {
        records: [updatePayload]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedTask = successful[0].data;
          return {
            Id: updatedTask.Id_c,
            title: updatedTask.title_c,
            description: updatedTask.description_c,
            priority: updatedTask.priority_c,
            dueDate: updatedTask.dueDate_c,
            categoryId: updatedTask.categoryId_c?.Id || updatedTask.categoryId_c,
            completed: updatedTask.completed_c,
            createdAt: updatedTask.createdAt_c,
            completedAt: updatedTask.completedAt_c
          };
        }
      }

      return null;

    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }

      return true;

    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      return false;
    }
  },

  async deleteCompleted() {
    try {
      const completedTasks = await this.getAll();
      const completedIds = completedTasks.filter(t => t.completed).map(t => t.Id);
      
      if (completedIds.length === 0) {
        return { deletedCount: 0 };
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: completedIds
      };

      const response = await apperClient.deleteRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return { deletedCount: 0 };
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return { deletedCount: successful.length };
      }

      return { deletedCount: completedIds.length };

    } catch (error) {
      console.error("Error deleting completed tasks:", error?.response?.data?.message || error);
      return { deletedCount: 0 };
    }
  },

  async search(query) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const searchTerm = query.toLowerCase().trim();
      
      if (!searchTerm) {
        return await this.getAll();
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Id_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "categoryId_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "Tags"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [{
            "conditions": [
              {
                "fieldName": "title_c",
                "operator": "Contains",
                "values": [searchTerm]
              },
              {
                "fieldName": "description_c", 
                "operator": "Contains",
                "values": [searchTerm]
              }
            ],
            "operator": "OR"
          }]
        }],
        orderBy: [{"fieldName": "createdAt_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform database data to match UI expectations
      return response.data?.map(task => ({
        Id: task.Id_c,
        title: task.title_c,
        description: task.description_c,
        priority: task.priority_c,
        dueDate: task.dueDate_c,
        categoryId: task.categoryId_c?.Id || task.categoryId_c,
        completed: task.completed_c,
        createdAt: task.createdAt_c,
        completedAt: task.completedAt_c
      })) || [];

} catch (error) {
      console.error("Error searching tasks:", error?.response?.data?.message || error);
      return [];
    }
  }
};