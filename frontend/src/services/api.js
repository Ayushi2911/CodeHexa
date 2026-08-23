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
  updateWorkflow: (id, payload) => api.put(`/workflows/${id}`, payload),
  updateWorkflowStatus: (id, status) => api.patch(`/workflows/${id}/status`, { status }),
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),

  // Extended endpoints
  detectWorkflow: (requirement) => api.post("/workflows/detect", { requirement }),
  validateWorkflow: (workflow) => api.post("/workflows/validate", { workflow }),
  triggerWorkflow: (workflowId, payload = {}) => api.post(`/workflows/${workflowId}/trigger`, { payload }),
  agentEdit: (workflowId, command, currentWorkflow = null) =>
    api.post(`/workflows/${workflowId}/agent-edit`, { command, currentWorkflow }),
  applyAgentEdit: (workflowId, patch) =>
    api.post(`/workflows/${workflowId}/apply-edit`, { patch }),
  testLLM: (prompt) => api.post("/workflows/llm/test", { prompt }),
  testVLM: (imageUrl, prompt) => api.post("/workflows/vlm/test", { imageUrl, prompt }),
};
