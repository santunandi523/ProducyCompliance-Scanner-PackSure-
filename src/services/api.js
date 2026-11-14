import axios from "axios";

// Determine API base URL:
// 1. Explicit VITE_API_BASE_URL or VITE_API_URL if configured
// 2. If running on same origin in production (e.g. Spring Boot single-project bundle on port 8081 or cloud container), use relative /api
// 3. Fallback to local Spring Boot URL for Vite dev server (port 5173)
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    const trimmed = String(envUrl).trim().replace(/\/+$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }

  if (typeof window !== "undefined" && window.location) {
    const isViteDev = window.location.port === "5173" || window.location.port === "3000";
    if (!isViteDev && window.location.origin && window.location.origin !== "null") {
      // Single-project JAR deployment or reverse-proxied production bundle
      return `${window.location.origin.replace(/\/+$/, "")}/api`;
    }
  }

  return "http://localhost:8081/api";
};

export const API_BASE_URL = getBaseUrl();

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
        const isCloudHost =
          typeof window !== "undefined" &&
          window.location &&
          !["localhost", "127.0.0.1"].includes(window.location.hostname);

        if (isCloudHost && API_BASE_URL.includes("localhost")) {
          message = `Cannot reach backend: The frontend is deployed to the cloud (${window.location.origin}), but is attempting to call "${API_BASE_URL}". Cloud deployments cannot reach your computer's "localhost". Add VITE_API_BASE_URL in your Vercel project environment variables (or tunnel via ngrok) to connect your live backend.`;
        } else {
          message = `Cannot connect to backend server (${API_BASE_URL}). Please ensure PostgreSQL, AI service, and Spring Boot are running and reachable.`;
        }
      } else {
        message = error.message || "Document analysis or server error";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
