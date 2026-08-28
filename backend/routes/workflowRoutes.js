const express = require("express");
const controller = require("../controllers/workflowController");

const router = express.Router();

// Detection, Validation & Direct Execution
router.post("/detect", controller.detect);
router.post("/validate", controller.validateEndpoint);
router.post("/validate-workflow", controller.validateEndpoint);
router.post("/execute", controller.executeWorkflowDirect);

// Workflows Collection CRUD
router.get("/", controller.getAll);
router.get("/list", controller.getAll);
router.post("/", controller.create);
router.post("/create", controller.create);
router.post("/bulk-delete", controller.bulkDeleteWorkflows);
router.post("/import", controller.importWorkflows);

// Aggregations, Templates, Stats & History
router.get("/stats", controller.getStats);
router.get("/templates", controller.getTemplates);
router.get("/recent", controller.getRecent);
router.get("/recent-workflows", controller.getRecent);
router.get("/history", controller.getHistory);
router.post("/history", controller.saveHistory);
router.get("/export", controller.exportWorkflow);

// AI & Bedrock Model Tests
router.post("/llm/test", controller.testLLM);
router.post("/vlm/test", controller.testVLM);

// Execution Runs & Traces
router.get("/run/:runId", controller.runById);
router.get("/runs/:id", controller.runs);
router.post("/:id/runs", controller.createRun);
router.get("/:id/runs", controller.runs);
router.patch("/:id/runs/:runId/status", controller.updateRunStatus);
router.post("/trigger/:id", controller.trigger);
router.post("/:id/trigger", controller.trigger);

// Single Workflow Operations & Status Updates
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.patch("/:id", controller.update);
router.patch("/:id/status", controller.updateStatus);
router.post("/:id/duplicate", controller.duplicateWorkflow);
router.delete("/:id", controller.softDelete);

// Versioning, Publishing & Agent Editing
router.post("/:id/validate", controller.validateById);
router.post("/:id/version", controller.createVersion);
router.get("/:id/versions", controller.versions);
router.post("/:id/publish", controller.publish);
router.post("/:id/draft", controller.createDraft);
router.post("/:id/agent-edit", controller.agentEdit);
router.post("/:id/agent-edit/apply", controller.applyAgentEdit);
router.post("/:id/apply-edit", controller.applyAgentEdit);
router.get("/:id/export", controller.exportWorkflow);

module.exports = router;