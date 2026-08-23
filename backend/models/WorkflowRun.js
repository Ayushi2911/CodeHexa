const mongoose = require("mongoose");

const stepResultSchema = new mongoose.Schema(
  {
    stepId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "success",
        "failed",
        "skipped",
      ],
      required: true,
    },

    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    output: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    reason: {
      type: String,
      default: "",
    },

    error: {
      type: String,
      default: "",
    },

    durationMs: {
      type: Number,
      default: 0,
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
    _id: false,
  }
);

const workflowRunSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
      index: true,
    },

    workflowName: {
      type: String,
      default: "",
    },

    workflowVersion: {
      type: Number,
      default: 1,
    },

    projectName: {
      type: String,
      required: true,
      index: true,
    },

    triggerPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "completed",
        "failed",
        "partial",
      ],
      default: "pending",
    },

    stepResults: {
      type: [stepResultSchema],
      default: [],
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    totalDurationMs: {
      type: Number,
      default: 0,
    },

    dryRun: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.WorkflowRun ||
  mongoose.model("WorkflowRun", workflowRunSchema);