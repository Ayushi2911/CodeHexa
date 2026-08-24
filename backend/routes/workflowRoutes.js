const express =require("express");

const controller =require("../controllers/workflowController");

const router =express.Router();

router.post("/detect",controller.detect);

router.post("/create",controller.create);

router.post("/",controller.create);

router.get("/list",controller.getAll);

router.get("/",controller.getAll);

router.get("/stats",controller.getStats);
router.get("/templates",controller.getTemplates);
router.get("/recent",controller.getRecent);
router.get("/history",controller.getHistory);
router.post("/history",controller.saveHistory);

router.post("/validate",controller.validateEndpoint);

router.get("/run/:runId",controller.runById);

router.get("/runs/:id",controller.runs);

router.post("/trigger/:id",controller.trigger);

router.post("/:id/validate",controller.validateById);

router.post("/:id/version",controller.createVersion);

router.get("/:id/versions",controller.versions);

router.post("/:id/publish",controller.publish);

router.post("/:id/draft",controller.createDraft);
router.post("/:id/agent-edit",controller.agentEdit);

router.post("/:id/agent-edit/apply",controller.applyAgentEdit);

router.get("/:id/export",controller.exportWorkflow);

router.patch("/:id",controller.update);
router.put("/:id",controller.update);
router.delete("/:id",controller.softDelete);
router.post(
  "/llm/test",
  controller.testLLM
);
router.post(
  "/vlm/test",
  controller.testVLM
);
router.get("/:id",controller.getById);

module.exports =router;