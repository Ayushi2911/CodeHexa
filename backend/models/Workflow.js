const mongoose = require("mongoose");

const workflowNodeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    position: {
      x: {
        type: Number,
        default: 0,
      },
      y: {
        type: Number,
        default: 0,
      },
    },
  },
  { _id: false }
);

const workflowEdgeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      required: true,
    },

    target: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      default: "",
    },

    condition: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    requirement: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "validated", "active", "archived"],
      default: "draft",
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    warnings: {
      type: [String],
      default: [],
    },

    nodes: {
      type: [workflowNodeSchema],
      default: [],
    },

    edges: {
      type: [workflowEdgeSchema],
      default: [],
    },

    variables: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    version: {
      type: Number,
      default: 1,
    },

    source: {
      type: String,
      enum: ["manual", "detected", "agent"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

const Workflow = mongoose.model("Workflow", workflowSchema);

module.exports = Workflow;
