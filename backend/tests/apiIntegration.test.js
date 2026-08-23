const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
require("dotenv").config();

const workflowController = require("../controllers/workflowController");
const { SAMPLE_CONTEXT } = require("../utils/sampleContext");

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

describe("PS11 API Integration Tests", () => {
  it("should detect workflow via workflowController.detect", async () => {
    const req = {
      body: {
        projectName: "sample-flow",
        requirement: "When an order is placed, notify vendor, create invoice, and send confirmation.",
      },
    };
    const res = createMockRes();

    await workflowController.detect(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1);
    assert.ok(res.body.data[0].steps.length >= 3);
  });

  it("should validate workflow via workflowController.validateEndpoint", async () => {
    const req = {
      body: {
        projectName: "sample-flow",
        workflowName: "TestWorkflow",
        triggerEvent: { type: "formCreate", schema: "orders" },
        steps: [
          {
            stepId: "step-001",
            name: "Notify Vendor",
            order: 1,
            actionType: "function",
            functionName: "NotifyVendorOnOrder",
            inputMapping: { orderId: "{{trigger._id}}" },
            onSuccess: "step-002",
            onFailure: "abort",
          },
          {
            stepId: "step-002",
            name: "Create Invoice",
            order: 2,
            actionType: "formCreate",
            schema: "invoices",
            inputMapping: { order_id: "{{trigger._id}}" },
            onSuccess: null,
            onFailure: "abort",
          },
        ],
      },
    };
    const res = createMockRes();

    await workflowController.validateEndpoint(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.data.valid, true);
  });
});
