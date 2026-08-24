// CodeHexa Flow Intelligent Multi-Workflow & Resolution Generator

<<<<<<< HEAD
  // Default workflow structure
  const workflow = {
    workflowId: crypto.randomUUID(),
    name: "Generated Workflow",
    version: 1,
    status: "draft",
=======
export function analyzeRequirement(requirement, projectName = "sample-flow") {
  const text = (requirement || "").trim().toLowerCase();
>>>>>>> 72a7db04888a680adccd5bddbdfd9c8597523366

  // 1. Check for vague or underspecified requirements
  const isVague =
    text.length < 15 ||
    (text.includes("make") && (text.includes("better") || text.includes("faster") || text.includes("good"))) ||
    (!text.includes("when") && !text.includes("if") && !text.includes("on ") && !text.includes("placed") && !text.includes("create") && !text.includes("submit"));

  if (isVague && !text.includes("order") && !text.includes("complaint") && !text.includes("job") && !text.includes("signup")) {
    return {
      type: "NO_WORKFLOW_DETECTED",
      reason: "Underspecified natural-language intent",
      suggestions: [
        "What starts the process (e.g. 'When an order is placed')",
        "What actions should happen (e.g. 'notify vendor, create invoice')",
        "Any conditions controlling those actions (e.g. 'if stock_type == physical')"
      ],
      example: "When an order is created, notify the vendor and create an invoice."
    };
  }

  // 2. Check for Multiple Independent Workflows
  const hasMultipleChains =
    (text.includes("when") && text.split("when").length > 2) ||
    (text.includes("order is placed") && text.includes("cancelled")) ||
    (text.includes("order is placed") && text.includes("refund")) ||
    (text.includes("and also when")) ||
    (text.includes("; when"));

  if (hasMultipleChains) {
    const wf1 = {
      id: "wf-order-placed",
      stepId: "wf-order-placed",
      workflowId: "wf-order-placed",
      name: "OrderPlaced",
      projectName,
      version: 1,
      status: "ready",
      confidence: 0.88,
      validationPassed: true,
      trigger: {
        id: "trigger-1",
        type: "trigger",
        name: "Order Created",
        source: "orders"
      },
      steps: [
        {
          id: "step-001",
          stepId: "step-001",
          type: "function",
          actionType: "function",
          name: "Notify Vendor",
          target: "NotifyVendorOnOrder",
          functionName: "NotifyVendorOnOrder",
          inputMapping: {
            orderId: "{{trigger.orderId}}",
            vendorId: "{{trigger.vendorId}}"
          },
          onSuccess: "step-002",
          onFailure: "stop"
        },
        {
          id: "step-002",
          stepId: "step-002",
          type: "action",
          actionType: "formCreate",
          name: "Create Invoice",
          target: "invoices",
          schema: "invoices",
          inputMapping: {
            order_id: "{{trigger.orderId}}",
            vendor_id: "{{step-001.vendorId}}",
            amount: "{{trigger.totalAmount}}"
          },
          onSuccess: "step-003",
          onFailure: "stop"
        },
        {
          id: "step-003",
          stepId: "step-003",
          type: "operation",
          actionType: "operation",
          name: "Update Inventory",
          target: "inventory",
          condition: {
            field: "{{trigger.stock_type}}",
            operator: "eq",
            value: "physical"
          },
          inputMapping: {
            itemId: "{{trigger.itemId}}",
            quantity: "{{trigger.quantity}}"
          },
          onSuccess: "step-004",
          onFailure: "skip"
        },
        {
          id: "step-004",
          stepId: "step-004",
          type: "function",
          actionType: "function",
          name: "Send Confirmation",
          target: "SendOrderConfirmation",
          functionName: "SendOrderConfirmation",
          inputMapping: {
            customerEmail: "{{trigger.customerEmail}}",
            invoiceId: "{{step-002.invoiceId}}"
          },
          onSuccess: "end",
          onFailure: "stop"
        }
      ]
    };

    const wf2 = {
      id: "wf-order-cancelled",
      stepId: "wf-order-cancelled",
      workflowId: "wf-order-cancelled",
      name: "OrderCancelled",
      projectName,
      version: 1,
      status: "ready",
      confidence: 0.92,
      validationPassed: true,
      trigger: {
        id: "trigger-2",
        type: "trigger",
        name: "Order Cancelled",
        source: "orders"
      },
      steps: [
        {
          id: "step-101",
          stepId: "step-101",
          type: "function",
          actionType: "function",
          name: "Refund Customer",
          target: "processRefund",
          functionName: "processRefund",
          inputMapping: {
            orderId: "{{trigger.orderId}}",
            amount: "{{trigger.totalAmount}}"
          },
          onSuccess: "step-102",
          onFailure: "stop"
        },
        {
          id: "step-102",
          stepId: "step-102",
          type: "operation",
          actionType: "operation",
          name: "Restore Inventory",
          target: "inventory",
          inputMapping: {
            itemId: "{{trigger.itemId}}",
            quantity: "{{trigger.quantity}}"
          },
          onSuccess: "step-103",
          onFailure: "stop"
        },
        {
          id: "step-103",
          stepId: "step-103",
          type: "function",
          actionType: "function",
          name: "Send Cancellation Notice",
          target: "sendCancellationEmail",
          functionName: "sendCancellationEmail",
          inputMapping: {
            customerEmail: "{{trigger.customerEmail}}",
            reason: "{{trigger.cancelReason}}"
          },
          onSuccess: "end",
          onFailure: "stop"
        }
      ]
    };

    return {
      type: "MULTIPLE_WORKFLOWS",
      workflows: [wf1, wf2]
    };
  }

  // 3. Check for Unresolved Actions / Action Resolution Needed
  const hasUnresolvedAction =
    text.includes("fraud") ||
    text.includes("verification") ||
    text.includes("risk assessment") ||
    text.includes("blockchain");

  if (hasUnresolvedAction) {
    const singleWf = generateSingleWorkflow(text, projectName);
    // Add unresolved step
    const unresolvedStep = {
      id: "step-fraud-check",
      stepId: "step-fraud-check",
      type: "unresolved",
      actionType: "unresolved",
      name: "Fraud Verification",
      target: "unresolved",
      isUnresolved: true,
      suggestedAction: "VerifyOrderRisk",
      availableOptions: [
        { label: "VerifyOrderRisk (Built-in Security Service)", target: "VerifyOrderRisk", type: "function" },
        { label: "ValidateCustomerCredit (Payment Gateway)", target: "ValidateCustomerCredit", type: "function" },
        { label: "CheckSecurityAlerts (Internal Risk Engine)", target: "CheckSecurityAlerts", type: "function" }
      ],
      inputMapping: {
        orderId: "{{trigger.orderId}}",
        riskScore: "{{trigger.riskScore}}"
      },
      onSuccess: "step-004",
      onFailure: "stop"
    };

    // Insert before send confirmation
    singleWf.steps.splice(2, 0, unresolvedStep);
    singleWf.status = "needs_review";
    singleWf.validationPassed = false;

    return {
      type: "RESOLUTION_REQUIRED",
      workflow: singleWf,
      unresolvedStep
    };
  }

  // 4. Default Single Workflow Detected
  const wf = generateSingleWorkflow(text, projectName);
  return {
    type: "SINGLE_WORKFLOW",
    workflows: [wf]
  };
}

export function generateSingleWorkflow(text, projectName = "sample-flow") {
  // 1. Order Processing
  if (text.includes("order") || text.includes("invoice") || text.includes("inventory") || text.includes("vendor")) {
    return {
      id: "wf-order-placed",
      stepId: "wf-order-placed",
      workflowId: "wf-order-placed",
      name: "OrderPlaced",
      projectName,
      version: 1,
      status: "ready",
      confidence: 0.88,
      validationPassed: true,
      trigger: {
        id: "trigger-1",
        type: "trigger",
        name: "Order Created",
        source: "orders"
      },
      steps: [
        {
          id: "step-001",
          stepId: "step-001",
          type: "function",
          actionType: "function",
          name: "Notify Vendor",
          target: "NotifyVendorOnOrder",
          functionName: "NotifyVendorOnOrder",
          inputMapping: {
            orderId: "{{trigger.orderId}}",
            vendorId: "{{trigger.vendorId}}"
          },
          onSuccess: "step-002",
          onFailure: "stop"
        },
        {
          id: "step-002",
          stepId: "step-002",
          type: "action",
          actionType: "formCreate",
          name: "Create Invoice",
          target: "invoices",
          schema: "invoices",
          inputMapping: {
            order_id: "{{trigger.orderId}}",
            vendor_id: "{{step-001.vendorId}}",
            amount: "{{trigger.totalAmount}}"
          },
          onSuccess: "step-003",
          onFailure: "stop"
        },
        {
          id: "step-003",
          stepId: "step-003",
          type: "operation",
          actionType: "operation",
          name: "Update Inventory",
          target: "inventory",
          condition: {
            field: "{{trigger.stock_type}}",
            operator: "eq",
            value: "physical"
          },
          inputMapping: {
            itemId: "{{trigger.itemId}}",
            quantity: "{{trigger.quantity}}"
          },
          onSuccess: "step-004",
          onFailure: "skip"
        },
        {
          id: "step-004",
          stepId: "step-004",
          type: "function",
          actionType: "function",
          name: "Send Confirmation",
          target: "SendOrderConfirmation",
          functionName: "SendOrderConfirmation",
          inputMapping: {
            customerEmail: "{{trigger.customerEmail}}",
            invoiceId: "{{step-002.invoiceId}}"
          },
          onSuccess: "end",
          onFailure: "stop"
        }
      ]
    };
  }

  // 2. Complaint Processing (PS11)
  if (text.includes("complaint") || text.includes("warranty") || text.includes("ca") || text.includes("crm")) {
    return {
      id: "wf-complaint-processing",
      stepId: "wf-complaint-processing",
      workflowId: "wf-complaint-processing",
      name: "ComplaintProcessing",
      projectName,
      version: 1,
      status: "ready",
      confidence: 0.94,
      validationPassed: true,
      trigger: {
        id: "trigger-1",
        type: "trigger",
        name: "Complaint Received",
        source: "crm_portal"
      },
      steps: [
        {
          id: "step-001",
          stepId: "step-001",
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
        },
        {
          id: "step-002",
          stepId: "step-002",
          type: "function",
          actionType: "function",
          name: "Check Anomaly & Warranty",
          target: "diagnoseComplaint",
          functionName: "diagnoseComplaint",
          inputMapping: {
            complaintId: "{{step-001.complaintId}}"
          },
          onSuccess: "step-003",
          onFailure: "stop"
        },
        {
          id: "step-003",
          stepId: "step-003",
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
        }
      ]
    };
  }

  // 3. Job Application (PS11)
  if (text.includes("job") || text.includes("applicant") || text.includes("interview") || text.includes("probation")) {
    return {
      id: "wf-job-application",
      stepId: "wf-job-application",
      workflowId: "wf-job-application",
      name: "JobApplication",
      projectName,
      version: 1,
      status: "ready",
      confidence: 0.91,
      validationPassed: true,
      trigger: {
        id: "trigger-1",
        type: "trigger",
        name: "Job Application Submitted",
        source: "careers_portal"
      },
      steps: [
        {
          id: "step-001",
          stepId: "step-001",
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
        },
        {
          id: "step-002",
          stepId: "step-002",
          type: "function",
          actionType: "function",
          name: "Interview & Offer Negotiation",
          target: "conductInterview",
          functionName: "conductInterview",
          inputMapping: {
            applicantId: "{{step-001.applicantId}}"
          },
          onSuccess: "step-003",
          onFailure: "stop"
        },
        {
          id: "step-003",
          stepId: "step-003",
          type: "function",
          actionType: "function",
          name: "Probation Performance Review",
          target: "reviewProbation",
          functionName: "reviewProbation",
          inputMapping: {
            applicantId: "{{step-001.applicantId}}"
          },
          onSuccess: "end",
          onFailure: "stop"
        }
      ]
    };
  }

  // Fallback default
  return {
    id: "wf-custom-flow",
    stepId: "wf-custom-flow",
    workflowId: "wf-custom-flow",
    name: "CustomProcess",
    projectName,
    version: 1,
    status: "ready",
    confidence: 0.85,
    validationPassed: true,
    trigger: {
      id: "trigger-1",
      type: "trigger",
      name: "Process Triggered",
      source: "custom_service"
    },
    steps: [
      {
        id: "step-001",
        stepId: "step-001",
        type: "action",
        actionType: "formCreate",
        name: "Process Request",
        target: "processSchema",
        inputMapping: {
          payload: "{{trigger.payload}}"
        },
        onSuccess: "step-002",
        onFailure: "stop"
      },
      {
        id: "step-002",
        stepId: "step-002",
        type: "function",
        actionType: "function",
        name: "Dispatch Notification",
        target: "dispatchService",
        functionName: "dispatchService",
        inputMapping: {
          requestId: "{{step-001.requestId}}"
        },
        onSuccess: "end",
        onFailure: "stop"
      }
    ]
  };
}

export function generateWorkflowFromRequirement(requirement) {
  const result = analyzeRequirement(requirement);
  if (result.type === "SINGLE_WORKFLOW" || result.type === "MULTIPLE_WORKFLOWS") {
    return result.workflows[0];
  }
  if (result.type === "RESOLUTION_REQUIRED") {
    return result.workflow;
  }
  return generateSingleWorkflow(requirement);
}
