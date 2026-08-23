const {
  TEMPLATE,
  extractTemplateRefs,
} = require("../utils/mappingResolver");

const {
  SUPPORTED_OPERATORS,
} = require(
  "../utils/conditionEvaluator"
);

const TRIGGERS = [
  "formCreate",
  "formUpdate",
  "formDelete",
  "manual",
  "webhook",
];

const ACTIONS = [
  "function",
  "formCreate",
  "formUpdate",
  "formDelete",
  "operation",
];

function contextSet(
  list,
  keys
) {
  return new Set(
    (list || [])
      .map((item) =>
        keys
          .map(
            (key) =>
              item?.[key]
          )
          .find(Boolean)
      )
      .filter(Boolean)
  );
}

function validateWorkflow(
  workflow,
  projectContext = null
) {
  const errors = [];
  const warnings = [];

  if (
    !workflow ||
    typeof workflow !== "object"
  ) {
    return {
      valid: false,
      errors: [
        "Workflow must be an object",
      ],
      warnings,
    };
  }

  if (!workflow.projectName) {
    errors.push(
      "projectName is required"
    );
  }

  if (!workflow.workflowName) {
    errors.push(
      "workflowName is required"
    );
  }

  if (
    !workflow.triggerEvent ||
    !TRIGGERS.includes(
      workflow.triggerEvent.type
    )
  ) {
    errors.push(
      `triggerEvent.type must be one of: ${TRIGGERS.join(
        ", "
      )}`
    );
  }

  if (
    workflow.triggerEvent &&
    [
      "formCreate",
      "formUpdate",
      "formDelete",
    ].includes(
      workflow.triggerEvent.type
    ) &&
    !workflow.triggerEvent.schema
  ) {
    errors.push(
      "triggerEvent.schema is required for form triggers"
    );
  }

  const steps =
    Array.isArray(workflow.steps)
      ? workflow.steps
      : [];

  if (!steps.length) {
    errors.push(
      "Workflow must contain at least one step"
    );
  }

  const ids = new Set();
  const orders = new Set();
  const byId = new Map();

  const schemas =
    contextSet(
      projectContext?.schemas,
      [
        "schemaName",
        "name",
        "schema",
      ]
    );

  const functions =
    contextSet(
      projectContext?.functions,
      [
        "functionName",
        "name",
      ]
    );

  const buttons = new Set(
    (
      projectContext?.buttons ||
      []
    ).map(
      (button) =>
        `${String(
          button.formId
        )}::${String(
          button.buttonId ||
            button._id
        )}`
    )
  );

  for (const step of steps) {
    if (!step.stepId) {
      errors.push(
        "Every step needs stepId"
      );
    } else if (
      ids.has(step.stepId)
    ) {
      errors.push(
        `Duplicate stepId: ${step.stepId}`
      );
    } else {
      ids.add(step.stepId);

      byId.set(
        step.stepId,
        step
      );
    }

    if (
      !Number.isInteger(
        step.order
      ) ||
      step.order < 1
    ) {
      errors.push(
        `${step.stepId || "step"} has invalid order`
      );
    } else if (
      orders.has(step.order)
    ) {
      errors.push(
        `Duplicate step order: ${step.order}`
      );
    } else {
      orders.add(step.order);
    }

    if (
      !ACTIONS.includes(
        step.actionType
      )
    ) {
      errors.push(
        `${step.stepId}: unsupported actionType ${step.actionType}`
      );
    }

    if (
      step.actionType ===
        "function" &&
      !step.functionName
    ) {
      errors.push(
        `${step.stepId}: functionName is required`
      );
    }

    if (
      [
        "formCreate",
        "formUpdate",
        "formDelete",
      ].includes(
        step.actionType
      ) &&
      !step.schema
    ) {
      errors.push(
        `${step.stepId}: schema is required`
      );
    }

    if (
      step.actionType ===
        "operation" &&
      (!step.formId ||
        !step.buttonId)
    ) {
      errors.push(
        `${step.stepId}: formId and buttonId are required for operation`
      );
    }

    if (projectContext) {
      if (
        step.actionType ===
          "function" &&
        step.functionName &&
        functions.size &&
        !functions.has(
          step.functionName
        )
      ) {
        warnings.push(
          `${step.stepId}: function ${step.functionName} was not found in project context`
        );
      }

      if (
        [
          "formCreate",
          "formUpdate",
          "formDelete",
        ].includes(
          step.actionType
        ) &&
        step.schema &&
        schemas.size &&
        !schemas.has(
          step.schema
        )
      ) {
        warnings.push(
          `${step.stepId}: schema ${step.schema} was not found in project context`
        );
      }

      if (
        step.actionType ===
          "operation" &&
        buttons.size &&
        !buttons.has(
          `${String(
            step.formId
          )}::${String(
            step.buttonId
          )}`
        )
      ) {
        warnings.push(
          `${step.stepId}: operation formId/buttonId was not found in project context`
        );
      }
    }

    for (
      const ref of
      extractTemplateRefs(
        step.inputMapping || {}
      )
    ) {
      if (
        ref.namespace !==
          "trigger" &&
        !ids.has(
          ref.namespace
        ) &&
        !steps.some(
          (other) =>
            other.stepId ===
            ref.namespace
        )
      ) {
        errors.push(
          `${step.stepId}: inputMapping references unknown step ${ref.namespace}`
        );
      }
    }

    if (step.condition) {
      if (
        typeof step.condition
          .field !==
          "string" ||
        !TEMPLATE.test(
          step.condition.field
        )
      ) {
        errors.push(
          `${step.stepId}: condition.field must be a template such as {{trigger.status}}`
        );
      }

      if (
        !SUPPORTED_OPERATORS.includes(
          step.condition.operator
        )
      ) {
        errors.push(
          `${step.stepId}: unsupported condition operator ${step.condition.operator}`
        );
      }
    }
  }

  for (const step of steps) {
    if (
      step.onSuccess &&
      !ids.has(step.onSuccess)
    ) {
      errors.push(
        `${step.stepId}: onSuccess references missing step ${step.onSuccess}`
      );
    }

    if (
      step.onFailure &&
      ![
        "abort",
        "skip",
      ].includes(
        step.onFailure
      ) &&
      !ids.has(
        step.onFailure
      )
    ) {
      errors.push(
        `${step.stepId}: onFailure references missing step ${step.onFailure}`
      );
    }
  }

  const visiting =
    new Set();

  const visited =
    new Set();

  function visit(id) {
    if (visiting.has(id)) {
      return false;
    }

    if (visited.has(id)) {
      return true;
    }

    visiting.add(id);

    const step =
      byId.get(id);

    const targets = [];

    if (step?.onSuccess) {
      targets.push(
        step.onSuccess
      );
    }

    if (
      step?.onFailure &&
      ![
        "abort",
        "skip",
      ].includes(
        step.onFailure
      )
    ) {
      targets.push(
        step.onFailure
      );
    }

    for (
      const target of
      targets
    ) {
      if (!visit(target)) {
        return false;
      }
    }

    visiting.delete(id);
    visited.add(id);

    return true;
  }

  for (const id of ids) {
    if (!visit(id)) {
      errors.push(
        "Workflow must be a DAG; cycle detected"
      );
      break;
    }
  }

  return {
    valid:
      errors.length === 0,

    errors: [
      ...new Set(errors),
    ],

    warnings: [
      ...new Set(warnings),
    ],
  };
}

module.exports = {
  TRIGGERS,
  ACTIONS,
  validateWorkflow,
};