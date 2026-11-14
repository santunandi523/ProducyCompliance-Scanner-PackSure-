import api from "./api";
import { mockViolations } from "./mockData";

export const violationService = {
  async getAllViolations(status) {
    try {
      const url = status ? `/violations?status=${status}` : "/violations";
      const res = await api.get(url);
      if (res?.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    return status ? mockViolations.filter((v) => v.status === status) : mockViolations;
  },

  async confirmViolation(id, notes) {
    try {
      const res = await api.post(`/violations/${id}/confirm`, { notes });
      return res.data;
    } catch {
      return { id, status: "CONFIRMED", notes };
    }
  },

  async rejectViolation(id, notes) {
    try {
      const res = await api.post(`/violations/${id}/reject`, { notes });
      return res.data;
    } catch {
      return { id, status: "DISMISSED", notes };
    }
  },

  async reviewViolation(id, notes) {
    try {
      const res = await api.post(`/violations/${id}/review`, { notes });
      return res.data;
    } catch {
      return { id, status: "UNDER_REVIEW", notes };
    }
  },
};
