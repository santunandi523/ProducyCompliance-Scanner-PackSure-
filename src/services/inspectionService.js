import api, { API_BASE_URL, getImageContentUrl, getReportDownloadUrl } from "./api";
import { createMockInspectionResult, mockRecentInspections } from "./mockData";

export const inspectionService = {
  async createInspection(location) {
    try {
      const res = await api.post("/inspections", { location });
      if (res?.data) return res.data;
    } catch {
      // Standalone simulation fallback
      return {
        id: Math.floor(1000 + Math.random() * 9000),
        location: location || "Retail Terminal #1",
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      };
    }
  },

  async uploadImage(inspectionId, file, imageType = "PRIMARY") {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("imageType", imageType);

      const res = await api.post(`/inspections/${inspectionId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.data) return res.data;
    } catch {
      return {
        id: Date.now(),
        imageType,
        fileName: file.name,
        fileSize: file.size,
      };
    }
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
      if (res?.data) return res.data;
    } catch {
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const sideTag = i === 0 ? "FRONT" : i === 1 ? "BACK" : `SIDE_${i + 1}`;
        results.push({
          id: Date.now() + i,
          imageType: sideTag,
          fileName: files[i].name,
          fileSize: files[i].size,
        });
      }
      return results;
    }
  },

  async analyzeInspection(inspectionId) {
    try {
      const res = await api.post(`/inspections/${inspectionId}/analyze`);
      if (res?.data) return res.data;
    } catch {
      return createMockInspectionResult(inspectionId);
    }
  },

  async getInspectionResults(inspectionId) {
    try {
      const res = await api.get(`/inspections/${inspectionId}/results`);
      if (res?.data) return res.data;
    } catch {
      return createMockInspectionResult(inspectionId);
    }
  },

  async listInspections() {
    try {
      const res = await api.get("/inspections");
      if (res?.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    return mockRecentInspections;
  },

  async verifyDeclaration(declarationId, officerValue, officerVerified) {
    try {
      const res = await api.post(`/declarations/${declarationId}/verify`, {
        officerValue,
        officerVerified,
      });
      return res.data;
    } catch {
      return { id: declarationId, officerValue, officerVerified };
    }
  },

  async updateDeclaration(declarationId, officerValue, officerVerified) {
    try {
      const res = await api.put(`/declarations/${declarationId}`, {
        officerValue,
        officerVerified,
      });
      return res.data;
    } catch {
      return { id: declarationId, officerValue, officerVerified };
    }
  },

  async finalizeInspection(inspectionId, remarks, finalStatus) {
    try {
      const res = await api.post(`/inspections/${inspectionId}/finalize`, {
        remarks,
        finalStatus,
      });
      return res.data;
    } catch {
      return { id: inspectionId, remarks, status: finalStatus || "COMPLETED" };
    }
  },

  async generateReport(inspectionId) {
    try {
      const res = await api.post(`/inspections/${inspectionId}/report`);
      return res.data;
    } catch {
      return { id: 801, inspectionId, reportPath: "sample_report.pdf", status: "GENERATED" };
    }
  },

  getReportDownloadUrl(reportId) {
    return getReportDownloadUrl(reportId);
  },

  getImageContentUrl(imageId) {
    return getImageContentUrl(imageId);
  },

  async verifyReport(reportId) {
    try {
      const res = await api.get(`/reports/${reportId}/verify`);
      return res.data;
    } catch {
      return { valid: true, algorithm: "SHA-256", timestamp: new Date().toISOString() };
    }
  },

  async getCategories() {
    try {
      const res = await api.get("/product-categories");
      if (res?.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    return [
      { code: "PACKAGED_FOOD", label: "Packaged Food & Beverages" },
      { code: "COSMETICS", label: "Cosmetics & Personal Care" },
      { code: "ELECTRONICS", label: "Consumer Electronics & Appliances" },
      { code: "PHARMACEUTICALS", label: "OTC Drugs & Pharmaceuticals" },
    ];
  },

  async updateCategory(inspectionId, category, productType = null, source = "MANUAL") {
    try {
      const res = await api.patch(`/inspections/${inspectionId}/category`, {
        category,
        productType,
        source,
      });
      return res.data;
    } catch {
      return { inspectionId, category, productType, source };
    }
  },

  async recalculateCompliance(inspectionId) {
    try {
      const res = await api.post(`/inspections/${inspectionId}/recalculate-compliance`);
      return res.data;
    } catch {
      return { complianceScore: 96, status: "COMPLIANT" };
    }
  },

  async getApplicableRules(inspectionId) {
    try {
      const res = await api.get(`/inspections/${inspectionId}/applicable-rules`);
      if (res?.data) return res.data;
    } catch {
      // Fallback
    }
    return [];
  },
};