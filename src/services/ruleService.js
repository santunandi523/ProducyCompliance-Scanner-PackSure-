import api from "./api";

export const ruleService = {
  async getAllRules() {
    const res = await api.get("/rules");
    return res.data || [];
  },

  async createRule(rule) {
    const res = await api.post("/rules", rule);
    return res.data;
  },

  async updateRule(id, rule) {
    const res = await api.put(`/rules/${id}`, rule);
    return res.data;
  },

  async activateRule(id) {
    const res = await api.post(`/rules/${id}/activate`);
    return res.data;
  },

  async deactivateRule(id) {
    const res = await api.post(`/rules/${id}/deactivate`);
    return res.data;
  },

  async testRule(ruleCode, sampleValue) {
    const res = await api.post("/rules/test", { ruleCode, sampleValue });
    return res.data;
  },

  async getRuleHistory(id) {
    const res = await api.get(`/rules/${id}/history`);
    return res.data || [];
  },
};
