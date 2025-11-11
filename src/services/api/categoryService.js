import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";

export const categoryService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('category_c', {
        fields: [
          {"field": {"Name": "Id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "order_c"}},
          {"field": {"Name": "Tags"}}
        ],
        orderBy: [{"fieldName": "order_c", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Add default system categories that don't come from database
      const systemCategories = [
        {
          Id: "all",
          name_c: "All Tasks",
          color_c: "#14b8a6",
          icon_c: "List",
          order_c: 1
        },
        {
          Id: "today", 
          name_c: "Today",
          color_c: "#f59e0b",
          icon_c: "Calendar",
          order_c: 2
        },
        {
          Id: "upcoming",
          name_c: "Upcoming", 
          color_c: "#3b82f6",
          icon_c: "Clock",
          order_c: 3
        }
      ];

      // Transform database data to match UI expectations
      const dbCategories = response.data?.map(cat => ({
        Id: cat.Id_c,
        name: cat.name_c,
        color: cat.color_c,
        icon: cat.icon_c,
        order: cat.order_c
      })) || [];

      return [...systemCategories, ...dbCategories];

    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      // Handle system categories
      if (["all", "today", "upcoming"].includes(id)) {
        const allCategories = await this.getAll();
        return allCategories.find(cat => cat.Id === id) || null;
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('category_c', id, {
        fields: [
          {"field": {"Name": "Id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "order_c"}},
          {"field": {"Name": "Tags"}}
        ]
      });

      if (!response?.data) {
        return null;
      }

      // Transform to match UI expectations
      return {
        Id: response.data.Id_c,
        name: response.data.name_c,
        color: response.data.color_c,
        icon: response.data.icon_c,
        order: response.data.order_c
      };

    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      return null;
    }
}
};