const mongoose = require("mongoose");
const { detectWorkflow } = require("../services/workflowDetector");
const Workflow = require("../models/Workflow");
const WorkflowRun = require("../models/WorkflowRun");

const FALLBACK_STATS = {
  totalWorkflows: 12,
  activeWorkflows: 5,
  draftWorkflows: 4,
  archivedWorkflows: 3,
  averageConfidence: 0.86,
  recentRuns: [],
  runsByStatus: [
    { _id: "completed", count: 9 },
    { _id: "running", count: 2 },
    { _id: "failed", count: 1 },
  ],
  sourceStats: [
    { _id: "detected", count: 7 },
    { _id: "manual", count: 3 },
    { _id: "agent", count: 2 },
  ],
};

const FALLBACK_RECENT = [
  { id: "demo-1", name: "Order Processing", status: "active", version: 3 },
  { id: "demo-2", name: "Customer Onboarding", status: "draft", version: 1 },
  { id: "demo-3", name: "Incident Response", status: "validated", version: 2 },
  { id: "demo-4", name: "Leave Approval", status: "archived", version: 4 },
];

const demoWorkflows = FALLBACK_RECENT.map((workflow) => ({
  ...workflow,
  confidence: 0.86,
  source: "manual",
  requirement: workflow.name,
  nodes: [],
  edges: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

const VALID_STATUSES = ["draft", "validated", "active", "archived"];
const VALID_RUN_STATUSES = ["queued", "running", "completed", "failed", "cancelled"];

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

async function create(req, res) {
  try {
    if (!isDatabaseReady()) {
      const now = new Date().toISOString();
      const workflow = {
        ...req.body,
        id: `demo-${Date.now()}`,
        version: 1,
        status: req.body.status || "draft",
        confidence: req.body.confidence || 0,
        requirement: req.body.requirement || req.body.name || "",
        nodes: req.body.nodes || [],
        edges: req.body.edges || [],
        createdAt: now,
        updatedAt: now,
      };

      demoWorkflows.unshift(workflow);

      return res.status(201).json({
        success: true,
        demoMode: true,
        workflow,
      });
    }

    const workflow = await Workflow.create(req.body);

    return res.status(201).json({
      success: true,
      workflow: serializeWorkflow(workflow),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create workflow.",
      error: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * pageSize;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { requirement: { $regex: search, $options: "i" } },
      ];
    }

    const [workflows, total] = await Promise.all([
      Workflow.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Workflow.countDocuments(query),
    ]);

    return res.json({
      success: true,
      count: workflows.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      workflows: workflows.map(serializeWorkflow),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workflows.",
      error: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    return res.json({
      success: true,
      workflow: serializeWorkflow(workflow),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid workflow ID.",
      error: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { ...req.body, $inc: { version: 1 } },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    return res.json({
      success: true,
      workflow: serializeWorkflow(workflow),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update workflow.",
      error: error.message,
    });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workflow status.",
        validStatuses: VALID_STATUSES,
      });
    }

    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    return res.json({
      success: true,
      message: "Workflow status updated.",
      workflow: serializeWorkflow(workflow),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update workflow status.",
      error: error.message,
    });
  }
}

async function deleteWorkflow(req, res) {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    await WorkflowRun.deleteMany({ workflowId: req.params.id });

    return res.json({
      success: true,
      message: "Workflow deleted successfully.",
      deletedId: req.params.id,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete workflow.",
      error: error.message,
    });
  }
}

async function getWorkflowRuns(req, res) {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    const runs = await WorkflowRun.find({ workflowId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      workflowId: req.params.id,
      count: runs.length,
      runs: runs.map(serializeRun),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch workflow runs.",
      error: error.message,
    });
  }
}

async function getWorkflowRunById(req, res) {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    const run = await WorkflowRun.findOne({
      _id: req.params.runId,
      workflowId: req.params.id,
    }).lean();

    if (!run) {
      return res.status(404).json({
        success: false,
        message: "Workflow run not found.",
      });
    }

    return res.json({
      success: true,
      run: serializeRun(run),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch workflow run.",
      error: error.message,
    });
  }
}

async function updateRunStatus(req, res) {
  try {
    const { status } = req.body;

    if (!status || !VALID_RUN_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workflow run status.",
        validStatuses: VALID_RUN_STATUSES,
      });
    }

    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    const run = await WorkflowRun.findOneAndUpdate(
      { _id: req.params.runId, workflowId: req.params.id },
      { status, completedAt: status === "completed" || status === "failed" || status === "cancelled" ? new Date() : null },
      { new: true, runValidators: true }
    );

    if (!run) {
      return res.status(404).json({
        success: false,
        message: "Workflow run not found.",
      });
    }

    return res.json({
      success: true,
      message: "Workflow run status updated.",
      run: serializeRun(run),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update workflow run status.",
      error: error.message,
    });
  }
}

async function createRun(req, res) {
  try {
    const workflowId = req.params.id || req.body.workflowId;

    if (!workflowId) {
      return res.status(400).json({
        success: false,
        message: "Workflow ID is required.",
      });
    }

    const workflow = await Workflow.findById(workflowId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    const runData = {
      workflowId,
      workflowVersion: workflow.version,
      triggerType: req.body.triggerType || "manual",
      triggerPayload: req.body.triggerPayload || {},
      status: req.body.status || "queued",
      currentNodeId: req.body.currentNodeId || null,
      stepResults: req.body.stepResults || [],
      logs: req.body.logs || [],
      error: req.body.error || "",
      startedAt: req.body.startedAt || new Date(),
    };

    const run = await WorkflowRun.create(runData);

    return res.status(201).json({
      success: true,
      run: serializeRun(run),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create workflow run.",
      error: error.message,
    });
  }
}

async function getStats(req, res) {
  try {
    if (!isDatabaseReady()) {
      const counts = demoWorkflows.reduce((result, workflow) => {
        result.totalWorkflows += 1;
        if (workflow.status === "active") result.activeWorkflows += 1;
        if (workflow.status === "draft") result.draftWorkflows += 1;
        if (workflow.status === "archived") result.archivedWorkflows += 1;
        return result;
      }, { totalWorkflows: 0, activeWorkflows: 0, draftWorkflows: 0, archivedWorkflows: 0 });

      return res.json({
        success: true,
        demoMode: true,
        stats: {
          ...FALLBACK_STATS,
          ...counts,
          averageConfidence: demoWorkflows.length
            ? Number((demoWorkflows.reduce((sum, workflow) => sum + (workflow.confidence || 0), 0) / demoWorkflows.length).toFixed(2))
            : 0,
        },
      });
    }

    const [totalWorkflows, activeWorkflows, draftWorkflows, archivedWorkflows, recentRuns] = await Promise.all([
      Workflow.countDocuments(),
      Workflow.countDocuments({ status: "active" }),
      Workflow.countDocuments({ status: "draft" }),
      Workflow.countDocuments({ status: "archived" }),
      WorkflowRun.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const confidenceStats = await Workflow.aggregate([
      { $group: { _id: null, averageConfidence: { $avg: "$confidence" } } },
    ]);

    const runsByStatus = await WorkflowRun.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const sourceStats = await Workflow.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.json({
      success: true,
      stats: {
        totalWorkflows,
        activeWorkflows,
        draftWorkflows,
        archivedWorkflows,
        averageConfidence: Number(
          (confidenceStats[0]?.averageConfidence || 0).toFixed(2)
        ),
        recentRuns: recentRuns.map(serializeRun),
        runsByStatus,
        sourceStats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate workflow statistics.",
      error: error.message,
    });
  }
}

async function getTemplates(req, res) {
  try {
    const templates = [
      {
        id: "order-processing",
        name: "Order Processing",
        description: "Handle order validation, payment processing, and confirmation messaging.",
        category: "commerce",
        requirement: "When a new order is placed, validate the order details, process payment, update inventory, and send a confirmation email to the customer.",
      },
      {
        id: "customer-onboarding",
        name: "Customer Onboarding",
        description: "Collect user data, verify eligibility, and assign onboarding tasks.",
        category: "operations",
        requirement: "When a new customer signs up, verify their information, create an onboarding task, assign a team member, and send a welcome email.",
      },
      {
        id: "incident-response",
        name: "Incident Response",
        description: "Capture alerts, triage incidents, and route them to the right responder.",
        category: "support",
        requirement: "If an incident alert is received, triage the issue, assign it to the support team, notify the on-call engineer, and log the resolution.",
      },
      {
        id: "leave-approval",
        name: "Leave Approval",
        description: "Review leave requests, confirm manager approval, and notify HR.",
        category: "hr",
        requirement: "When an employee submits a leave request, validate the dates, request manager approval, notify HR, and update the attendance record.",
      },
    ];

    return res.json({
      success: true,
      templates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workflow templates.",
      error: error.message,
    });
  }
}

async function getRecentWorkflows(req, res) {
  try {
    if (!isDatabaseReady()) {
      return res.json({
        success: true,
        demoMode: true,
        workflows: demoWorkflows
          .slice()
          .sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt))
          .slice(0, 5),
      });
    }

    const workflows = await Workflow.find().sort({ updatedAt: -1 }).limit(5).lean();

    return res.json({
      success: true,
      workflows: workflows.map(serializeWorkflow),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent workflows.",
      error: error.message,
    });
  }
}

async function bulkDeleteWorkflows(req, res) {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (!ids.length) {
      return res.status(400).json({
        success: false,
        message: "At least one workflow ID is required.",
      });
    }

    const deleted = await Workflow.deleteMany({ _id: { $in: ids } });
    await WorkflowRun.deleteMany({ workflowId: { $in: ids } });

    return res.json({
      success: true,
      message: "Workflows deleted successfully.",
      deletedCount: deleted.deletedCount || 0,
      ids,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete workflows.",
      error: error.message,
    });
  }
}

async function exportWorkflow(req, res) {
  try {
    const { id } = req.params;

    if (id) {
      const workflow = await Workflow.findById(id);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: "Workflow not found.",
        });
      }

      return res.json({
        success: true,
        workflow: serializeWorkflow(workflow),
      });
    }

    const workflows = await Workflow.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      exportDate: new Date().toISOString(),
      count: workflows.length,
      workflows: workflows.map(serializeWorkflow),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to export workflow data.",
      error: error.message,
    });
  }
}

async function importWorkflows(req, res) {
  try {
    const payload = req.body?.workflows ?? req.body;
    const workflows = Array.isArray(payload) ? payload : [payload];

    if (!workflows.length || workflows.some((item) => !item || typeof item !== "object")) {
      return res.status(400).json({
        success: false,
        message: "A valid workflow array or object is required.",
      });
    }

    const imported = [];
    const failed = [];

    for (const item of workflows) {
      try {
        const sanitized = {
          ...item,
          name: item.name || "Imported Workflow",
          requirement: item.requirement || "Imported workflow requirement",
          status: VALID_STATUSES.includes(item.status) ? item.status : "draft",
          source: ["manual", "detected", "agent"].includes(item.source) ? item.source : "manual",
          confidence: Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 0,
          nodes: Array.isArray(item.nodes) ? item.nodes : [],
          edges: Array.isArray(item.edges) ? item.edges : [],
          warnings: Array.isArray(item.warnings) ? item.warnings : [],
          variables: item.variables || {},
          version: Number.isFinite(Number(item.version)) ? Number(item.version) : 1,
        };

        const workflow = await Workflow.create(sanitized);
        imported.push(serializeWorkflow(workflow));
      } catch (error) {
        failed.push({
          item,
          reason: error.message,
        });
      }
    }

    return res.status(imported.length ? 201 : 400).json({
      success: imported.length > 0,
      importedCount: imported.length,
      failedCount: failed.length,
      imported,
      failed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to import workflows.",
      error: error.message,
    });
  }
}

async function validateWorkflow(req, res) {
  try {
    const workflowData = req.body.workflow || req.body;
    const issues = [];

    if (!workflowData || typeof workflowData !== "object") {
      return res.status(400).json({
        success: false,
        valid: false,
        issues: ["Workflow payload is required."],
      });
    }

    if (!workflowData.name || !String(workflowData.name).trim()) {
      issues.push("Workflow name is required.");
    }

    if (!workflowData.requirement || !String(workflowData.requirement).trim()) {
      issues.push("Workflow requirement is required.");
    }

    if (!Array.isArray(workflowData.nodes) || workflowData.nodes.length === 0) {
      issues.push("Workflow must contain at least one node.");
    }

    if (!Array.isArray(workflowData.edges)) {
      issues.push("Workflow edges must be an array.");
    }

    if (Array.isArray(workflowData.nodes)) {
      const ids = new Set(workflowData.nodes.map((node) => node && node.id).filter(Boolean));

      if (workflowData.edges) {
        workflowData.edges.forEach((edge, index) => {
          if (!edge || !edge.source || !edge.target) {
            issues.push(`Edge ${index + 1} is missing source or target.`);
            return;
          }

          if (!ids.has(edge.source)) {
            issues.push(`Edge ${index + 1} references unknown source node: ${edge.source}`);
          }

          if (!ids.has(edge.target)) {
            issues.push(`Edge ${index + 1} references unknown target node: ${edge.target}`);
          }
        });
      }
    }

    if (workflowData.confidence !== undefined) {
      const value = Number(workflowData.confidence);
      if (Number.isNaN(value) || value < 0 || value > 1) {
        issues.push("Workflow confidence must be a number between 0 and 1.");
      }
    }

    return res.json({
      success: true,
      valid: issues.length === 0,
      issues,
      summary: {
        totalIssues: issues.length,
        status: issues.length === 0 ? "ready" : "needs_attention",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      valid: false,
      issues: ["Failed to validate workflow."],
      error: error.message,
    });
  }
}

async function duplicateWorkflow(req, res) {
  try {
    const original = await Workflow.findById(req.params.id);

    if (!original) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found.",
      });
    }

    const data = original.toObject();
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;

    const duplicateData = {
      ...data,
      name: `${data.name || "Workflow"} Copy`,
      status: "draft",
      version: 1,
      source: "manual",
      confidence: 0,
      warnings: ["Duplicated workflow created from an existing template."],
    };

    const duplicate = await Workflow.create(duplicateData);

    return res.status(201).json({
      success: true,
      message: "Workflow duplicated successfully.",
      workflow: serializeWorkflow(duplicate),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to duplicate workflow.",
      error: error.message,
    });
  }
}

function serializeWorkflow(workflow) {
  const data = workflow.toObject ? workflow.toObject() : { ...workflow };
  if (data._id) {
    data.id = data._id.toString();
    delete data._id;
  } else if (!data.id) {
    data.id = data.workflowId;
  }
  delete data.__v;
  return data;
}

function serializeRun(run) {
  const data = run.toObject ? run.toObject() : run;

  if (data._id) {
    data.id = data._id.toString();
    delete data._id;
  }

  if (data.workflowId && typeof data.workflowId === "object" && data.workflowId._id) {
    data.workflowId = data.workflowId._id.toString();
  } else if (data.workflowId) {
    data.workflowId = data.workflowId.toString();
  }

  if (data.__v !== undefined) {
    delete data.__v;
  }

  return data;
}

module.exports = {
  detect,
  create,
  getAll,
  getById,
  update,
  updateStatus,
  deleteWorkflow,
  bulkDeleteWorkflows,
  getWorkflowRuns,
  getWorkflowRunById,
  updateRunStatus,
  createRun,
  getStats,
  getTemplates,
  getRecentWorkflows,
  exportWorkflow,
  importWorkflows,
  validateWorkflow,
  duplicateWorkflow,
};
