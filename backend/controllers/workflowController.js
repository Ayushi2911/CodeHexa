const crypto =
  require("crypto");

const mongoose =
  require("mongoose");

const Workflow =
  require(
    "../models/Workflow"
  );

const WorkflowRun =
  require(
    "../models/WorkflowRun"
  );

const {
  loadProjectContext,
} = require(
  "../services/contextLoader"
);

const {
  detectWorkflows,
} = require(
  "../services/workflowDetector"
);

const {
  validateWorkflow,
} = require(
  "../services/workflowValidator"
);

const {
  executeWorkflow,
} = require(
  "../services/workflowExecutor"
);
const {
  invokeLLM,
  invokeVLM,
  generateAgentPatch,
} = require("../services/bedrockClient");
const {
  normalizeWorkflow,
} = require("../services/workflowDetector");

function dbReady() {
  return (
    mongoose.connection
      .readyState === 1
  );
}

function needDb(res) {
  if (!dbReady()) {
    res
      .status(503)
      .json({
        ok: false,

        error: {
          code:
            "DATABASE_UNAVAILABLE",

          message:
            "MongoDB is required for workflow persistence/execution. Configure MONGODB_URI.",
        },
      });

    return false;
  }

  return true;
}

function familyId() {
  return `wf-${crypto.randomUUID()}`;
}

function toPlain(doc) {
  return doc?.toObject
    ? doc.toObject()
    : doc;
}

function diagramFromWorkflow(
  workflow
) {
  const w =
    toPlain(workflow);

  const steps = [
    ...(w.steps || []),
  ].sort(
    (a, b) =>
      a.order - b.order
  );

  const nodes =
    steps.map(
      (step, index) => ({
        id:
          step.stepId,

        type:
          step.actionType,

        label:
          step.name,

        description:
          step.actionType,

        config: {
          actionType:
            step.actionType,

          functionName:
            step.functionName,

          schema:
            step.schema,

          condition:
            step.condition,

          onFailure:
            step.onFailure,
        },

        position: {
          x: 250,
          y:
            index * 140,
        },
      })
    );

  const edges = [];

  for (
    const step of
    steps
  ) {
    if (
      step.onSuccess
    ) {
      edges.push({
        id:
          `e-${step.stepId}-success`,

        source:
          step.stepId,

        target:
          step.onSuccess,

        label:
          "success",

        type:
          "success",
      });
    }

    if (
      step.onFailure &&
      ![
        "abort",
        "skip",
      ].includes(
        step.onFailure
      )
    ) {
      edges.push({
        id:
          `e-${step.stepId}-failure`,

        source:
          step.stepId,

        target:
          step.onFailure,

        label:
          "failure",

        type:
          "failure",
      });
    }
  }

  return {
    nodes,
    edges,
  };
}

function serializeWorkflow(
  doc
) {
  const workflow =
    toPlain(doc);

  if (!workflow) {
    return null;
  }

  return {
    ...workflow,

    id:
      workflow._id
        ?.toString?.() ||
      workflow.id,

    name:
      workflow.workflowName,

    source:
      workflow.editSource,

    ...diagramFromWorkflow(
      workflow
    ),
  };
}

function serializeRun(
  doc
) {
  const run =
    toPlain(doc);

  return run
    ? {
        ...run,

        id:
          run._id
            ?.toString?.() ||
          run.id,
      }
    : null;
}

async function detect(
  req,
  res
) {
  try {
    const {
      projectName,
      requirement,
      examplePayload,
    } =
      req.body || {};

    if (
      !projectName ||
      !requirement
    ) {
      return res
        .status(400)
        .json({
          ok: false,

          error: {
            code:
              "INVALID_INPUT",

            message:
              "projectName and requirement are required",
          },
        });
    }

    const context =
      await loadProjectContext(
        projectName
      );

    const data =
      await detectWorkflows(
        projectName,
        requirement,
        context,
        examplePayload
      );

    return res.json({
      ok: true,

      data,

      contextSource:
        context.source,

      projectContextSummary: {
        schemas:
          context.schemas.length,

        functions:
          context.functions.length,

        buttons:
          context.buttons.length,

        buttonConditions:
          context
            .buttonConditions
            .length,
      },
    });
  } catch (error) {
    return res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "DETECTION_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function create(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const body =
      req.body || {};

    const workflow = {
      projectName:
        body.projectName,

      workflowName:
        body.workflowName ||
        body.name,

      description:
        body.description ||
        "",

      requirement:
        body.requirement ||
        "",

      triggerEvent:
        body.triggerEvent,

      steps:
        body.steps ||
        body.detectedSteps ||
        [],

      confidence:
        body.confidence ||
        0,

      warnings:
        body.warnings ||
        [],

      isActive:
        false,

      isDeleted:
        false,

      version:
        1,

      status:
        "draft",

      editSource:
        body.editSource ||
        body.source ||
        "detection",

      familyId:
        body.familyId ||
        familyId(),

      changeSummary:
        body.changeSummary ||
        "Initial workflow created",

      createdBy:
        body.createdBy ||
        "system",

      updatedBy:
        body.updatedBy ||
        body.createdBy ||
        "system",
    };

    const context =
      await loadProjectContext(
        workflow.projectName
      );

    const validation =
      validateWorkflow(
        workflow,
        context
      );

    if (
      !validation.valid
    ) {
      return res
        .status(400)
        .json({
          ok: false,

          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Workflow is invalid",

            details:
              validation.errors,
          },

          warnings:
            validation.warnings,
        });
    }

    workflow.warnings = [
      ...new Set([
        ...(workflow.warnings ||
          []),

        ...validation.warnings,
      ]),
    ];

    const saved =
      await Workflow.create(
        workflow
      );

    return res
      .status(201)
      .json({
        ok: true,

        data:
          serializeWorkflow(
            saved
          ),

        validation,
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "CREATE_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function getAll(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const query = {
      isDeleted:
        false,
    };

    if (
      req.query.projectName
    ) {
      query.projectName =
        req.query.projectName;
    }

    if (
      req.query.status
    ) {
      query.status =
        req.query.status;
    }

    const docs =
      await Workflow.find(
        query
      )
        .sort({
          updatedAt: -1,
        })
        .lean();

    res.json({
      ok: true,

      data:
        docs.map(
          serializeWorkflow
        ),

      count:
        docs.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        ok: false,

        error: {
          code:
            "LIST_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function getById(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const workflow =
      await Workflow.findOne({
        _id:
          req.params.id,

        isDeleted:
          false,
      });

    if (!workflow) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    res.json({
      ok: true,

      data:
        serializeWorkflow(
          workflow
        ),
    });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "INVALID_ID",

          message:
            error.message,
        },
      });
  }
}

async function validateEndpoint(
  req,
  res
) {
  try {
    const payload =
      req.body.workflow ||
      req.body;

    const context =
      await loadProjectContext(
        payload.projectName
      );

    const result =
      validateWorkflow(
        payload,
        context
      );

    res
      .status(
        result.valid
          ? 200
          : 400
      )
      .json({
        ok:
          result.valid,

        data:
          result,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "VALIDATION_ERROR",

          message:
            error.message,
        },
      });
  }
}

async function validateById(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const current =
      await Workflow
        .findById(
          req.params.id
        )
        .lean();

    if (!current) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    const candidate = {
      ...current,
      ...req.body,

      _id:
        current._id,
    };

    const context =
      await loadProjectContext(
        candidate.projectName
      );

    const result =
      validateWorkflow(
        candidate,
        context
      );

    res
      .status(
        result.valid
          ? 200
          : 400
      )
      .json({
        ok:
          result.valid,

        data:
          result,

        candidate:
          serializeWorkflow(
            candidate
          ),
      });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "VALIDATION_ERROR",

          message:
            error.message,
        },
      });
  }
}

async function update(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const current =
      await Workflow
        .findById(
          req.params.id
        );

    if (!current) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    const allowed = [
      "workflowName",
      "description",
      "triggerEvent",
      "steps",
      "warnings",
      "updatedBy",
      "changeSummary",
    ];

    const patch = {};

    for (
      const key of allowed
    ) {
      if (
        req.body[key] !==
        undefined
      ) {
        patch[key] =
          req.body[key];
      }
    }

    const candidate = {
      ...current.toObject(),
      ...patch,

      editSource:
        "manual",
    };

    const context =
      await loadProjectContext(
        candidate.projectName
      );

    const validation =
      validateWorkflow(
        candidate,
        context
      );

    if (
      !validation.valid
    ) {
      return res
        .status(400)
        .json({
          ok: false,

          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Saved workflow was not changed",

            details:
              validation.errors,
          },

          warnings:
            validation.warnings,
        });
    }

    Object.assign(
      current,
      patch,
      {
        editSource:
          "manual",
      }
    );

    await current.save();

    res.json({
      ok: true,

      data:
        serializeWorkflow(
          current
        ),

      validation,
    });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "UPDATE_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function softDelete(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const workflow =
      await Workflow
        .findByIdAndUpdate(
          req.params.id,

          {
            isDeleted:
              true,

            isActive:
              false,

            status:
              "archived",
          },

          {
            new: true,
          }
        );

    if (!workflow) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    res.json({
      ok: true,

      data: {
        workflowId:
          req.params.id,

        deleted:
          true,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "DELETE_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function trigger(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const workflow =
      await Workflow
        .findById(
          req.params.id
        );

    if (
      !workflow ||
      workflow.isDeleted
    ) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    if (
      workflow.status !==
        "published" &&
      req.query.allowDraft !==
        "true"
    ) {
      return res
        .status(409)
        .json({
          ok: false,

          error: {
            code:
              "NOT_PUBLISHED",

            message:
              "Only published workflows execute. Use allowDraft=true only for hackathon testing.",
          },
        });
    }

    const context =
      await loadProjectContext(
        workflow.projectName
      );

    const validation =
      validateWorkflow(
        workflow.toObject(),
        context
      );

    if (
      !validation.valid
    ) {
      return res
        .status(400)
        .json({
          ok: false,

          error: {
            code:
              "INVALID_WORKFLOW",

            message:
              "Workflow validation failed before execution",

            details:
              validation.errors,
          },
        });
    }

    const triggerPayload =
      req.body
        .triggerPayload ||
      req.body ||
      {};

    const data =
      await executeWorkflow(
        workflow,

        triggerPayload,

        {
          dryRun:
            req.query
              .dryRun ===
            "true",
        }
      );

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        ok: false,

        error: {
          code:
            "EXECUTION_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function runs(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const docs =
      await WorkflowRun
        .find({
          workflowId:
            req.params.id,
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    res.json({
      ok: true,

      data:
        docs.map(
          serializeRun
        ),

      count:
        docs.length,
    });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "RUNS_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function runById(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const run =
      await WorkflowRun
        .findById(
          req.params.runId
        )
        .lean();

    if (!run) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Run not found",
          },
        });
    }

    res.json({
      ok: true,

      data:
        serializeRun(run),
    });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "RUN_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function createVersion(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const current =
      await Workflow
        .findById(
          req.params.id
        )
        .lean();

    if (!current) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    const latest =
      await Workflow
        .findOne({
          familyId:
            current.familyId,
        })
        .sort({
          version: -1,
        })
        .lean();

    const next = {
      ...current,
      ...req.body,
    };

    delete next._id;
    delete next.createdAt;
    delete next.updatedAt;
    delete next.__v;

    next.version =
      (
        latest?.version ||
        current.version
      ) + 1;

    next.baseVersion =
      current.version;

    next.status =
      "draft";

    next.isActive =
      false;

    next.publishedAt =
      null;

    next.editSource =
      req.body
        .editSource ||
      "manual";

    next.changeSummary =
      req.body
        .changeSummary ||
      `Created from version ${current.version}`;

    const context =
      await loadProjectContext(
        next.projectName
      );

    const validation =
      validateWorkflow(
        next,
        context
      );

    if (
      !validation.valid
    ) {
      return res
        .status(400)
        .json({
          ok: false,

          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Version not created",

            details:
              validation.errors,
          },
        });
    }

    const created =
      await Workflow.create(
        next
      );

    res
      .status(201)
      .json({
        ok: true,

        data:
          serializeWorkflow(
            created
          ),

        validation,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "VERSION_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function versions(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const current =
      await Workflow
        .findById(
          req.params.id
        )
        .lean();

    if (!current) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    const docs =
      await Workflow
        .find({
          familyId:
            current.familyId,

          isDeleted:
            false,
        })
        .sort({
          version: -1,
        })
        .lean();

    res.json({
      ok: true,

      data:
        docs.map(
          serializeWorkflow
        ),
    });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "VERSIONS_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function publish(req, res) {
  try {
    if (!needDb(res)) {
      return;
    }

    const current = await Workflow.findById(req.params.id);

    if (!current) {
      return res.status(404).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Workflow not found",
        },
      });
    }

    const context = await loadProjectContext(current.projectName);
    const validation = validateWorkflow(current.toObject(), context);

    if (!validation.valid) {
      return res.status(400).json({
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Workflow was not published",
          details: validation.errors,
        },
      });
    }

    // Try transactional update first, fallback to sequential updates for standalone MongoDB
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      await Workflow.updateMany(
        {
          familyId: current.familyId,
          status: "published",
          _id: { $ne: current._id },
        },
        {
          status: "archived",
          isActive: false,
        },
        { session }
      );

      current.status = "published";
      current.isActive = true;
      current.publishedAt = new Date();

      await current.save({ session });
      await session.commitTransaction();
    } catch (txErr) {
      if (session) {
        try {
          if (session.inTransaction()) {
            await session.abortTransaction();
          }
        } catch (_) {}
      }

      // Standalone MongoDB fallback
      await Workflow.updateMany(
        {
          familyId: current.familyId,
          status: "published",
          _id: { $ne: current._id },
        },
        {
          status: "archived",
          isActive: false,
        }
      );

      current.status = "published";
      current.isActive = true;
      current.publishedAt = new Date();
      await current.save();
    } finally {
      if (session) {
        try {
          await session.endSession();
        } catch (_) {}
      }
    }

    res.json({
      ok: true,
      data: serializeWorkflow(current),
    });
  } catch (error) {
    res.status(error.message === "Workflow not found" ? 404 : 400).json({
      ok: false,
      error: {
        code: "PUBLISH_FAILED",
        message: error.message,
      },
    });
  }
}

async function createDraft(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const current =
      await Workflow
        .findById(
          req.params.id
        )
        .lean();

    if (!current) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    const existing =
      await Workflow
        .findOne({
          familyId:
            current.familyId,

          status:
            "draft",

          isDeleted:
            false,
        })
        .sort({
          version: -1,
        });

    if (existing) {
      return res.json({
        ok: true,

        data:
          serializeWorkflow(
            existing
          ),

        existing:
          true,
      });
    }

    req.body = {
      changeSummary:
        `Draft from version ${current.version}`,
    };

    return createVersion(
      req,
      res
    );
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "DRAFT_FAILED",

          message:
            error.message,
        },
      });
  }
}

function proposeAgentChanges(
  workflow,
  instruction
) {
  const text =
    instruction.toLowerCase();

  const changes = [];

  const draft =
    JSON.parse(
      JSON.stringify(
        workflow
      )
    );

  const steps =
    draft.steps || [];

  if (
    text.includes(
      "inventory"
    ) &&
    text.includes(
      "physical"
    )
  ) {
    const step =
      steps.find(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              "inventory"
            )
      );

    if (step) {
      step.condition = {
        field:
          "{{trigger.stock_type}}",

        operator:
          "eq",

        value:
          "physical",
      };

      changes.push({
        op:
          "updateStep",

        stepId:
          step.stepId,

        changes: {
          condition:
            step.condition,
        },
      });
    }
  }

  const rename =
    text.match(
      /rename\s+(step-\d+)\s+to\s+(.+?)(?:\s+without|$)/i
    );

  if (rename) {
    const step =
      steps.find(
        (item) =>
          item.stepId ===
          rename[1]
      );

    if (step) {
      step.name =
        rename[2].trim();

      changes.push({
        op:
          "updateStep",

        stepId:
          step.stepId,

        changes: {
          name:
            step.name,
        },
      });
    }
  }

  if (
    text.includes(
      "stop"
    ) &&
    text.includes(
      "invoice"
    ) &&
    text.includes(
      "fail"
    )
  ) {
    const step =
      steps.find(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              "invoice"
            )
      );

    if (step) {
      step.onFailure =
        "abort";

      changes.push({
        op:
          "updateStep",

        stepId:
          step.stepId,

        changes: {
          onFailure:
            "abort",
        },
      });
    }
  }

  if (
    text.includes(
      "add an approval step"
    ) ||
    text.includes(
      "add approval step"
    )
  ) {
    const before =
      steps.findIndex(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              "send confirmation"
            )
      );

    const index =
      before >= 0
        ? before
        : steps.length;

    const maximumId =
      Math.max(
        0,

        ...steps.map(
          (step) =>
            Number(
              (
                step.stepId.match(
                  /\d+/
                ) || [
                  "0",
                ]
              )[0]
            )
        )
      );

    const newId =
      `step-${String(
        maximumId + 1
      ).padStart(
        3,
        "0"
      )}`;

    const newStep = {
      stepId:
        newId,

      name:
        "Approval",

      order:
        index + 1,

      actionType:
        "operation",

      formId:
        "asset-request-form",

      buttonId:
        "approve-request",

      inputMapping: {
        id:
          "{{trigger._id}}",
      },

      condition: null,

      onSuccess: null,

      onFailure:
        "abort",
    };

    steps.splice(
      index,
      0,
      newStep
    );

    steps.forEach(
      (step, i) => {
        step.order =
          i + 1;
      }
    );

    steps.forEach(
      (step, i) => {
        if (
          i <
            steps.length -
              1 &&
          (
            !step.onSuccess ||
            step.onSuccess ===
              newStep.stepId ||
            step === newStep
          )
        ) {
          step.onSuccess =
            steps[i + 1]
              .stepId;
        }

        if (
          i ===
          steps.length - 1
        ) {
          step.onSuccess =
            null;
        }
      }
    );

    changes.push({
      op:
        "addStep",

      beforeStepId:
        steps[index + 1]
          ?.stepId ||
        null,

      step:
        newStep,
    });
  }

  return {
    changes,
    draft,
  };
}

async function agentEdit(req, res) {
  try {
    if (!needDb(res)) {
      return;
    }

    const current = await Workflow.findById(req.params.id).lean();

    if (!current) {
      return res.status(404).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Workflow not found",
        },
      });
    }

    const instruction = req.body.instruction;

    if (!instruction) {
      return res.status(400).json({
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "instruction is required",
        },
      });
    }

    const context = await loadProjectContext(current.projectName);

    let proposal = null;

    // 1. Try Bedrock LLM for agent editing
    if (process.env.BEDROCK_API_KEY || process.env.LLM_API_KEY) {
      try {
        const patchResult = await generateAgentPatch({
          workflow: current,
          instruction,
          context,
        });

        if (patchResult && patchResult.changes && patchResult.proposedWorkflow) {
          const normalizedDraft = normalizeWorkflow(
            patchResult.proposedWorkflow,
            current.projectName,
            context,
            0
          );
          normalizedDraft.version = (current.version || 1) + 1;
          normalizedDraft.baseVersion = current.version || 1;
          normalizedDraft.editSource = "agent";
          normalizedDraft.changeSummary = instruction;
          normalizedDraft.status = "draft";
          normalizedDraft.isActive = false;

          const validation = validateWorkflow(normalizedDraft, context);

          proposal = {
            changes: patchResult.changes,
            draft: normalizedDraft,
            validation,
            confidence: patchResult.confidence || 0.94,
            warnings: validation.warnings || [],
          };
        }
      } catch (llmErr) {
        console.warn("Bedrock Agent edit warning (falling back to rule engine):", llmErr.message);
      }
    }

    // 2. Fallback to rule engine if LLM did not produce a proposal
    if (!proposal) {
      const fallbackProposal = proposeAgentChanges(current, instruction);

      if (!fallbackProposal.changes.length) {
        return res.status(422).json({
          ok: false,
          error: {
            code: "UNSUPPORTED_EDIT",
            message: "This agent could not map the instruction to a safe structured patch.",
          },
        });
      }

      const validation = validateWorkflow(fallbackProposal.draft, context);
      proposal = {
        changes: fallbackProposal.changes,
        draft: fallbackProposal.draft,
        validation,
        confidence: validation.valid ? 0.92 : 0.55,
        warnings: validation.warnings,
      };
    }

    res.json({
      ok: true,
      data: {
        workflowId: req.params.id,
        baseVersion: current.version,
        changes: proposal.changes,
        proposedWorkflow: serializeWorkflow(proposal.draft),
        warnings: proposal.warnings,
        validationErrors: proposal.validation?.errors || [],
        confidence: proposal.confidence,
        changeSummary: instruction,
        requiresApproval: true,
      },
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: {
        code: "AGENT_EDIT_FAILED",
        message: error.message,
      },
    });
  }
}

async function applyAgentEdit(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    if (
      req.body.approved !==
      true
    ) {
      return res
        .status(400)
        .json({
          ok: false,

          error: {
            code:
              "APPROVAL_REQUIRED",

            message:
              "approved=true is required before persistence",
          },
        });
    }

    const current =
      await Workflow
        .findById(
          req.params.id
        )
        .lean();

    if (!current) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    if (
      req.body.baseVersion !==
        undefined &&
      Number(
        req.body.baseVersion
      ) !== current.version
    ) {
      return res
        .status(409)
        .json({
          ok: false,

          error: {
            code:
              "STALE_VERSION",

            message:
              "Base version is no longer current. Re-run agent edit.",
          },
        });
    }

    const proposal =
      proposeAgentChanges(
        current,
        req.body
          .instruction ||
          ""
      );

    const context =
      await loadProjectContext(
        current.projectName
      );

    const validation =
      validateWorkflow(
        proposal.draft,
        context
      );

    if (
      !validation.valid
    ) {
      return res
        .status(400)
        .json({
          ok: false,

          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Agent edit was not persisted",

            details:
              validation.errors,
          },
        });
    }

    req.body = {
      ...proposal.draft,

      editSource:
        "agent",

      changeSummary:
        req.body
          .instruction,
    };

    return createVersion(
      req,
      res
    );
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "AGENT_APPLY_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function getStats(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const projectName =
      req.query
        .projectName;

    const query = {
      isDeleted:
        false,

      ...(projectName
        ? {
            projectName,
          }
        : {}),
    };

    const [
      total,
      published,
      draft,
      archived,
      runsCount,
    ] =
      await Promise.all([
        Workflow
          .countDocuments(
            query
          ),

        Workflow
          .countDocuments({
            ...query,
            status:
              "published",
          }),

        Workflow
          .countDocuments({
            ...query,
            status:
              "draft",
          }),

        Workflow
          .countDocuments({
            ...query,
            status:
              "archived",
          }),

        WorkflowRun
          .countDocuments(
            projectName
              ? {
                  projectName,
                }
              : {}
          ),
      ]);

    res.json({
      ok: true,

      data: {
        totalWorkflows:
          total,

        publishedWorkflows:
          published,

        draftWorkflows:
          draft,

        archivedWorkflows:
          archived,

        totalRuns:
          runsCount,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        ok: false,

        error: {
          code:
            "STATS_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function exportWorkflow(
  req,
  res
) {
  try {
    if (!needDb(res)) {
      return;
    }

    const workflow =
      await Workflow
        .findById(
          req.params.id
        )
        .lean();

    if (!workflow) {
      return res
        .status(404)
        .json({
          ok: false,

          error: {
            code:
              "NOT_FOUND",

            message:
              "Workflow not found",
          },
        });
    }

    const safe =
      serializeWorkflow(
        workflow
      );

    delete safe.nodes;
    delete safe.edges;

    res.json({
      ok: true,
      data: safe,
    });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,

        error: {
          code:
            "EXPORT_FAILED",

          message:
            error.message,
        },
      });
  }
}

async function testLLM(
  req,
  res
) {
  try {
    const messages =
      Array.isArray(req.body?.messages) &&
      req.body.messages.length > 0
        ? req.body.messages
        : [
            {
              role: "user",
              content:
                req.body?.prompt ||
                "Reply with a short confirmation that the LLM connection works.",
            },
          ];

    const response =
      await invokeLLM(messages, {
        maxTokens:
          req.body?.maxTokens,
        temperature:
          req.body?.temperature,
      });

    res.json({
      ok: true,
      data: response,
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: {
        code: "LLM_REQUEST_FAILED",
        message: error.message,
      },
    });
  }
}

async function testVLM(req, res) {
  try {
    const messages =
      Array.isArray(req.body?.messages) && req.body.messages.length > 0
        ? req.body.messages
        : [
            {
              role: "user",
              content:
                req.body?.prompt ||
                "Reply with a short confirmation that the VLM connection works.",
            },
          ];

    const response = await invokeVLM(messages, {
      maxTokens: req.body?.maxTokens,
      temperature: req.body?.temperature,
    });

    res.json({
      ok: true,
      data: response,
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: {
        code: "VLM_REQUEST_FAILED",
        message: error.message,
      },
    });
  }
}

async function getTemplates(req, res) {
  const templates = [
    {
      id: "complaint-processing",
      name: "Customer Complaint Processing",
      category: "Customer Service",
      description: "Multi-actor complaint handling across CA, PA, SA, QM, and CRM with anomaly checks and repair warranty.",
      requirement: "The Product or Service Complaint Processing is a customer service support process that involves Complaints Attendant, Product Analyst, Service Analyst, Quality Manager, and Customer Relationship Manager. The process starts when a customer registers a complaint. If customer is not located inform customer. If problem is not solved notify QM to check for anomaly. If related to service, Service Analyst generates diagnosis. If related to product, Product Analyst checks warranty and sends repair instructions.",
    },
    {
      id: "job-application",
      name: "Job Application & Probation",
      category: "Human Resources",
      description: "Workflow for job application reporting, interview negotiation, probation rating, and permanent placement.",
      requirement: "You have to regularly report to which companies you wrote job applications. Companies confirm receipt and rate the application. An interview is negotiated. When hired, enter probation phase and rate the company. If permanent, the process ends.",
    },
    {
      id: "order-placed",
      name: "Order Processing",
      category: "E-Commerce",
      description: "Notify vendor, create invoice, conditionally update inventory for physical stock, and send confirmation.",
      requirement: "When an order is placed, notify the vendor, create an invoice, update inventory if stock is physical, then send a confirmation to the customer.",
    },
    {
      id: "asset-request",
      name: "Asset Request Approval",
      category: "IT & Operations",
      description: "Validate asset request, notify approver, create asset record if approved, or notify requester of rejection.",
      requirement: "When an asset request is submitted, validate the request, notify the approver. If approved, update status and create asset record; if rejected, notify requester.",
    },
    {
      id: "invoice-settlement",
      name: "Invoice Settlement",
      category: "Finance",
      description: "Verify invoice, mark paid, release payment, and generate receipt.",
      requirement: "When an invoice is received, verify the invoice, mark invoice paid, release vendor payment, and generate a receipt.",
    },
  ];

  res.json({
    ok: true,
    data: {
      templates,
    },
  });
}

module.exports = {
  detect,
  create,
  getAll,
  getById,
  update,
  softDelete,
  validateEndpoint,
  validateById,
  trigger,
  runs,
  runById,
  createVersion,
  versions,
  publish,
  createDraft,
  agentEdit,
  applyAgentEdit,
  getStats,
  exportWorkflow,
  testLLM,
  testVLM,
  getTemplates,
};