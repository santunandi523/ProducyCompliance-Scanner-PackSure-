import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

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
        message = "Cannot connect to backend server (http://localhost:8081). Please ensure Spring Boot backend and database are running.";
      } else {
        message = error.message || "Document analysis or server error";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
