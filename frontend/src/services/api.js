import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const workflowApi = {
  getStats: () => api.get("/workflows/stats"),
  getTemplates: () => api.get("/workflows/templates"),
  getRecentWorkflows: () => api.get("/workflows/recent"),
  getWorkflows: (params = {}) => api.get("/workflows", { params }),
  createWorkflow: (payload) => api.post("/workflows", payload),
};
