import axios from "axios";

// Normalize API base URL: supports VITE_API_BASE_URL, VITE_API_URL or defaults to http://localhost:8081/api
let rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8081/api";
rawBase = String(rawBase).trim().replace(/\/+$/, "");
export const API_BASE_URL = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

export const getImageContentUrl = (imageId) => {
  if (!imageId) return "";
  return `${API_BASE_URL}/inspections/images/${imageId}/content`;
};

export const getReportDownloadUrl = (reportId) => {
  if (!reportId) return "";
  return `${API_BASE_URL}/reports/${reportId}/download`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("packsure_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem("packsure_token");
      localStorage.removeItem("packsure_user");
    }

    let message = error.response?.data?.message;

    if (!message) {
      if (error.response?.status === 403) {
        message = "Authentication required or session expired (403 Forbidden). Please log out and log in again.";
      } else if (error.response?.status === 401) {
        message = "Unauthorized (401). Please log in with valid officer credentials.";
      } else if (error.message === "Network Error" || !error.response) {
        message = `Cannot connect to backend server (${API_BASE_URL}). Please ensure backend service and database are running and reachable.`;
      } else {
        message = error.message || "Document analysis or server error";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
