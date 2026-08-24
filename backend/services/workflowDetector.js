const { generateStructuredWorkflow } = require("./bedrockClient");
const { validateWorkflow } = require("./workflowValidator");

function cleanName(text) {
  return String(text || "")
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function toPascalCase(str) {
  return cleanName(str)
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function hasAny(text, words) {
  const lower = String(text || "").toLowerCase();
  return words.some((word) => lower.includes(word.toLowerCase()));
}

function catalogName(item, keys) {
  return keys
    .map((key) => item?.[key])
    .find(Boolean);
}

function findFunction(context, terms) {
  const functions = context?.functions || [];
  return functions.find((fn) => {
    const haystack = `${catalogName(fn, ["functionName", "name"]) || ""} ${fn.description || ""}`.toLowerCase();
    return terms.some((term) => haystack.includes(term.toLowerCase()));
  });
}

function findButton(context, terms) {
  return (context?.buttons || []).find((button) => {
    const haystack = `${button.name || ""} ${button.label || ""} ${button.type || ""}`.toLowerCase();
    return terms.some((term) => haystack.includes(term.toLowerCase()));
  });
}

function findSchema(context, terms) {
  return (context?.schemas || []).find((schema) => {
    const name = String(catalogName(schema, ["schemaName", "name", "schema"]) || "").toLowerCase();
    return terms.some((term) => name.includes(term.toLowerCase()));
  });
}

function splitChains(requirement) {
  const normalized = String(requirement || "").replace(/\s+/g, " ").trim();

  const parts = normalized
    .split(/(?:;|\.)\s*(?=(?:also\s+)?(?:when|on|run manually|on demand|if an?\s+\w+\s+is))/i)
    .flatMap((part) => part.split(/\b(?:also|and also)\s+(?=(?:when|on)\b)/i))
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length ? parts : [normalized];
}

function detectTrigger(text, context) {
  const lower = String(text || "").toLowerCase();
  let type = "manual";

  if (/\b(webhook|external event)\b/.test(lower)) {
    type = "webhook";
  } else if (/\b(deleted|removed)\b/.test(lower)) {
    type = "formDelete";
  } else if (/\b(approved|rejected|status changes?|updated|changes?)\b/.test(lower)) {
    type = "formUpdate";
  } else if (/\b(placed|created|submitted|registered|new order|new request|complaint|job application)\b/.test(lower)) {
    type = "formCreate";
  }

  const schemaHints = [
    ["complaints", ["complaint", "customer reaching out"]],
    ["job_applications", ["job application", "job offer", "application"]],
    ["orders", ["order"]],
    ["asset_requests", ["asset request", "request"]],
    ["invoices", ["invoice"]],
    ["receipts", ["receipt"]],
    ["assets", ["asset"]],
  ];

  let schema = null;
  for (const [fallback, terms] of schemaHints) {
    if (hasAny(lower, terms)) {
      const found = findSchema(context, terms);
      schema = catalogName(found || {}, ["schemaName", "name", "schema"]) || fallback;
      break;
    }
  }

  if (!schema && ["formCreate", "formUpdate", "formDelete"].includes(type)) {
    const first = context?.schemas?.[0];
    schema = catalogName(first || {}, ["schemaName", "name", "schema"]) || "records";
  }

  return { type, schema };
}

/**
 * Normalizes any raw step object from LLM into canonical PS11 step format
 */
function normalizeSteps(rawSteps, idMap = new Map()) {
  const normalized = [];

  // Pass 1: Build stepId mapping
  rawSteps.forEach((raw, i) => {
    const targetId = `step-${String(i + 1).padStart(3, "0")}`;
    if (raw.stepId) {
      idMap.set(String(raw.stepId), targetId);
    }
    if (raw.id) {
      idMap.set(String(raw.id), targetId);
    }
  });

  // Pass 2: Normalize step fields
  rawSteps.forEach((raw, i) => {
    const stepId = `step-${String(i + 1).padStart(3, "0")}`;
    const order = i + 1;
    const name = String(raw.name || raw.label || `Step ${order}`).trim();

    let rawAction = String(raw.actionType || raw.type || "").toLowerCase();
    let actionType = "function";

    if (["function", "automated", "api", "custom", "script"].includes(rawAction)) {
      actionType = "function";
    } else if (["formcreate", "create", "insert", "manual", "register", "form"].includes(rawAction)) {
      actionType = "formCreate";
    } else if (["formupdate", "update", "edit", "patch"].includes(rawAction)) {
      actionType = "formUpdate";
    } else if (["formdelete", "delete", "remove"].includes(rawAction)) {
      actionType = "formDelete";
    } else if (["operation", "button", "query", "action"].includes(rawAction)) {
      actionType = "operation";
    }

    let functionName = raw.functionName || null;
    let schema = typeof raw.schema === "string" ? raw.schema : (raw.target || null);
    let formId = raw.formId || null;
    let buttonId = raw.buttonId || null;

    if (actionType === "function" && !functionName) {
      functionName = toPascalCase(name) || `Execute${order}`;
    }
    if (["formCreate", "formUpdate", "formDelete"].includes(actionType) && !schema) {
      schema = typeof raw.schema === "object" && raw.schema !== null
        ? "records"
        : (cleanName(name).toLowerCase().replace(/\s+/g, "_") || "records");
    }
    if (actionType === "operation") {
      if (!formId) formId = "default-form";
      if (!buttonId) buttonId = `action-btn-${order}`;
    }

    // Normalize inputMapping
    const inputMapping = {};
    if (raw.inputMapping && typeof raw.inputMapping === "object") {
      for (const [k, v] of Object.entries(raw.inputMapping)) {
        if (typeof v === "string") {
          let mappedVal = v.trim();
          // Convert $trigger.field or $steps.S1.field to {{trigger.field}} or {{step-001.field}}
          if (mappedVal.startsWith("$trigger.")) {
            mappedVal = `{{trigger.${mappedVal.slice(9)}}}`;
          } else if (mappedVal.startsWith("$steps.")) {
            const parts = mappedVal.slice(7).split(".");
            const refStep = idMap.get(parts[0]) || parts[0];
            mappedVal = `{{${refStep}.${parts.slice(1).join(".")}}}`;
          } else if (mappedVal.startsWith("{{") && mappedVal.endsWith("}}")) {
            const inner = mappedVal.slice(2, -2).trim();
            const parts = inner.split(".");
            if (parts[0] !== "trigger" && idMap.has(parts[0])) {
              mappedVal = `{{${idMap.get(parts[0])}.${parts.slice(1).join(".")}}}`;
            }
          }
          inputMapping[k] = mappedVal;
        } else {
          inputMapping[k] = String(v ?? "");
        }
      }
    }

    // Normalize condition
    let condition = null;
    if (raw.condition && typeof raw.condition === "object") {
      let condField = String(raw.condition.field || "");
      if (condField && !condField.startsWith("{{")) {
        condField = `{{${condField}}}`;
      }
      condition = {
        field: condField || "{{trigger.status}}",
        operator: ["eq", "neq", "gt", "gte", "lt", "lte", "in"].includes(raw.condition.operator)
          ? raw.condition.operator
          : "eq",
        value: raw.condition.value ?? "true",
      };
    } else if (typeof raw.condition === "string" && raw.condition.trim()) {
      const condStr = raw.condition.trim();
      const match = condStr.match(/([\w$.]+)\s*(===?|==|!=|!==|>=|<=|>|<)\s*['"]?([^'"]+)['"]?/);
      if (match) {
        let fieldName = match[1].replace(/^\$/, "").replace(/^trigger\./, "");
        let op = "eq";
        if (match[2].includes("!")) op = "neq";
        else if (match[2] === ">") op = "gt";
        else if (match[2] === ">=") op = "gte";
        else if (match[2] === "<") op = "lt";
        else if (match[2] === "<=") op = "lte";
        condition = {
          field: `{{trigger.${fieldName}}}`,
          operator: op,
          value: match[3],
        };
      }
    }

    // Normalize onSuccess & onFailure
    let onSuccess = null;
    if (raw.onSuccess && raw.onSuccess !== "END" && raw.onSuccess !== "null") {
      onSuccess = idMap.get(String(raw.onSuccess)) || raw.onSuccess;
    } else if (i < rawSteps.length - 1) {
      onSuccess = `step-${String(i + 2).padStart(3, "0")}`;
    }

    let onFailure = "abort";
    if (raw.onFailure === "skip") {
      onFailure = "skip";
    } else if (raw.onFailure && raw.onFailure !== "abort" && raw.onFailure !== "END" && raw.onFailure !== raw.stepId) {
      onFailure = idMap.get(String(raw.onFailure)) || "abort";
    }

    normalized.push({
      stepId,
      name,
      order,
      actionType,
      functionName,
      schema,
      formId,
      buttonId,
      inputMapping,
      condition,
      onSuccess,
      onFailure,
    });
  });

  // Ensure last step onSuccess is null
  if (normalized.length > 0) {
    normalized[normalized.length - 1].onSuccess = null;
  }

  return normalized;
}

/**
 * Normalizes an entire workflow document to satisfy PS11 schema contracts
 */
function normalizeWorkflow(rawWf, projectName, context, index = 0) {
  const idMap = new Map();
  const rawSteps = Array.isArray(rawWf.steps) ? rawWf.steps : [];
  const steps = normalizeSteps(rawSteps, idMap);

  let triggerEvent = rawWf.triggerEvent;
  if (!triggerEvent || typeof triggerEvent !== "object" || !["formCreate", "formUpdate", "formDelete", "manual", "webhook"].includes(triggerEvent.type)) {
    triggerEvent = detectTrigger(rawWf.description || rawWf.workflowName || "", context);
  }

  if (["formCreate", "formUpdate", "formDelete"].includes(triggerEvent.type) && !triggerEvent.schema) {
    triggerEvent.schema = steps[0]?.schema || "orders";
  }

  const baseName = cleanName(rawWf.workflowName || rawWf.name || `DetectedWorkflow${index + 1}`).replace(/\s+/g, "") || "DetectedWorkflow";
  const workflowName = index > 0 && !baseName.endsWith(String(index + 1)) ? `${baseName}${index + 1}` : baseName;

  const confidence = typeof rawWf.confidence === "number" && rawWf.confidence > 0
    ? Math.min(0.98, Math.max(0.65, rawWf.confidence))
    : Math.min(0.96, Math.max(0.72, 0.70 + steps.length * 0.04));

  return {
    projectName,
    workflowName,
    description: rawWf.description || `Automated workflow for ${workflowName}`,
    triggerEvent,
    detectedSteps: steps.map((s) => ({
      order: s.order,
      name: s.name,
      actionType: s.actionType,
      candidate: s.functionName || s.schema || `${s.formId}/${s.buttonId}`,
    })),
    steps,
    confidence,
    warnings: Array.isArray(rawWf.warnings) ? rawWf.warnings : [],
  };
}

// -------------------------------------------------------------
// Deterministic Domain Handlers for Fast & Reliable Fallbacks
// -------------------------------------------------------------

function detectComplaintWorkflow(text, context) {
  const steps = [
    {
      name: "Register Complaint",
      actionType: "formCreate",
      schema: "complaints",
      inputMapping: {
        customerName: "{{trigger.name}}",
        cpf: "{{trigger.cpf}}",
        email: "{{trigger.email}}",
        channel: "{{trigger.channel}}",
        productOrServiceCode: "{{trigger.productOrServiceCode}}",
        complaintDescription: "{{trigger.complaintDescription}}",
      },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Locate Customer Record",
      actionType: "function",
      functionName: "LocateCustomer",
      inputMapping: {
        cpf: "{{trigger.cpf}}",
        email: "{{trigger.email}}",
      },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Attempt Attendant Resolution",
      actionType: "operation",
      formId: "complaint-form",
      buttonId: "resolve-complaint",
      inputMapping: {
        complaintId: "{{step-001._id}}",
      },
      condition: null,
      onFailure: "skip",
    },
    {
      name: "Notify Quality Manager on Anomaly",
      actionType: "function",
      functionName: "NotifyQualityManager",
      inputMapping: {
        complaintId: "{{step-001._id}}",
        productCode: "{{trigger.productOrServiceCode}}",
      },
      condition: {
        field: "{{trigger.isResolved}}",
        operator: "neq",
        value: "true",
      },
      onFailure: "skip",
    },
    {
      name: "Perform Problem Analysis",
      actionType: "function",
      functionName: "GenerateServiceDiagnosis",
      inputMapping: {
        complaintId: "{{step-001._id}}",
        complaintType: "{{trigger.complaintType}}",
      },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Send Repair Instructions and Cost",
      actionType: "function",
      functionName: "SendRepairInstructions",
      inputMapping: {
        email: "{{trigger.email}}",
        complaintId: "{{step-001._id}}",
      },
      condition: {
        field: "{{trigger.complaintType}}",
        operator: "eq",
        value: "product",
      },
      onFailure: "abort",
    },
  ];

  return {
    workflowName: "ComplaintProcessing",
    description: "Multi-actor complaint handling process involving CA, PA, SA, QM, and CRM.",
    steps,
  };
}

function detectJobWorkflow(text, context) {
  const steps = [
    {
      name: "Record Job Application",
      actionType: "formCreate",
      schema: "job_applications",
      inputMapping: {
        applicantId: "{{trigger.applicantId}}",
        companyName: "{{trigger.companyName}}",
        applicationDate: "{{trigger.applicationDate}}",
      },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Confirm Application Receipt",
      actionType: "function",
      functionName: "ConfirmApplicationReceipt",
      inputMapping: {
        applicationId: "{{step-001._id}}",
        companyName: "{{trigger.companyName}}",
      },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Negotiate Interview",
      actionType: "function",
      functionName: "NegotiateInterview",
      inputMapping: {
        applicationId: "{{step-001._id}}",
      },
      condition: null,
      onFailure: "skip",
    },
    {
      name: "Start Probation Phase",
      actionType: "formCreate",
      schema: "probation_records",
      inputMapping: {
        applicantId: "{{trigger.applicantId}}",
        companyName: "{{trigger.companyName}}",
      },
      condition: {
        field: "{{trigger.offerAccepted}}",
        operator: "eq",
        value: "true",
      },
      onFailure: "skip",
    },
    {
      name: "Submit Company Rating and Review",
      actionType: "function",
      functionName: "SubmitCompanyRating",
      inputMapping: {
        applicantId: "{{trigger.applicantId}}",
        companyName: "{{trigger.companyName}}",
        rating: "{{trigger.rating}}",
      },
      condition: null,
      onFailure: "abort",
    },
  ];

  return {
    workflowName: "JobApplicationProbation",
    description: "Manages job application reporting, company ratings, interview negotiation, and probation evaluation.",
    steps,
  };
}

function detectOrderWorkflow(text, context) {
  const notifyVendor = findFunction(context, ["notifyvendor", "notify vendor"]);
  const confirmation = findFunction(context, ["sendorderconfirmation", "order confirmation"]);
  const invoices = findSchema(context, ["invoice"]);
  const inventory = findButton(context, ["inventory", "stock"]);

  const steps = [
    {
      name: "Notify Vendor",
      actionType: "function",
      functionName: catalogName(notifyVendor || {}, ["functionName", "name"]) || "NotifyVendorOnOrder",
      inputMapping: {
        orderId: "{{trigger._id}}",
        projectName: "{{trigger.projectName}}",
      },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Create Invoice",
      actionType: "formCreate",
      schema: catalogName(invoices || {}, ["schemaName", "name", "schema"]) || "invoices",
      inputMapping: {
        order_id: "{{trigger._id}}",
        vendor_id: "{{step-001.vendorId}}",
        amount: "{{trigger.totalAmount}}",
      },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Update Inventory",
      actionType: "operation",
      formId: inventory?.formId || "inventory-form",
      buttonId: inventory?.buttonId || inventory?._id?.toString() || "deduct-stock",
      inputMapping: {
        id: "{{trigger.item_id}}",
        projectName: "{{trigger.projectName}}",
      },
      condition: {
        field: "{{trigger.stock_type}}",
        operator: "eq",
        value: "physical",
      },
      onFailure: "skip",
    },
    {
      name: "Send Confirmation",
      actionType: "function",
      functionName: catalogName(confirmation || {}, ["functionName", "name"]) || "SendOrderConfirmation",
      inputMapping: {
        orderId: "{{trigger._id}}",
        invoiceId: "{{step-002._id}}",
      },
      condition: null,
      onFailure: "abort",
    },
  ];

  return {
    workflowName: "OrderPlaced",
    description: "Notify vendor, create invoice, conditionally update inventory, and confirm the order.",
    steps,
  };
}

function detectAssetWorkflow(text, context) {
  const fn = (terms, fallback) =>
    catalogName(findFunction(context, terms) || {}, ["functionName", "name"]) || fallback;

  const assets = catalogName(findSchema(context, ["assets"]) || {}, ["schemaName", "name", "schema"]) || "assets";
  const requests = catalogName(findSchema(context, ["asset_request", "asset request", "request"]) || {}, ["schemaName", "name", "schema"]) || "asset_requests";

  const steps = [
    {
      name: "Validate Request",
      actionType: "function",
      functionName: fn(["validateassetrequest", "validate asset"], "ValidateAssetRequest"),
      inputMapping: { requestId: "{{trigger._id}}" },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Notify Approver",
      actionType: "function",
      functionName: fn(["notifyapprover", "notify approver"], "NotifyApproverOnRequest"),
      inputMapping: { requestId: "{{trigger._id}}" },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Update Request Status",
      actionType: "formUpdate",
      schema: requests,
      inputMapping: { _id: "{{trigger._id}}", status: "approved" },
      condition: { field: "{{trigger.approver_response}}", operator: "eq", value: "approved" },
      onFailure: "abort",
    },
    {
      name: "Create Asset Record",
      actionType: "formCreate",
      schema: assets,
      inputMapping: { request_id: "{{trigger._id}}", asset_type: "{{trigger.requested_asset}}" },
      condition: { field: "{{trigger.approver_response}}", operator: "eq", value: "approved" },
      onFailure: "skip",
    },
    {
      name: "Reject and Notify",
      actionType: "function",
      functionName: fn(["notifyrejection", "rejection"], "NotifyRejection"),
      inputMapping: { requestId: "{{trigger._id}}" },
      condition: { field: "{{trigger.approver_response}}", operator: "eq", value: "rejected" },
      onFailure: "abort",
    },
  ];

  return {
    workflowName: "AssetRequestApproval",
    description: "Validate an asset request and handle approved or rejected outcomes.",
    steps,
  };
}

function detectInvoiceWorkflow(text, context) {
  const fn = (terms, fallback) =>
    catalogName(findFunction(context, terms) || {}, ["functionName", "name"]) || fallback;

  const invoices = catalogName(findSchema(context, ["invoice"]) || {}, ["schemaName", "name", "schema"]) || "invoices";
  const receipts = catalogName(findSchema(context, ["receipt"]) || {}, ["schemaName", "name", "schema"]) || "receipts";

  const steps = [
    {
      name: "Verify Invoice",
      actionType: "function",
      functionName: fn(["verifyinvoice", "verify invoice"], "VerifyInvoice"),
      inputMapping: { invoiceId: "{{trigger._id}}" },
      condition: null,
      onFailure: "abort",
    },
    {
      name: "Mark Invoice Paid",
      actionType: "formUpdate",
      schema: invoices,
      inputMapping: { _id: "{{trigger._id}}", payment_status: "paid" },
      condition: { field: "{{trigger.payment_status}}", operator: "eq", value: "received" },
      onFailure: "abort",
    },
    {
      name: "Release Vendor Payment",
      actionType: "function",
      functionName: fn(["releasepayment", "release payment"], "ReleasePayment"),
      inputMapping: { invoiceId: "{{trigger._id}}" },
      condition: { field: "{{trigger.payment_status}}", operator: "eq", value: "received" },
      onFailure: "abort",
    },
    {
      name: "Generate Receipt",
      actionType: "formCreate",
      schema: receipts,
      inputMapping: { invoice_id: "{{trigger._id}}", amount: "{{trigger.amount}}" },
      condition: null,
      onFailure: "abort",
    },
  ];

  return {
    workflowName: "InvoiceSettlement",
    description: "Verify invoice, mark it paid, release payment, and create a receipt.",
    steps,
  };
}

function genericWorkflow(text, context) {
  const steps = [];
  const warnings = [];

  const clauses = text
    .split(/,|\bthen\b|\band then\b/i)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(1);

  for (const clause of clauses) {
    const lower = clause.toLowerCase();
    let step = null;

    if (hasAny(lower, ["notify", "send notification", "send confirmation", "alert", "email"])) {
      step = {
        name: cleanName(clause),
        actionType: "function",
        functionName: toPascalCase(clause) || "SendNotification",
        inputMapping: { projectName: "{{trigger.projectName}}" },
        condition: null,
        onFailure: "abort",
      };
    } else if (/\b(create|add|register|record|generate)\b/.test(lower)) {
      step = {
        name: cleanName(clause),
        actionType: "formCreate",
        schema: cleanName(clause).toLowerCase().replace(/\s+/g, "_") || "records",
        inputMapping: { projectName: "{{trigger.projectName}}" },
        condition: null,
        onFailure: "abort",
      };
    } else if (/\b(update|change|mark|modify|status)\b/.test(lower)) {
      step = {
        name: cleanName(clause),
        actionType: "formUpdate",
        schema: "records",
        inputMapping: { _id: "{{trigger._id}}" },
        condition: null,
        onFailure: "abort",
      };
    }

    if (step) {
      steps.push(step);
    } else {
      warnings.push(`Clause mapped to generic action: "${clause}"`);
      steps.push({
        name: cleanName(clause) || "Process Action",
        actionType: "function",
        functionName: toPascalCase(clause) || "ProcessStep",
        inputMapping: { id: "{{trigger._id}}" },
        condition: null,
        onFailure: "skip",
      });
    }
  }

  if (!steps.length) {
    steps.push({
      name: "Execute Initial Action",
      actionType: "function",
      functionName: "ExecuteProcess",
      inputMapping: { id: "{{trigger._id}}" },
      condition: null,
      onFailure: "abort",
    });
  }

  return {
    workflowName: cleanName(text.split(",")[0]).replace(/\s+/g, "").slice(0, 50) || "DetectedWorkflow",
    description: text,
    steps,
    warnings,
  };
}

function runFallbackDetection(projectName, requirement, context) {
  const chains = splitChains(requirement);

  return chains.map((chain, index) => {
    const lower = chain.toLowerCase();
    let base;

    if (lower.includes("complaint") || lower.includes("attendant") || lower.includes("service analyst")) {
      base = detectComplaintWorkflow(chain, context);
    } else if (lower.includes("job application") || lower.includes("probation") || lower.includes("job offer")) {
      base = detectJobWorkflow(chain, context);
    } else if (lower.includes("order") && (hasAny(lower, ["vendor", "invoice", "inventory", "confirmation"]) || lower.includes("placed"))) {
      base = detectOrderWorkflow(chain, context);
    } else if (lower.includes("asset") || (lower.includes("request") && hasAny(lower, ["approver", "approved", "rejected"]))) {
      base = detectAssetWorkflow(chain, context);
    } else if (lower.includes("invoice") && hasAny(lower, ["settlement", "payment", "paid", "receipt"])) {
      base = detectInvoiceWorkflow(chain, context);
    } else {
      base = genericWorkflow(chain, context);
    }

    return normalizeWorkflow(base, projectName, context, index);
  });
}

/**
 * Main detection pipeline: Bedrock LLM first, with automatic normalization and robust fallback
 */
async function detectWorkflows(projectName, requirement, context = {}, examplePayload = null) {
  if (!projectName) {
    throw new Error("projectName is required");
  }

  if (!requirement || !requirement.trim()) {
    throw new Error("requirement is required");
  }

  // 1. Try Bedrock LLM
  if (process.env.BEDROCK_API_KEY || process.env.LLM_API_KEY) {
    try {
      const rawResults = await generateStructuredWorkflow({
        projectName,
        requirement,
        context,
        examplePayload,
      });

      if (Array.isArray(rawResults) && rawResults.length > 0) {
        const normalized = rawResults.map((raw, idx) =>
          normalizeWorkflow(raw, projectName, context, idx)
        );

        // Verify valid DAG
        const allValid = normalized.every((wf) => {
          const v = validateWorkflow(wf, context);
          return v.valid;
        });

        if (allValid) {
          return normalized;
        }
      }
    } catch (llmError) {
      console.warn("Bedrock LLM detection warning (falling back to deterministic engine):", llmError.message);
    }
  }

  // 2. Deterministic Fallback Engine
  return runFallbackDetection(projectName, requirement, context);
}

module.exports = {
  detectWorkflows,
  splitChains,
  detectTrigger,
  normalizeWorkflow,
  normalizeSteps,
};