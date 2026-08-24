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

  it("should reject login if email is NOT registered", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      body: {
        email: "unregistered.person@example.com",
        password: "anyPassword123",
      },
    };
    const res = createMockRes();

    await authController.login(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.ok, false);
    assert.strictEqual(res.body.error, "This email is not registered. Please sign up first.");
  });

  it("should reject login if password is incorrect", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      body: {
        email: "test.user@example.com",
        password: "WRONG_PASSWORD_XYZ",
      },
    };
    const res = createMockRes();

    await authController.login(req, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.ok, false);
    assert.strictEqual(res.body.error, "Invalid password. Please check your credentials.");
  });

  it("should reject registration if email is already registered", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      body: {
        name: "Duplicate User",
        email: "test.user@example.com",
        password: "newPassword123",
        country: "India",
        location: "Mumbai",
      },
    };
    const res = createMockRes();

    await authController.register(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.body.ok, false);
    assert.strictEqual(res.body.error, "This email is already registered. Please log in instead.");
  });

  it("should reject registration if required fields are missing", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      body: {
        name: "",
        email: "incomplete@example.com",
        password: "123",
      },
    };
    const res = createMockRes();

    await authController.register(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.ok, false);
  });

  it("should get user profile by email", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      query: { email: "test.user@example.com" },
    };
    const res = createMockRes();

    await authController.getProfile(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.email, "test.user@example.com");
  });

  it("should update user profile including phone, gender, and location", async () => {
    const req = {
      app: { locals: { dbConnected: false } },
      body: {
        currentEmail: "test.user@example.com",
        name: "Test User Updated",
        phone: "+91 9988776655",
        gender: "Female",
        country: "India",
        location: "Pune",
      },
    };
    const res = createMockRes();

    await authController.updateProfile(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.name, "Test User Updated");
    assert.strictEqual(res.body.user.phone, "+91 9988776655");
    assert.strictEqual(res.body.user.gender, "Female");
    assert.strictEqual(res.body.user.location, "Pune");
  });
});
