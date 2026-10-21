import api from "./api";

export const dashboardService = {
  async getSummary() {
    const res = await api.get("/dashboard/summary");
    return res.data;
  },

  async getViolationCategories() {
    const res = await api.get("/dashboard/violations");
    return res.data || [];
  },

  async getRecentInspections() {
    const res = await api.get("/dashboard/recent");
    return res.data || [];
  },

  async getHealth() {
    const res = await api.get("/health");
    return res.data;
  },
};
