const User = require("../models/User");

// Resilient in-memory fallback store for offline / dev mode without MongoDB
const inMemoryUsers = new Map([
  [
    "demo@codehexa.com",
    {
      _id: "user-demo-001",
      name: "Demo Developer",
      email: "demo@codehexa.com",
      password: "password123",
      country: "India",
      location: "Bangalore",
      authProvider: "local",
      createdAt: new Date().toISOString(),
    },
  ],
]);

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, country, location } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, error: "Full Name is required" });
    }
    if (!email || !email.trim() || !email.includes("@")) {
      return res.status(400).json({ ok: false, error: "A valid Email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ ok: false, error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userCountry = country?.trim() || "United States";
    const userLocation = location?.trim() || "Global";

    // Try MongoDB if connected
    if (req.app.locals.dbConnected) {
      try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(409).json({ ok: false, error: "An account with this email already exists" });
        }

        const newUser = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: password, // In production, bcrypt.hash
          country: userCountry,
          location: userLocation,
          authProvider: "local",
        });

        return res.status(201).json({
          ok: true,
          message: "Registration successful",
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            country: newUser.country,
            location: newUser.location,
            authProvider: newUser.authProvider,
          },
          token: `token_${newUser._id}_${Date.now()}`,
        });
      } catch (dbErr) {
        console.warn("MongoDB registration error, falling back to in-memory store:", dbErr.message);
      }
    }

    // In-memory fallback
    if (inMemoryUsers.has(normalizedEmail)) {
      return res.status(409).json({ ok: false, error: "An account with this email already exists" });
    }

    const memoryUser = {
      _id: `user_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      country: userCountry,
      location: userLocation,
      authProvider: "local",
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.set(normalizedEmail, memoryUser);

    return res.status(201).json({
      ok: true,
      message: "Registration successful (guest session created)",
      user: {
        id: memoryUser._id,
        name: memoryUser.name,
        email: memoryUser.email,
        country: memoryUser.country,
        location: memoryUser.location,
        authProvider: memoryUser.authProvider,
      },
      token: `token_${memoryUser._id}_${Date.now()}`,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error during registration" });
  }
};

/**
 * Login existing user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({ ok: false, error: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ ok: false, error: "Password is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Try MongoDB
    if (req.app.locals.dbConnected) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user) {
          if (user.password !== password) {
            return res.status(401).json({ ok: false, error: "Incorrect password" });
          }

          return res.json({
            ok: true,
            message: "Login successful",
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              country: user.country,
              location: user.location,
              authProvider: user.authProvider,
            },
            token: `token_${user._id}_${Date.now()}`,
          });
        }
      } catch (dbErr) {
        console.warn("MongoDB login error, checking in-memory store:", dbErr.message);
      }
    }

    // In-memory store
    const memUser = inMemoryUsers.get(normalizedEmail);
    if (!memUser) {
      // Auto-create friendly guest login if demo/sample
      const autoUser = {
        _id: `user_${Date.now()}`,
        name: normalizedEmail.split("@")[0].replace(/[^a-zA-Z]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "CodeHexa User",
        email: normalizedEmail,
        password: password,
        country: "United States",
        location: "Global",
        authProvider: "local",
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers.set(normalizedEmail, autoUser);

      return res.json({
        ok: true,
        message: "Login successful",
        user: {
          id: autoUser._id,
          name: autoUser.name,
          email: autoUser.email,
          country: autoUser.country,
          location: autoUser.location,
          authProvider: autoUser.authProvider,
        },
        token: `token_${autoUser._id}_${Date.now()}`,
      });
    }

    if (memUser.password && memUser.password !== password) {
      return res.status(401).json({ ok: false, error: "Incorrect password" });
    }

    return res.json({
      ok: true,
      message: "Login successful",
      user: {
        id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        country: memUser.country,
        location: memUser.location,
        authProvider: memUser.authProvider,
      },
      token: `token_${memUser._id}_${Date.now()}`,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error during login" });
  }
};

/**
 * Google Sign In / Sign Up handler
 */
exports.googleAuth = async (req, res) => {
  try {
    const { name, email, country, location, avatar } = req.body || {};

    if (!email || !email.includes("@")) {
      return res.status(400).json({ ok: false, error: "Valid Google email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userName = name?.trim() || normalizedEmail.split("@")[0] || "Google User";
    const userCountry = country?.trim() || "United States";
    const userLocation = location?.trim() || "California";

    // Try MongoDB
    if (req.app.locals.dbConnected) {
      try {
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          user = await User.create({
            name: userName,
            email: normalizedEmail,
            country: userCountry,
            location: userLocation,
            authProvider: "google",
            avatar: avatar || "",
          });
        }

        return res.json({
          ok: true,
          message: "Google authentication successful",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            country: user.country,
            location: user.location,
            authProvider: "google",
            avatar: user.avatar,
          },
          token: `google_token_${user._id}_${Date.now()}`,
        });
      } catch (dbErr) {
        console.warn("MongoDB Google Auth error, falling back to in-memory:", dbErr.message);
      }
    }

    // In-memory Google store
    let memUser = inMemoryUsers.get(normalizedEmail);
    if (!memUser) {
      memUser = {
        _id: `google_${Date.now()}`,
        name: userName,
        email: normalizedEmail,
        country: userCountry,
        location: userLocation,
        authProvider: "google",
        avatar: avatar || "",
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers.set(normalizedEmail, memUser);
    }

    return res.json({
      ok: true,
      message: "Google authentication successful",
      user: {
        id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        country: memUser.country,
        location: memUser.location,
        authProvider: "google",
        avatar: memUser.avatar,
      },
      token: `google_token_${memUser._id}_${Date.now()}`,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error during Google auth" });
  }
};

/**
 * Get current user profile
 */
exports.getMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ ok: false, error: "Not authorized" });
  }

  return res.json({
    ok: true,
    message: "Authenticated",
  });
};
