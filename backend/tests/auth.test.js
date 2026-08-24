const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
require("dotenv").config();

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

describe("Auth Controller Unit Tests", () => {
  it("should register a new user with name, email, password, country, and location", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      body: {
        name: "Test User",
        email: "test.user@example.com",
        password: "secretPassword123",
        country: "India",
        location: "Mumbai",
      },
    };
    const res = createMockRes();

    await authController.register(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.name, "Test User");
    assert.strictEqual(res.body.user.email, "test.user@example.com");
    assert.strictEqual(res.body.user.country, "India");
    assert.strictEqual(res.body.user.location, "Mumbai");
    assert.ok(res.body.token);
  });

  it("should login with registered credentials", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      body: {
        email: "test.user@example.com",
        password: "secretPassword123",
      },
    };
    const res = createMockRes();

    await authController.login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.email, "test.user@example.com");
    assert.strictEqual(res.body.user.country, "India");
  });

  it("should handle Google sign in / sign up with country and location", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      body: {
        name: "Google Explorer",
        email: "explorer@gmail.com",
        country: "United States",
        location: "San Francisco",
      },
    };
    const res = createMockRes();

    await authController.googleAuth(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.authProvider, "google");
    assert.strictEqual(res.body.user.country, "United States");
  });
});
