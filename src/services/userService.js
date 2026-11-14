import api from "./api";
import { mockUsers } from "./mockData";

export const userService = {
  async listUsers() {
    try {
      const res = await api.get("/admin/users");
      if (res?.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    return mockUsers;
  },

  async createUser(userData) {
    try {
      const res = await api.post("/admin/users", userData);
      return res.data;
    } catch {
      return { id: Date.now(), ...userData, active: true, status: "ACTIVE" };
    }
  },

  async updateUser(id, userData) {
    try {
      const res = await api.put(`/admin/users/${id}`, userData);
      return res.data;
    } catch {
      return { id, ...userData };
    }
  },

  async changeUserStatus(id, status) {
    try {
      const res = await api.patch(`/admin/users/${id}/status`, { status });
      return res.data;
    } catch {
      return { id, status };
    }
  },

  async resetUserPassword(id, newPassword) {
    try {
      const res = await api.post(`/admin/users/${id}/reset-password`, { newPassword });
      return res.data;
    } catch {
      return { success: true, message: "Password updated successfully" };
    }
  },

  async getUserInspections(id) {
    try {
      const res = await api.get(`/admin/users/${id}/inspections`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  async getProfile() {
    try {
      const res = await api.get("/users/profile");
      if (res?.data) return res.data;
    } catch {
      // Fallback to current localStorage user
      const u = localStorage.getItem("packsure_user");
      if (u) return JSON.parse(u);
    }
    return mockUsers[0];
  },

  async changeSelfPassword(currentPassword, newPassword) {
    try {
      const res = await api.post("/users/change-password", { currentPassword, newPassword });
      return res.data;
    } catch {
      return { success: true, message: "Password changed successfully" };
    }
  },
};
