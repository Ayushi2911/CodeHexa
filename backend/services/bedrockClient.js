const axios = require("axios");

const BASE_URL =
  process.env.BEDROCK_BASE_URL ||
  "https://bedrock-runtime.us-east-1.amazonaws.com";

const LLM_MODEL =
  process.env.LLM_MODEL_ID ||
  "qwen.qwen3-coder-next";

const VLM_MODEL =
  process.env.VLM_MODEL_ID ||
  "qwen.qwen3-vl-235b-a22b";

function getHeaders() {
  const apiKey = process.env.BEDROCK_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey || apiKey === "replace-me") {
    throw new Error(
      "BEDROCK_API_KEY is not configured"
    );
  }

  const token = apiKey.startsWith("Bearer ")
    ? apiKey.slice(7).trim()
    : apiKey.trim();

  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function extractMessageContent(responseData) {
  if (!responseData) return "";
  if (typeof responseData === "string") return responseData;
  if (responseData.choices && responseData.choices[0]?.message?.content) {
    return responseData.choices[0].message.content;
  }
  if (responseData.message?.content) {
    return responseData.message.content;
  }
  return JSON.stringify(responseData);
}

function cleanAndParseJSON(text) {
  if (!text || typeof text !== "string") return null;

  let cleaned = text.trim();
  // Strip markdown ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // Try parsing directly
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Attempt extracting first JSON array or object
    const startObj = cleaned.indexOf("{");
    const startArr = cleaned.indexOf("[");

    if (startArr !== -1 && (startObj === -1 || startArr < startObj)) {
      const endArr = cleaned.lastIndexOf("]");
      if (endArr !== -1 && endArr > startArr) {
        try {
          return JSON.parse(cleaned.slice(startArr, endArr + 1));
        } catch (e) {
          // ignore
        }
      }
    }

    if (startObj !== -1) {
      const endObj = cleaned.lastIndexOf("}");
      if (endObj !== -1 && endObj > startObj) {
        try {
          return JSON.parse(cleaned.slice(startObj, endObj + 1));
        } catch (e) {
          // ignore
        }
      }
    }
  }

  return null;
}

async function invokeModel({
  modelId,
  messages,
  maxTokens = 2048,
  temperature = 0.2,
}) {
  const url = `${BASE_URL}/model/${modelId}/invoke`;

  const response = await axios.post(
    url,
    {
      messages,
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: getHeaders(),
      timeout: 60000,
    }
  );

  return response.data;
}

async function invokeLLM(messages, options = {}) {
  return invokeModel({
    modelId: LLM_MODEL,
    messages,
    maxTokens: options.maxTokens || 2048,
    temperature: options.temperature ?? 0.2,
  });
}

async function invokeVLM(messages, options = {}) {
  return invokeModel({
    modelId: VLM_MODEL,
    messages,
    maxTokens: options.maxTokens || 2048,
    temperature: options.temperature ?? 0.2,
  });
}

/**
 * Generate structured workflow intermediate representations from natural language requirement
 */
async function generateStructuredWorkflow({
  projectName,
  requirement,
  context = {},
  examplePayload = null,
}) {
  const systemPrompt = `You are an expert Business Workflow Detection and Architecture Engine for enterprise automation.
Your task is to analyze a natural-language business requirement and project context (schemas, custom functions, buttons), and output an array of one or more structured Workflow IR objects.

Real-World Business Workflow Guidelines:
1. SENSITIVITY:
   - If the user provides a simple, direct requirement (e.g. "When an order is created, create invoice and send confirmation"), produce a clean linear workflow without artificial fluff.
   - If the user requirement contains decision points, condition checks, payment failures, retry attempts, stock availability, approvals, rejections, or exceptions, accurately model them as distinct decision gates, retry loops, and fallback paths.
2. DECISION GATES & BRANCHES:
   - For condition checks ("is product in stock?", "is payment successful?", "is applicant qualified?"), use actionType="decision".
   - Set "condition" with { "field": "{{trigger.fieldName}}" or "{{step-001.outputField}}", "operator": "eq"|"neq"|"gt"|"gte"|"lt"|"lte", "value": ... }.
   - Set "onSuccess" (or onTrue) to the positive/happy path stepId.
   - Set "onFailure" (or onFalse) to the fallback/alternate/rejection stepId.
3. RETRIES & LOOPS:
   - When a step should retry an earlier action on failure (e.g., "retry payment up to 3 times"), set "retryTarget" to the target stepId (e.g., "step-004") and "onFailure" to the cancellation/fallback stepId if retries are exhausted.
4. MULTIPLE TERMINAL ENDS:
   - Successful branches should culminate in success termination (onSuccess: null or "complete").
   - Failure, cancellation, or rejection branches should culminate in explicit rollback/cancellation actions (e.g. Cancel Order, Send Rejection) with onFailure: "abort" or onSuccess: null.

Canonical Output JSON Schema:
[
  {
    "workflowName": "string (PascalCase, e.g. ComplaintProcessing, OrderFulfillment, JobApplicationProbation)",
    "description": "string (human-readable summary)",
    "triggerEvent": {
      "type": "formCreate" | "formUpdate" | "formDelete" | "manual" | "webhook",
      "schema": "string or null"
    },
    "steps": [
      {
        "stepId": "step-001",
        "name": "string (e.g. Check Inventory, Is Product In Stock?, Process Payment, Retry Payment, Cancel Order)",
        "order": 1,
        "actionType": "function" | "formCreate" | "formUpdate" | "formDelete" | "operation" | "decision" | "retry",
        "functionName": "string or null",
        "schema": "string or null",
        "formId": "string or null",
        "buttonId": "string or null",
        "inputMapping": {
          "fieldKey": "{{trigger.fieldName}}" or "{{step-001.outputField}}" or "literalValue"
        },
        "condition": null or {
          "field": "{{trigger.fieldName}}" or "{{step-001.outputField}}",
          "operator": "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in",
          "value": "string or number or boolean"
        },
        "onSuccess": "step-002" or null,
        "onFailure": "abort" | "skip" | "step-xxx",
        "retryTarget": "step-xxx" or null
      }
    ],
    "confidence": number (between 0.70 and 0.98),
    "warnings": [ "string" ]
  }
]

Rules:
1. Every step must have a unique sequential stepId ("step-001", "step-002", etc.).
2. Step order must be 1-based sequential integers.
3. In inputMapping, use handlebars syntax like {{trigger.orderId}} or {{step-001.vendorId}} or literal values.
4. Return ONLY valid JSON array with NO conversational commentary.`;

  const userPrompt = `Project Name: ${projectName}
Project Context:
- Available Schemas: ${JSON.stringify(context.schemas?.map(s => s.schemaName || s.name || s) || [])}
- Available Functions: ${JSON.stringify(context.functions?.map(f => f.functionName || f.name || f) || [])}
- Available Buttons/Operations: ${JSON.stringify(context.buttons?.map(b => ({ formId: b.formId, buttonId: b.buttonId, name: b.name })) || [])}

Requirement Text:
${requirement}

${examplePayload ? `Example Trigger Payload:\n${JSON.stringify(examplePayload, null, 2)}` : ""}

Detect and output the workflow JSON array:`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const raw = await invokeLLM(messages, { maxTokens: 3000, temperature: 0.1 });
  const content = extractMessageContent(raw);
  const parsed = cleanAndParseJSON(content);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed;
  }
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.workflows)) {
    return parsed.workflows;
  }
  if (parsed && typeof parsed === "object" && parsed.workflowName) {
    return [parsed];
  }

  throw new Error("Could not parse valid workflow array from LLM response");
}

/**
 * Generate structured agent edit patch for natural language editing
 */
async function generateAgentPatch({
  workflow,
  instruction,
  context = {},
}) {
  const systemPrompt = `You are an expert AI Workflow Editing Agent for PS11.
Given an existing workflow definition and a natural-language modification instruction, you must produce a structured edit proposal patch and the resulting updated workflow draft.

The proposal format must be JSON:
{
  "workflowId": "${workflow._id || workflow.id || 'wf-current'}",
  "baseVersion": ${workflow.version || 1},
  "changes": [
    {
      "op": "addStep" | "updateStep" | "removeStep" | "reorderStep",
      "stepId": "step-xxx",
      "afterStepId": "step-xxx" (optional),
      "beforeStepId": "step-xxx" (optional),
      "step": { /* full step object if addStep */ },
      "changes": { /* partial changed fields if updateStep */ }
    }
  ],
  "proposedWorkflow": {
    /* the complete updated workflow object with steps, onSuccess, onFailure properly updated */
  },
  "warnings": [],
  "confidence": 0.95,
  "changeSummary": "Human-readable summary of the edit"
}

Output ONLY valid JSON.`;

  const userPrompt = `Current Workflow:
${JSON.stringify(workflow, null, 2)}

Project Context:
- Available Schemas: ${JSON.stringify(context.schemas?.map(s => s.schemaName || s.name || s) || [])}
- Available Functions: ${JSON.stringify(context.functions?.map(f => f.functionName || f.name || f) || [])}
- Available Buttons: ${JSON.stringify(context.buttons?.map(b => b.buttonId || b.name) || [])}

User Instruction:
${instruction}

Produce the structured edit JSON:`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const raw = await invokeLLM(messages, { maxTokens: 3000, temperature: 0.1 });
  const content = extractMessageContent(raw);
  const parsed = cleanAndParseJSON(content);

  if (parsed && parsed.changes && parsed.proposedWorkflow) {
    return parsed;
  }

  throw new Error("Could not generate valid agent edit proposal");
}

module.exports = {
  invokeModel,
  invokeLLM,
  invokeVLM,
  extractMessageContent,
  cleanAndParseJSON,
  generateStructuredWorkflow,
  generateAgentPatch,
};