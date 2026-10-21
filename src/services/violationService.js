import api from "./api";

export const violationService = {
  async getAllViolations(status) {
    const url = status ? `/violations?status=${status}` : "/violations";
    const res = await api.get(url);
    return res.data || [];
  },

  async confirmViolation(id, notes) {
    const res = await api.post(`/violations/${id}/confirm`, { notes });
    return res.data;
  },

  async rejectViolation(id, notes) {
    const res = await api.post(`/violations/${id}/reject`, { notes });
    return res.data;
  },

  async reviewViolation(id, notes) {
    const res = await api.post(`/violations/${id}/review`, { notes });
    return res.data;
  },
};
