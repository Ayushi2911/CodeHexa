const express = require("express");

const workflowController = require("../controllers/workflowController");

const router = express.Router();

// Detect a workflow from natural-language requirement
router.post("/detect", workflowController.detect);

// Create workflow
router.post("/", workflowController.create);

// Get all workflows
router.get("/", workflowController.getAll);

// Get one workflow
router.get("/:id", workflowController.getById);

// Update workflow
router.put("/:id", workflowController.update);

module.exports = router;
