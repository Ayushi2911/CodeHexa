const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
require("dotenv").config();

const { SAMPLE_CONTEXT } = require("../utils/sampleContext");
const { detectWorkflows, splitChains } = require("../services/workflowDetector");
const { validateWorkflow } = require("../services/workflowValidator");
const { resolveMapping } = require("../utils/mappingResolver");
const { evaluateCondition } = require("../utils/conditionEvaluator");

describe("PS11 Core Workflow Engine Unit Tests", () => {
  it("should split multiple workflow chains properly", () => {
    const input = "When an order is placed notify vendor; also when an order is cancelled trigger refund.";
    const chains = splitChains(input);
    assert.strictEqual(chains.length, 2);
  });

  it("should resolve input mapping templates correctly", () => {
    const context = {
      trigger: { _id: "order-123", totalAmount: 5000, projectName: "sample-flow" },
      "step-001": { vendorId: "vendor-456" },
    };
    const template = {
      orderId: "{{trigger._id}}",
      vendorId: "{{step-001.vendorId}}",
      amount: "{{trigger.totalAmount}}",
      constant: "fixed_val",
    };
    const resolved = resolveMapping(template, context);
    assert.deepStrictEqual(resolved, {
      orderId: "order-123",
      vendorId: "vendor-456",
      amount: 5000,
      constant: "fixed_val",
    });
  });

  it("should evaluate conditions correctly", () => {
    const context = {
      trigger: { stock_type: "physical", approver_response: "approved", amount: 100 },
    };
    assert.strictEqual(
      evaluateCondition({ field: "{{trigger.stock_type}}", operator: "eq", value: "physical" }, context),
      true
    );
    assert.strictEqual(
      evaluateCondition({ field: "{{trigger.stock_type}}", operator: "eq", value: "digital" }, context),
      false
    );
    assert.strictEqual(
      evaluateCondition({ field: "{{trigger.amount}}", operator: "gt", value: 50 }, context),
      true
    );
  });

  it("should detect and validate Complaint Processing workflow", async () => {
    const complaintText = "When a customer registers a complaint, locate customer, check anomaly, diagnose problem, and send repair instructions.";
    const workflows = await detectWorkflows("sample-flow", complaintText, SAMPLE_CONTEXT);
    assert.ok(workflows.length >= 1);
    const wf = workflows[0];
    assert.ok(wf.steps.length >= 3);
    const validation = validateWorkflow(wf, SAMPLE_CONTEXT);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  it("should detect and validate Job Application workflow", async () => {
    const jobText = "When a user submits a job application, confirm receipt, negotiate interview, start probation, and submit company rating.";
    const workflows = await detectWorkflows("sample-flow", jobText, SAMPLE_CONTEXT);
    assert.ok(workflows.length >= 1);
    const wf = workflows[0];
    assert.ok(wf.steps.length >= 3);
    const validation = validateWorkflow(wf, SAMPLE_CONTEXT);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errors.length, 0);
  });
});
