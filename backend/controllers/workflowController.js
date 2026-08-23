const { detectWorkflow } = require("../services/workflowDetector");

const workflows = [];

function detect(req, res) {
  try {
    const { requirement } = req.body;

    const result = detectWorkflow(requirement);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Workflow detection error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to detect workflow.",
      error: error.message,
    });
  }
}

function create(req, res) {
  try {
    const workflow = {
      id: `wf-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workflows.push(workflow);

    return res.status(201).json({
      success: true,
      workflow,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create workflow.",
      error: error.message,
    });
  }
}

function getAll(req, res) {
  return res.json({
    success: true,
    count: workflows.length,
    workflows,
  });
}

function getById(req, res) {
  const workflow = workflows.find(
    (item) => item.id === req.params.id
  );

  if (!workflow) {
    return res.status(404).json({
      success: false,
      message: "Workflow not found.",
    });
  }

  return res.json({
    success: true,
    workflow,
  });
}

function update(req, res) {
  const index = workflows.findIndex(
    (item) => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Workflow not found.",
    });
  }

  workflows[index] = {
    ...workflows[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  return res.json({
    success: true,
    workflow: workflows[index],
  });
}

module.exports = {
  detect,
  create,
  getAll,
  getById,
  update,
};
