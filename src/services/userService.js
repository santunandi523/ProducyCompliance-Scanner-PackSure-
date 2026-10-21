import api from "./api";

export const userService = {
  async listUsers() {
    const res = await api.get("/admin/users");
    return res.data || [];
  },

  async createUser(userData) {
    const res = await api.post("/admin/users", userData);
    return res.data;
  },

  async updateUser(id, userData) {
    const res = await api.put(`/admin/users/${id}`, userData);
    return res.data;
  },

  async changeUserStatus(id, status) {
    const res = await api.patch(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  async resetUserPassword(id, newPassword) {
    const res = await api.post(`/admin/users/${id}/reset-password`, { newPassword });
    return res.data;
  },

  async changeSelfPassword(currentPassword, newPassword) {
    const res = await api.post("/auth/change-password", { currentPassword, newPassword });
    return res.data;
  },
};
