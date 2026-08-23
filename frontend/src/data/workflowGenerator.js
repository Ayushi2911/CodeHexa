export function generateWorkflowFromRequirement(requirement) {
  const text = (requirement || "").toLowerCase();

  // Default workflow structure
  const workflow = {
    workflowId: `wf-${Date.now()}`,
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

  // 1. Order Processing (Default E-Commerce Flow)
  if (text.includes("order") || text.includes("invoice") || text.includes("inventory") || text.includes("vendor")) {
    workflow.name = "Order Processing Workflow";
    workflow.trigger = {
      id: "trigger-1",
      type: "trigger",
      name: "Order Placed",
      source: "orders"
    };

    workflow.steps = [
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
    ];

    return workflow;
  }

  // 2. Complaint Processing (PS11)
  if (text.includes("complaint") || text.includes("warranty") || text.includes("ca") || text.includes("crm")) {
    workflow.name = "Complaint Processing Workflow";
    workflow.trigger = {
      id: "trigger-1",
      type: "trigger",
      name: "Complaint Received",
      source: "crm_portal"
    };

    workflow.steps = [
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
    ];

    return workflow;
  }

  // 3. Job Application (PS11)
  if (text.includes("job") || text.includes("applicant") || text.includes("interview") || text.includes("probation")) {
    workflow.name = "Job Application & Probation Workflow";
    workflow.trigger = {
      id: "trigger-1",
      type: "trigger",
      name: "Job Application Submitted",
      source: "careers_portal"
    };

    workflow.steps = [
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
        inputMapping: {
          applicantId: "{{step-001.applicantId}}"
        },
        onSuccess: "end",
        onFailure: "stop"
      }
    ];

    return workflow;
  }

  // 4. Customer Onboarding
  if (text.includes("onboard") || text.includes("signup") || text.includes("sign up") || text.includes("customer")) {
    workflow.name = "Customer Onboarding Workflow";
    workflow.trigger = {
      id: "trigger-1",
      type: "trigger",
      name: "Customer Signed Up",
      source: "auth_service"
    };

    workflow.steps = [
      {
        id: "step-001",
        stepId: "step-001",
        type: "action",
        actionType: "formCreate",
        name: "Verify Identity",
        target: "identityVerification",
        inputMapping: {
          userId: "{{trigger.userId}}",
          email: "{{trigger.email}}"
        },
        onSuccess: "step-002",
        onFailure: "stop"
      },
      {
        id: "step-002",
        stepId: "step-002",
        type: "operation",
        actionType: "operation",
        name: "Provision Account",
        target: "accounts",
        inputMapping: {
          userId: "{{trigger.userId}}"
        },
        onSuccess: "step-003",
        onFailure: "stop"
      },
      {
        id: "step-003",
        stepId: "step-003",
        type: "function",
        actionType: "function",
        name: "Send Welcome Email",
        target: "sendWelcomeEmail",
        inputMapping: {
          email: "{{trigger.email}}",
          name: "{{trigger.name}}"
        },
        onSuccess: "end",
        onFailure: "stop"
      }
    ];

    return workflow;
  }

  // 5. Default Fallback
  workflow.steps = [
    {
      id: "step-001",
      stepId: "step-001",
      type: "action",
      actionType: "formCreate",
      name: "Process Business Request",
      target: "requestSchema",
      inputMapping: {
        rawInput: "{{trigger.payload}}"
      },
      onSuccess: "step-002",
      onFailure: "stop"
    },
    {
      id: "step-002",
      stepId: "step-002",
      type: "function",
      actionType: "function",
      name: "Dispatch Action",
      target: "dispatchAction",
      inputMapping: {
        requestId: "{{step-001.requestId}}"
      },
      onSuccess: "end",
      onFailure: "stop"
    }
  ];

  return workflow;
}
