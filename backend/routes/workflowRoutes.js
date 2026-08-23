const express = require("express");

const workflowController = require("../controllers/workflowController");

const router = express.Router();

// Detect a workflow from natural-language requirement
router.post("/detect", workflowController.detect);

// Workflow statistics
router.get("/stats", workflowController.getStats);
router.get("/templates", workflowController.getTemplates);
router.get("/recent", workflowController.getRecentWorkflows);

// Bulk operations
router.post("/bulk-delete", workflowController.bulkDeleteWorkflows);
router.post("/import", workflowController.importWorkflows);

// Validate workflow payload
router.post("/validate", workflowController.validateWorkflow);

// Create workflow
router.post("/", workflowController.create);

// Export workflows
router.get("/export", workflowController.exportWorkflow);

// Get all workflows
router.get("/", workflowController.getAll);

// Workflow runs
router.post("/:id/runs", workflowController.createRun);
router.get("/:id/runs", workflowController.getWorkflowRuns);
router.get("/:id/runs/:runId", workflowController.getWorkflowRunById);
router.patch("/:id/runs/:runId/status", workflowController.updateRunStatus);

// Workflow status and delete
router.patch("/:id/status", workflowController.updateStatus);
router.post("/:id/duplicate", workflowController.duplicateWorkflow);
router.get("/:id/export", workflowController.exportWorkflow);
router.delete("/:id", workflowController.deleteWorkflow);

// Get one workflow
router.get("/:id", workflowController.getById);

// Update workflow
router.put("/:id", workflowController.update);

module.exports = router;
