const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
    },

    operator: {
      type: String,
      enum: [
        "eq",
        "neq",
        "gt",
        "gte",
        "lt",
        "lte",
        "in",
        "notIn",
        "contains",
        "exists",
      ],
      default: "eq",
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const stepSchema = new mongoose.Schema(
  {
    stepId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    actionType: {
      type: String,
      enum: [
        "function",
        "formCreate",
        "formUpdate",
        "formDelete",
        "operation",
      ],
      required: true,
    },

    functionName: {
      type: String,
      default: null,
    },

    schema: {
      type: String,
      default: null,
    },

    formId: {
      type: String,
      default: null,
    },

    buttonId: {
      type: String,
      default: null,
    },

    inputMapping: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    condition: {
      type: conditionSchema,
      default: null,
    },

    onSuccess: {
      type: String,
      default: null,
    },

    onFailure: {
      type: String,
      default: "abort",
    },

    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const workflowSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    workflowName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    requirement: {
      type: String,
      default: "",
    },

    triggerEvent: {
      type: {
        type: String,
        enum: [
          "formCreate",
          "formUpdate",
          "formDelete",
          "manual",
          "webhook",
        ],
        required: true,
      },

      schema: {
        type: String,
        default: null,
      },
    },

    steps: {
      type: [stepSchema],
      default: [],
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

    isActive: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    editSource: {
      type: String,
      enum: ["manual", "agent", "detection"],
      default: "detection",
    },

    baseVersion: {
      type: Number,
      default: null,
    },

    familyId: {
      type: String,
      required: true,
      index: true,
    },

    changeSummary: {
      type: String,
      default: "",
    },

    createdBy: {
      type: String,
      default: "system",
    },

    updatedBy: {
      type: String,
      default: "system",
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

workflowSchema.index(
  {
    projectName: 1,
    familyId: 1,
    version: 1,
  },
  {
    unique: true,
  }
);

workflowSchema.index({
  projectName: 1,
  workflowName: 1,
  status: 1,
  isDeleted: 1,
});

module.exports =
  mongoose.models.Workflow ||
  mongoose.model("Workflow", workflowSchema);