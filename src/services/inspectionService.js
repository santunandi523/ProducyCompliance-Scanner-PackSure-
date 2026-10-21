import api from "./api";

export const inspectionService = {
  async createInspection(location) {
    const res = await api.post("/inspections", { location });
    return res.data;
  },

  async uploadImage(inspectionId, file, imageType = "PRIMARY") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("imageType", imageType);

    const res = await api.post(`/inspections/${inspectionId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async uploadImagesBatch(inspectionId, files) {
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await api.post(`/inspections/${inspectionId}/images/batch`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      // Fallback: If backend was not restarted and /images/batch returns 404, upload individually
      console.warn("Batch upload 404 fallback trigger:", err);
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const sideTag = i === 0 ? "FRONT" : (i === 1 ? "BACK" : `SIDE_${i + 1}`);
        const img = await this.uploadImage(inspectionId, files[i], sideTag);
        results.push(img);
      }
      return results;
    }
  },

  async analyzeInspection(inspectionId) {
    const res = await api.post(`/inspections/${inspectionId}/analyze`);
    return res.data;
  },

  async getInspectionResults(inspectionId) {
    const res = await api.get(`/inspections/${inspectionId}/results`);
    return res.data;
  },

  async listInspections() {
    const res = await api.get("/inspections");
    return res.data || [];
  },

  async verifyDeclaration(declarationId, officerValue, officerVerified) {
    const res = await api.post(`/declarations/${declarationId}/verify`, {
      officerValue,
      officerVerified,
    });
    return res.data;
  },

  async updateDeclaration(declarationId, officerValue, officerVerified) {
    const res = await api.put(`/declarations/${declarationId}`, {
      officerValue,
      officerVerified,
    });
    return res.data;
  },

  async finalizeInspection(inspectionId, remarks, finalStatus) {
    const res = await api.post(`/inspections/${inspectionId}/finalize`, {
      remarks,
      finalStatus,
    });
    return res.data;
  },

  async generateReport(inspectionId) {
    const res = await api.post(`/inspections/${inspectionId}/report`);
    return res.data;
  },

  getReportDownloadUrl(reportId) {
    return `http://localhost:8081/api/reports/${reportId}/download`;
  },

  async verifyReport(reportId) {
    const res = await api.get(`/reports/${reportId}/verify`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get("/product-categories");
    return res.data || [];
  },

  async updateCategory(inspectionId, category, productType = null, source = "MANUAL") {
    const res = await api.patch(`/inspections/${inspectionId}/category`, {
      category,
      productType,
      source,
    });
    return res.data;
  },

  async recalculateCompliance(inspectionId) {
    const res = await api.post(`/inspections/${inspectionId}/recalculate-compliance`);
    return res.data;
  },

  async getApplicableRules(inspectionId) {
    const res = await api.get(`/inspections/${inspectionId}/applicable-rules`);
    return res.data || [];
  },
};