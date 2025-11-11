import categoriesData from "@/services/mockData/categories.json";

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  async getAll() {
    await delay();
    return [...categoriesData];
  },

  async getById(id) {
    await delay();
    const category = categoriesData.find(c => c.Id === id);
    return category ? { ...category } : null;
  }
};