function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function detectWorkflow(requirement = "") {
  const text = requirement.trim();

  if (!text) {
    return {
      success: false,
      message: "Workflow requirement is required.",
    };
  }

  const lower = text.toLowerCase();

  const nodes = [];
  const edges = [];
  const warnings = [];

  // -------------------------
  // TRIGGER
  // -------------------------

  let triggerLabel = "Workflow Trigger";

  if (lower.includes("new order") || lower.includes("order arrives")) {
    triggerLabel = "New Order";
  } else if (lower.includes("new customer") || lower.includes("customer signs")) {
    triggerLabel = "New Customer";
  } else if (lower.includes("email")) {
    triggerLabel = "Email Received";
  } else if (lower.includes("payment")) {
    triggerLabel = "Payment Event";
  } else if (lower.includes("form")) {
    triggerLabel = "Form Submitted";
  }

  const triggerId = createId("trigger");

  nodes.push({
    id: triggerId,
    type: "trigger",
    label: triggerLabel,
    description: "Starting point of the workflow.",
    config: {
      event: triggerLabel,
    },
    position: {
      x: 100,
      y: 100,
    },
  });

  let previousId = triggerId;
  let y = 250;

  // -------------------------
  // ACTION DETECTION
  // -------------------------

  const actions = [];

  if (
    lower.includes("validate") ||
    lower.includes("verify") ||
    lower.includes("check")
  ) {
    actions.push({
      type: "action",
      label: "Validate Data",
      description: "Validate the incoming information.",
    });
  }

  if (lower.includes("approve") || lower.includes("approval")) {
    actions.push({
      type: "action",
      label: "Approval",
      description: "Request or verify approval.",
    });
  }

  if (
    lower.includes("database") ||
    lower.includes("save") ||
    lower.includes("store")
  ) {
    actions.push({
      type: "action",
      label: "Save to Database",
      description: "Store workflow data in the database.",
    });
  }

  if (
    lower.includes("email") ||
    lower.includes("notify") ||
    lower.includes("notification")
  ) {
    actions.push({
      type: "action",
      label: "Send Notification",
      description: "Send a notification to the required recipient.",
    });
  }

  if (
    lower.includes("assign") ||
    lower.includes("team") ||
    lower.includes("employee")
  ) {
    actions.push({
      type: "action",
      label: "Assign Task",
      description: "Assign the task to the appropriate person or team.",
    });
  }

  if (
    lower.includes("payment") ||
    lower.includes("charge") ||
    lower.includes("refund")
  ) {
    actions.push({
      type: "action",
      label: "Process Payment",
      description: "Process the payment-related operation.",
    });
  }

  if (actions.length === 0) {
    actions.push({
      type: "action",
      label: "Process Request",
      description: "Process the incoming workflow request.",
    });

    warnings.push(
      "The system could not identify a specific business action from the requirement."
    );
  }

  // -------------------------
  // BUILD ACTION NODES
  // -------------------------

  actions.forEach((action, index) => {
    const nodeId = createId(`action${index + 1}`);

    nodes.push({
      id: nodeId,
      type: action.type,
      label: action.label,
      description: action.description,
      config: {},
      position: {
        x: 100,
        y,
      },
    });

    edges.push({
      id: createId("edge"),
      source: previousId,
      target: nodeId,
      label: "Next",
      condition: "",
    });

    previousId = nodeId;
    y += 150;
  });

  // -------------------------
  // CONDITION
  // -------------------------

  const hasCondition =
    lower.includes("if ") ||
    lower.includes("when ") ||
    lower.includes("unless ") ||
    lower.includes("only if");

  if (hasCondition) {
    const conditionId = createId("condition");

    const lastAction = nodes[nodes.length - 1];

    nodes.push({
      id: conditionId,
      type: "condition",
      label: "Check Condition",
      description: "Evaluate the business condition before continuing.",
      config: {
        expression: "Business condition detected from requirement",
      },
      position: {
        x: 100,
        y,
      },
    });

    // Remove the previous edge into the last action only when
    // there is actually an action before the condition.
    if (lastAction && lastAction.type === "action") {
      const lastEdge = edges[edges.length - 1];

      if (lastEdge && lastEdge.target === lastAction.id) {
        lastEdge.target = conditionId;
      }

      edges.push({
        id: createId("condition-edge"),
        source: conditionId,
        target: lastAction.id,
        label: "Yes",
        condition: "condition === true",
      });
    }

    y += 150;

    warnings.push(
      "A business condition was detected. Review the condition before activating the workflow."
    );
  }

  // -------------------------
  // CONFIDENCE
  // -------------------------

  let confidence = 0.55;

  if (text.length > 20) confidence += 0.05;
  if (actions.length >= 1) confidence += 0.1;
  if (actions.length >= 2) confidence += 0.1;
  if (hasCondition) confidence += 0.05;
  if (lower.includes("then")) confidence += 0.05;

  confidence = Math.min(confidence, 0.95);

  // -------------------------
  // WORKFLOW NAME
  // -------------------------

  const name = createWorkflowName(triggerLabel, actions);

  return {
    success: true,
    workflow: {
      name,
      requirement: text,
      status: "draft",
      confidence,
      warnings,
      source: "detected",
      version: 1,
      variables: {},
      nodes,
      edges,
    },
  };
}

function createWorkflowName(triggerLabel, actions) {
  if (triggerLabel === "New Order") {
    return "Order Processing Workflow";
  }

  if (triggerLabel === "New Customer") {
    return "Customer Onboarding Workflow";
  }

  if (actions.some((action) => action.label === "Process Payment")) {
    return "Payment Processing Workflow";
  }

  return `${triggerLabel} Automation`;
}

module.exports = {
  detectWorkflow,
};
