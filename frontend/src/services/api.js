import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Main Axios client instance with standard timeout and base URL configuration.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor:
 * Attaches JWT Bearer token from localStorage to every outgoing authenticated request.
 */
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("codehexa_token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // Ignore localStorage access errors in restricted sandbox environments
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Normalizes error payloads and handles unauthorized session expirations.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("codehexa_token");
      } catch (_) {}
    }
    // Handle Network / Connection Errors with clear instructions
    if (!error.response && error.message === "Network Error") {
      error.message = "Backend server is not running or unreachable at http://localhost:4000. Please start the backend server (cd backend && npm run dev).";
    }
    return Promise.reject(error);
  }
);

/**
 * ============================================================================
 * Workflow Management APIs
 * ============================================================================
 */
export const workflowApi = {
  // Discovery & Stats
  getStats: () => api.get("/workflows/stats"),
  getTemplates: () => api.get("/workflows/templates"),
  getRecentWorkflows: () => api.get("/workflows/recent"),
  getRecent: () => api.get("/workflows/recent"),

  // Workflows CRUD
  getWorkflows: (params = {}) => api.get("/workflows", { params }),
  getAll: (params = {}) => api.get("/workflows", { params }),
  getWorkflowById: (id) => api.get(`/workflows/${id}`),
  getById: (id) => api.get(`/workflows/${id}`),
  createWorkflow: (payload) => api.post("/workflows", payload),
  create: (payload) => api.post("/workflows", payload),
  updateWorkflow: (id, payload) => api.put(`/workflows/${id}`, payload),
  update: (id, payload) => api.put(`/workflows/${id}`, payload),
  updateWorkflowStatus: (id, status) => api.patch(`/workflows/${id}/status`, { status }),
  updateStatus: (id, status) => api.patch(`/workflows/${id}/status`, { status }),
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),
  delete: (id) => api.delete(`/workflows/${id}`),

  // Workflow Detection & Validation
  detectWorkflow: (requirement, projectName = "sample-flow") =>
    api.post("/workflows/detect", { requirement, projectName }),
  detect: (requirement, projectName = "sample-flow") =>
    api.post("/workflows/detect", { requirement, projectName }),
  validateWorkflow: (workflow) => api.post("/workflows/validate", { workflow }),
  validate: (workflow) => api.post("/workflows/validate", { workflow }),
  validateWorkflowById: (id) => api.post(`/workflows/${id}/validate`),
  validateById: (id) => api.post(`/workflows/${id}/validate`),

  // Direct & Trigger Execution
  triggerWorkflow: (workflowId, payload = {}) =>
    api.post(`/workflows/${workflowId}/trigger`, { payload }),
  trigger: (workflowId, payload = {}) =>
    api.post(`/workflows/${workflowId}/trigger`, { payload }),
  executeWorkflow: (workflow, triggerPayload = {}, options = {}) =>
    api.post("/workflows/execute", { workflow, triggerPayload, options }),
  execute: (workflow, triggerPayload = {}, options = {}) =>
    api.post("/workflows/execute", { workflow, triggerPayload, options }),

  // Execution Runs & History
  getWorkflowRuns: (workflowId) => api.get(`/workflows/${workflowId}/runs`),
  getRuns: (workflowId) => api.get(`/workflows/${workflowId}/runs`),
  getWorkflowRunById: (runId) => api.get(`/workflows/run/${runId}`),
  getRunById: (runId) => api.get(`/workflows/run/${runId}`),
  getHistory: () => api.get("/workflows/history"),
  saveHistory: (record) => api.post("/workflows/history", record),

  // Versions, Drafts & Publishing
  getWorkflowVersions: (id) => api.get(`/workflows/${id}/versions`),
  getVersions: (id) => api.get(`/workflows/${id}/versions`),
  createWorkflowVersion: (id, payload) => api.post(`/workflows/${id}/version`, payload),
  createVersion: (id, payload) => api.post(`/workflows/${id}/version`, payload),
  publishWorkflow: (id) => api.post(`/workflows/${id}/publish`),
  publish: (id) => api.post(`/workflows/${id}/publish`),
  createDraft: (id) => api.post(`/workflows/${id}/draft`),

  // AI Agent Editing & Export
  agentEdit: (workflowId, command, currentWorkflow = null) =>
    api.post(`/workflows/${workflowId}/agent-edit`, { command, currentWorkflow }),
  applyAgentEdit: (workflowId, patch) =>
    api.post(`/workflows/${workflowId}/apply-edit`, { patch }),
  exportWorkflow: (id, format = "json") =>
    api.get(`/workflows/${id}/export`, { params: { format } }),

  // Bedrock AI Testing Endpoints
  testLLM: (prompt) => api.post("/workflows/llm/test", { prompt }),
  testVLM: (imageUrl, prompt) => api.post("/workflows/vlm/test", { imageUrl, prompt }),
};

/**
 * ============================================================================
 * Authentication & User Profile APIs
 * ============================================================================
 */
export const authApi = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  googleAuth: (googleData) => api.post("/auth/google", googleData),
  getProfile: (email) => api.get("/auth/profile", { params: { email } }),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  getMe: () => api.get("/auth/me"),
  logout: () => {
    try {
      localStorage.removeItem("codehexa_token");
      localStorage.removeItem("codehexa_user");
    } catch (_) {}
    return Promise.resolve({ ok: true });
  },
};

/**
 * ============================================================================
 * Forms & System Functions Execution APIs
 * ============================================================================
 */
export const formsApi = {
  executeFunction: (name, payload = {}) =>
    api.post(`/forms/function/${name}`, payload),
  createRecord: (schema, data) =>
    api.post(`/forms/formCreate/${schema}`, data),
  updateRecord: (schema, data) =>
    api.post(`/forms/formUpdate/${schema}`, data),
  deleteRecord: (schema, id) =>
    api.post(`/forms/formDelete/${schema}`, { id }),
  executeOperation: (payload) =>
    api.post("/forms/operation", payload),
  getSchemas: () => api.get("/forms/schemas"),
  getFunctions: () => api.get("/forms/functions"),
};

/**
 * ============================================================================
 * System & Health Check APIs
 * ============================================================================
 */
export const systemApi = {
  getHealth: () => api.get("/health"),
  getInfo: () => api.get("/"),
};

export default {
  api,
  workflowApi,
  authApi,
  formsApi,
  systemApi,
};
