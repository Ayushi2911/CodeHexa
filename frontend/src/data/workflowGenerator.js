export function analyzeRequirement(requirement, projectName = "sample-flow") {
  const normalizedRequirement = (requirement || "").trim();
  const text = normalizedRequirement.toLowerCase();

  if (text.length < 15) {
    return {
      type: "NO_WORKFLOW_DETECTED",
      reason: "Underspecified natural-language intent",
      suggestions: [
        "Describe what starts the process.",
        "List the actions that should happen.",
        "Describe any conditions controlling those actions."
      ],
      example: "When an order is created, notify the vendor and create an invoice."
    };
  }

  const workflow = generateSingleWorkflow(normalizedRequirement, projectName);
  return {
    type: "SINGLE_WORKFLOW",
    workflows: [workflow]
  };
}

export function generateSingleWorkflow(requirement, projectName = "sample-flow") {
  const workflow = generateWorkflowFromRequirement(requirement);
  workflow.projectName = projectName;
  workflow.confidence = workflow.confidence || 0.86;
  workflow.validationPassed = true;
  workflow.id = workflow.id || workflow.workflowId;

  workflow.steps = workflow.steps.map((step, index) => ({
    ...step,
    stepId: step.stepId || step.id || `step-${String(index + 1).padStart(3, "0")}`,
    status: step.status || "pending"
  }));

  return workflow;
}

export function generateWorkflowFromRequirement(requirement) {
  const text = (requirement || "").toLowerCase();

  // If requirement specifies resilient / branching order flow
  if (
    text.includes("order") &&
    (text.includes("retry") ||
      text.includes("fail") ||
      text.includes("check stock") ||
      text.includes("stock") ||
      text.includes("cancel") ||
      text.includes("branch"))
  ) {
    return {
      workflowId: crypto.randomUUID(),
      name: "Order Processing with Resilience",
      version: 1,
      status: "draft",
      confidence: 0.94,
      trigger: {
        id: "trigger-1",
        type: "trigger",
        name: "Order Placed",
        source: "orders",
      },
      steps: [
        {
          id: "step-001",
          stepId: "step-001",
          name: "Check Stock Availability",
          actionType: "decision",
          condition: { field: "{{trigger.stock_available}}", operator: "eq", value: "true" },
          onSuccess: "step-002",
          onFailure: "step-006",
        },
        {
          id: "step-002",
          stepId: "step-002",
          name: "Process Payment",
          actionType: "function",
          functionName: "ProcessPayment",
          target: "ProcessPayment",
          inputMapping: {
            orderId: "{{trigger.orderId}}",
            amount: "{{trigger.amount}}",
          },
          condition: null,
          onSuccess: "step-003",
          onFailure: "step-005",
        },
        {
          id: "step-003",
          stepId: "step-003",
          name: "Create Invoice",
          actionType: "formCreate",
          schema: "invoices",
          target: "invoices",
          inputMapping: {
            orderId: "{{trigger.orderId}}",
            amount: "{{trigger.amount}}",
          },
          condition: null,
          onSuccess: "step-004",
          onFailure: "abort",
        },
        {
          id: "step-004",
          stepId: "step-004",
          name: "Send Confirmation",
          actionType: "function",
          functionName: "SendOrderConfirmation",
          target: "SendOrderConfirmation",
          inputMapping: {
            orderId: "{{trigger.orderId}}",
            invoiceId: "{{step-003.invoiceId}}",
          },
          condition: null,
          onSuccess: null,
          onFailure: "abort",
        },
        {
          id: "step-005",
          stepId: "step-005",
          name: "Retry Payment",
          actionType: "retry",
          retryTarget: "step-002",
          inputMapping: {
            orderId: "{{trigger.orderId}}",
            maxRetries: 3,
          },
          condition: null,
          onSuccess: "step-003",
          onFailure: "step-006",
        },
        {
          id: "step-006",
          stepId: "step-006",
          name: "Cancel Order & Notify Customer",
          actionType: "function",
          functionName: "CancelOrderAndAlert",
          target: "CancelOrderAndAlert",
          inputMapping: {
            orderId: "{{trigger.orderId}}",
            reason: "Stock unavailable or payment failed",
          },
          condition: null,
          onSuccess: null,
          onFailure: "abort",
        },
      ],
    };
  }

  // Asset approval request
  if (text.includes("asset") && (text.includes("approv") || text.includes("reject") || text.includes("request"))) {
    return {
      workflowId: crypto.randomUUID(),
      name: "Asset Request & Approval Flow",
      version: 1,
      status: "draft",
      confidence: 0.92,
      trigger: {
        id: "trigger-1",
        type: "trigger",
        name: "Asset Request Submitted",
        source: "asset_requests",
      },
      steps: [
        {
          id: "step-001",
          stepId: "step-001",
          name: "Validate Request",
          actionType: "function",
          target: "ValidateAssetRequest",
          inputMapping: { requestId: "{{trigger._id}}" },
          onSuccess: "step-002",
          onFailure: "abort",
        },
        {
          id: "step-002",
          stepId: "step-002",
          name: "Is Request Approved?",
          actionType: "decision",
          condition: { field: "{{trigger.approver_response}}", operator: "eq", value: "approved" },
          onSuccess: "step-003",
          onFailure: "step-005",
        },
        {
          id: "step-003",
          stepId: "step-003",
          name: "Update Request Status",
          actionType: "formUpdate",
          target: "asset_requests",
          inputMapping: { _id: "{{trigger._id}}", status: "approved" },
          onSuccess: "step-004",
          onFailure: "abort",
        },
        {
          id: "step-004",
          stepId: "step-004",
          name: "Create Asset Record",
          actionType: "formCreate",
          target: "assets",
          inputMapping: { request_id: "{{trigger._id}}" },
          onSuccess: null,
          onFailure: "skip",
        },
        {
          id: "step-005",
          stepId: "step-005",
          name: "Reject & Notify Employee",
          actionType: "function",
          target: "NotifyRejection",
          inputMapping: { requestId: "{{trigger._id}}" },
          onSuccess: null,
          onFailure: "abort",
        },
      ],
    };
  }

  // Default / Standard workflow structure
  const workflow = {
    workflowId: crypto.randomUUID(),
    name: "Generated Workflow",
    version: 1,
    status: "draft",
    confidence: 0.88,

    trigger: {
      id: "trigger-1",
      type: "trigger",
      name: "Workflow Started",
      source: "user-input"
    },

    steps: []
  };

  // Detect trigger
  if (text.includes("order") && text.includes("placed")) {
    workflow.name = "Order Processing Workflow";

    workflow.trigger = {
      id: "trigger-1",
      type: "trigger",
      name: "Order Placed",
      source: "orders"
    };
  } else if (text.includes("complaint")) {
    workflow.name = "Customer Complaint Handling";
    workflow.trigger = {
      id: "trigger-1",
      type: "trigger",
      name: "Complaint Registered",
      source: "complaints",
    };
  }

  // Detect notify vendor
  if (text.includes("notify vendor") || text.includes("vendor")) {
    workflow.steps.push({
      id: "step-001",
      stepId: "step-001",
      type: "function",
      actionType: "function",
      name: "Notify Vendor",
      target: "NotifyVendorOnOrder",
      inputMapping: {
        orderId: "{{trigger._id}}",
      },
      onSuccess: "next",
      onFailure: "abort",
    });
  }

  // Detect invoice action
  if (text.includes("invoice")) {
    workflow.steps.push({
      id: `step-00${workflow.steps.length + 1}`,
      stepId: `step-00${workflow.steps.length + 1}`,
      type: "action",
      actionType: "formCreate",
      name: "Create Invoice",
      target: "invoices",
      inputMapping: {
        orderId: "{{trigger.orderId}}",
        amount: "{{trigger.amount}}"
      },
      onSuccess: "next",
      onFailure: "abort"
    });
  }

  // Detect inventory operation
  if (text.includes("inventory") || text.includes("stock")) {
    workflow.steps.push({
      id: `step-00${workflow.steps.length + 1}`,
      stepId: `step-00${workflow.steps.length + 1}`,
      type: "operation",
      actionType: "operation",
      name: "Update Inventory",
      target: "inventory-form/deduct-stock",
      inputMapping: {
        orderItems: "{{trigger.items}}"
      },
      condition: {
        field: "{{trigger.stock_type}}",
        operator: "eq",
        value: "physical"
      },
      onSuccess: "next",
      onFailure: "skip"
    });
  }

  // Detect notification / confirmation
  if (
    text.includes("confirmation") ||
    text.includes("notify") ||
    text.includes("email")
  ) {
    workflow.steps.push({
      id: `step-00${workflow.steps.length + 1}`,
      stepId: `step-00${workflow.steps.length + 1}`,
      type: "function",
      actionType: "function",
      name: "Send Confirmation",
      target: "SendOrderConfirmation",
      inputMapping: {
        customerId: "{{trigger.customerId}}",
        orderId: "{{trigger.orderId}}"
      },
      onSuccess: null,
      onFailure: "abort"
    });
  }

  // Fallback if no keywords were detected
  if (workflow.steps.length === 0) {
    workflow.steps.push({
      id: "step-001",
      stepId: "step-001",
      type: "action",
      actionType: "operation",
      name: "Process Requirement",
      target: "processRequirement",
      inputMapping: {
        requirement: "{{input.requirement}}"
      },
      onSuccess: null,
      onFailure: "abort"
    });
  }

  return workflow;
}