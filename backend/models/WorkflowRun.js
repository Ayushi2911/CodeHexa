const mongoose = require("mongoose");

const stepResultSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
    },

    nodeLabel: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "running", "success", "failed", "skipped"],
      default: "pending",
    },

    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    output: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    error: {
      type: String,
      default: "",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const workflowRunSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },

    workflowVersion: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed", "cancelled"],
      default: "queued",
    },

    triggerType: {
      type: String,
      default: "manual",
    },

    triggerPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    currentNodeId: {
      type: String,
      default: null,
    },

    stepResults: {
      type: [stepResultSchema],
      default: [],
    },

    logs: {
      type: [
        {
          timestamp: {
            type: Date,
            default: Date.now,
          },

          level: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info",
          },

          message: {
            type: String,
            required: true,
          },

          nodeId: {
            type: String,
            default: null,
          },
        },
      ],
      default: [],
    },

    error: {
      type: String,
      default: "",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WorkflowRun = mongoose.model("WorkflowRun", workflowRunSchema);

module.exports = WorkflowRun;
