const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
require("dotenv").config();

const supportController = require("../controllers/supportController");
const systemController = require("../controllers/systemController");
const workflowController = require("../controllers/workflowController");
const authController = require("../controllers/authController");

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

describe("Support, System & Extended Preferences Integration Tests", () => {
  it("should submit a contact message via supportController.submitContact", async () => {
    const req = {
      body: {
        name: "Enterprise Lead",
        email: "lead@enterprise.com",
        category: "enterprise",
        subject: "Enterprise Deployment",
        message: "We need custom on-premise Bedrock AI pipeline orchestration.",
      },
      ip: "127.0.0.1",
      headers: {},
    };
    const res = createMockRes();

    await supportController.submitContact(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.data.name, "Enterprise Lead");
    assert.strictEqual(res.body.data.email, "lead@enterprise.com");
    assert.strictEqual(res.body.data.category, "enterprise");
  });

  it("should reject contact message if required fields are missing", async () => {
    const req = {
      body: {
        name: "",
        email: "missing@test.com",
        message: "",
      },
      headers: {},
    };
    const res = createMockRes();

    await supportController.submitContact(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.ok, false);
  });

  it("should submit a problem ticket via supportController.submitTicket", async () => {
    const req = {
      body: {
        title: "Workflow validation timeout",
        description: "Large DAG with 20 nodes took > 500ms to validate.",
        userEmail: "lead@enterprise.com",
        severity: "high",
        category: "bug_report",
      },
    };
    const res = createMockRes();

    await supportController.submitTicket(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.ok, true);
    assert.ok(res.body.ticketId);
    assert.strictEqual(res.body.data.priority, "high");
  });

  it("should list messages filtered by userEmail via supportController.getMessages", async () => {
    const req = {
      query: { userEmail: "lead@enterprise.com" },
    };
    const res = createMockRes();

    await supportController.getMessages(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1);
  });

  it("should list FAQs via supportController.getFaqs", () => {
    const req = {};
    const res = createMockRes();

    supportController.getFaqs(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
  });

  it("should list quickstart docs via supportController.getDocs", () => {
    const req = {};
    const res = createMockRes();

    supportController.getDocs(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 2);
  });

  it("should return comprehensive architecture and platform info via systemController.getSystemInfo", async () => {
    const req = {};
    const res = createMockRes();

    await systemController.getSystemInfo(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.data.version, "2.4.0");
    assert.ok(Array.isArray(res.body.data.pillars));
    assert.strictEqual(res.body.data.features.trashRetentionDays, 30);
  });

  it("should return storage statistics via systemController.getStorageStats", async () => {
    const req = {};
    const res = createMockRes();

    await systemController.getStorageStats(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.data.trashRetentionDays, 30);
    assert.strictEqual(res.body.data.totalStorageQuotaMb, 512);
  });

  it("should purge expired trash workflows via workflowController.purgeTrash", async () => {
    const req = {
      body: { days: 0 },
    };
    const res = createMockRes();

    await workflowController.purgeTrash(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.ok(typeof res.body.purgedCount === "number");
  });

  it("should get and update preferences via authController", async () => {
    const updateReq = {
      app: { locals: { dbConnected: false } },
      body: {
        email: "demo@codehexa.com",
        themePreference: "light",
        notificationPreferences: {
          workflowAlerts: true,
          executionAlerts: false,
          systemAlerts: true,
        },
      },
    };
    const updateRes = createMockRes();

    await authController.updatePreferences(updateReq, updateRes);
    assert.strictEqual(updateRes.statusCode, 200);
    assert.strictEqual(updateRes.body.ok, true);

    const getReq = {
      app: { locals: { dbConnected: false } },
      query: { email: "demo@codehexa.com" },
    };
    const getRes = createMockRes();

    await authController.getPreferences(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    assert.strictEqual(getRes.body.ok, true);
    assert.strictEqual(getRes.body.themePreference, "light");
    assert.strictEqual(getRes.body.notificationPreferences.executionAlerts, false);
  });
});
