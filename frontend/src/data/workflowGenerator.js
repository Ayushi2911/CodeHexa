export function generateWorkflowFromRequirement(requirement) {
  const text = (requirement || "").toLowerCase();

  // Default workflow structure
  const workflow = {
    workflowId: crypto.randomUUID(),
    name: "Generated Workflow",
    version: 1,
    status: "draft",
    confidence: 0.86,

    trigger: {
      id: "trigger-1",
      type: "trigger",
      name: "Workflow Started",
      source: "user-input"
    },

    steps: []
  };

  // Detect Complaint Processing (PS11)
  if (text.includes("complaint") || text.includes("warranty") || text.includes("ca") || text.includes("crm")) {
    workflow.name = "Complaint Processing Workflow";
    workflow.trigger = {
      id: "trigger-1",
      type: "trigger",
      name: "Complaint Received",
      source: "crm_portal"
    };

    workflow.steps.push({
      id: "step-001",
      type: "action",
      actionType: "formCreate",
      name: "Log Complaint",
      target: "complaintSchema",
      inputMapping: {
        complaintId: "{{trigger.complaintId}}",
        customerId: "{{trigger.customerId}}",
        description: "{{trigger.description}}"
      },
      onSuccess: "step-002",
      onFailure: "stop"
    });

    workflow.steps.push({
      id: "step-002",
      type: "function",
      actionType: "function",
      name: "Check Anomaly & Warranty",
      target: "diagnoseComplaint",
      inputMapping: {
        complaintId: "{{step-001.complaintId}}"
      },
      onSuccess: "step-003",
      onFailure: "stop"
    });

    workflow.steps.push({
      id: "step-003",
      type: "action",
      actionType: "formCreate",
      name: "Customer Notification & Resolution",
      target: "sendNotification",
      inputMapping: {
        customerId: "{{trigger.customerId}}",
        status: "RESOLVED"
      },
      onSuccess: "end",
      onFailure: "stop"
    });

    return workflow;
  }

  // Detect Job Application (PS11)
  if (text.includes("job") || text.includes("applicant") || text.includes("interview") || text.includes("probation")) {
    workflow.name = "Job Application & Probation Workflow";
    workflow.trigger = {
      id: "trigger-1",
      type: "trigger",
      name: "Job Application Submitted",
      source: "careers_portal"
    };

    workflow.steps.push({
      id: "step-001",
      type: "action",
      actionType: "formCreate",
      name: "Screen Resume & Report Applicant",
      target: "applicationSchema",
      inputMapping: {
        applicantId: "{{trigger.applicantId}}",
        skills: "{{trigger.skills}}"
      },
      onSuccess: "step-002",
      onFailure: "stop"
    });

    workflow.steps.push({
      id: "step-002",
      type: "function",
      actionType: "function",
      name: "Interview & Offer Negotiation",
      target: "conductInterview",
      inputMapping: {
        applicantId: "{{step-001.applicantId}}"
      },
      onSuccess: "step-003",
      onFailure: "stop"
    });

    workflow.steps.push({
      id: "step-003",
      type: "function",
      actionType: "function",
      name: "Probation Performance Review",
      target: "reviewProbation",
      inputMapping: {
        applicantId: "{{step-001.applicantId}}"
      },
      onSuccess: "end",
      onFailure: "stop"
    });

    return workflow;
  }

  // Detect order
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
