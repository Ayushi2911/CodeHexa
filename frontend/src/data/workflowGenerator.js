export function generateWorkflowFromRequirement(requirement) {
  const text = requirement.toLowerCase();

  // Default workflow structure
  const workflow = {
    workflowId: crypto.randomUUID(),
    name: "Generated Workflow",
    version: 1,
    status: "draft",

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
  }

  // Detect invoice action
  if (text.includes("invoice")) {
    workflow.steps.push({
      id: crypto.randomUUID(),
      type: "action",
      actionType: "formCreate",
      name: "Create Invoice",
      target: "invoice",

      inputMapping: {
        orderId: "{{trigger.orderId}}",
        customerId: "{{trigger.customerId}}",
        amount: "{{trigger.amount}}"
      },

      onSuccess: "next",
      onFailure: "stop"
    });
  }

  // Detect inventory operation
  if (text.includes("inventory")) {
    workflow.steps.push({
      id: crypto.randomUUID(),
      type: "operation",
      actionType: "operation",
      name: "Update Inventory",
      target: "inventory",

      inputMapping: {
        orderItems: "{{trigger.items}}"
      },

      onSuccess: "next",
      onFailure: "stop"
    });
  }

  // Detect notification
  if (
    text.includes("confirmation") ||
    text.includes("notify") ||
    text.includes("email")
  ) {
    workflow.steps.push({
      id: crypto.randomUUID(),
      type: "function",
      actionType: "function",
      name: "Send Confirmation",
      target: "sendConfirmation",

      inputMapping: {
        customerId: "{{trigger.customerId}}",
        orderId: "{{trigger.orderId}}"
      },

      onSuccess: "end",
      onFailure: "stop"
    });
  }

  // Fallback if no keywords were detected
  if (workflow.steps.length === 0) {
    workflow.steps.push({
      id: crypto.randomUUID(),
      type: "action",
      actionType: "operation",
      name: "Process Requirement",
      target: "processRequirement",

      inputMapping: {
        requirement: "{{input.requirement}}"
      },

      onSuccess: "end",
      onFailure: "stop"
    });
  }

  return workflow;
}