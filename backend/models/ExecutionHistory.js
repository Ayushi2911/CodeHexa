const mongoose = require("mongoose");

const executionHistorySchema = new mongoose.Schema(
  {
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    workflowName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      default: "guest",
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "running", "failed", "pending", "validated", "partial"],
      default: "success",
    },
    action: {
      type: String,
      enum: ["run", "generated", "validated", "agent-edit", "trigger", "manual"],
      default: "run",
    },
    startedAt: {
      type: String,
      default: () => new Date().toLocaleTimeString(),
    },
    completedAt: {
      type: String,
      default: () => new Date().toLocaleTimeString(),
    },
    duration: {
      type: String,
      default: "120ms",
    },
    triggerType: {
      type: String,
      default: "Webhook Trigger",
    },
    triggerSource: {
      type: String,
      default: "webhook.events",
    },
    steps: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    fullWorkflow: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

executionHistorySchema.index({ userEmail: 1, createdAt: -1 });
executionHistorySchema.index({ workflowId: 1, createdAt: -1 });

module.exports =
  mongoose.models.ExecutionHistory ||
  mongoose.model("ExecutionHistory", executionHistorySchema);
