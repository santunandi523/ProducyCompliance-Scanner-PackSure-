import api from "./api";
import {
  mockDashboardSummary,
  mockViolationCategories,
  mockRecentInspections,
  mockHealth,
} from "./mockData";

export const dashboardService = {
  async getSummary() {
    try {
      const res = await api.get("/dashboard/summary");
      if (res?.data) return res.data;
    } catch {
      // Return simulation data in Standalone / Cloud Demo mode
    }
    return mockDashboardSummary;
  },

  async getViolationCategories() {
    try {
      const res = await api.get("/dashboard/violations");
      if (res?.data) return res.data;
    } catch {
      // Return simulation data
    }
    return mockViolationCategories;
  },

  async getRecentInspections() {
    try {
      const res = await api.get("/dashboard/recent");
      if (res?.data) return res.data;
    } catch {
      // Return simulation data
    }
    return mockRecentInspections;
  },

  async getHealth() {
    try {
      const res = await api.get("/health");
      if (res?.data) return res.data;
    } catch {
      // Return simulation data
    }
    return mockHealth;
  },
};
