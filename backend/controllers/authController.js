const User = require("../models/User");

// In-memory store (acts as fast sync layer & fallback)
const inMemoryUsers = new Map([
  [
    "demo@codehexa.com",
    {
      _id: "user-demo-001",
      name: "Demo Developer",
      email: "demo@codehexa.com",
      password: "password123",
      phone: "+91 9876543210",
      gender: "Male",
      country: "India",
      location: "Bangalore",
      lastConnectedArea: "Bangalore, India (Local Dev)",
      authProvider: "local",
      createdAt: new Date().toISOString(),
    },
  ],
]);

/**
 * Register a new user
 * Required fields: name (username), email, password, country, location
 * Optional: phone, gender, lastConnectedArea
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, country, location, phone, gender, lastConnectedArea } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, error: "Full Name / Username is required." });
    }
    if (!email || !email.trim() || !email.includes("@")) {
      return res.status(400).json({ ok: false, error: "A valid Email address is required." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ ok: false, error: "Password must be at least 6 characters long." });
    }
    if (!country || !country.trim()) {
      return res.status(400).json({ ok: false, error: "Country is required." });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ ok: false, error: "Location / City is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userName = name.trim();
    const userCountry = country.trim();
    const userLocation = location.trim();
    const userPhone = phone?.trim() || "";
    const userGender = gender?.trim() || "";
    const userArea = lastConnectedArea?.trim() || `${userLocation}, ${userCountry} (Active Session)`;

    // Check MongoDB if connected
    if (req.app.locals.dbConnected) {
      try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(409).json({ ok: false, error: "This email is already registered. Please log in instead." });
        }

        const newUser = await User.create({
          name: userName,
          email: normalizedEmail,
          password: password,
          country: userCountry,
          location: userLocation,
          phone: userPhone,
          gender: userGender,
          lastConnectedArea: userArea,
          authProvider: "local",
        });

        // Mirror in memory
        inMemoryUsers.set(normalizedEmail, {
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          country: newUser.country,
          location: newUser.location,
          phone: newUser.phone,
          gender: newUser.gender,
          lastConnectedArea: newUser.lastConnectedArea,
          authProvider: "local",
          createdAt: newUser.createdAt,
        });

        return res.status(201).json({
          ok: true,
          message: "Account created successfully.",
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            gender: newUser.gender,
            country: newUser.country,
            location: newUser.location,
            lastConnectedArea: newUser.lastConnectedArea,
            authProvider: newUser.authProvider,
            createdAt: newUser.createdAt,
          },
          token: `token_${newUser._id}_${Date.now()}`,
        });
      } catch (dbErr) {
        console.warn("MongoDB register error:", dbErr.message);
      }
    }

    // Check in-memory store
    if (inMemoryUsers.has(normalizedEmail)) {
      return res.status(409).json({ ok: false, error: "This email is already registered. Please log in instead." });
    }

    const memoryUser = {
      _id: `user_${Date.now()}`,
      name: userName,
      email: normalizedEmail,
      password: password,
      phone: userPhone,
      gender: userGender,
      country: userCountry,
      location: userLocation,
      lastConnectedArea: userArea,
      authProvider: "local",
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.set(normalizedEmail, memoryUser);

    return res.status(201).json({
      ok: true,
      message: "Account created successfully.",
      user: {
        id: memoryUser._id,
        name: memoryUser.name,
        email: memoryUser.email,
        phone: memoryUser.phone,
        gender: memoryUser.gender,
        country: memoryUser.country,
        location: memoryUser.location,
        lastConnectedArea: memoryUser.lastConnectedArea,
        authProvider: memoryUser.authProvider,
        createdAt: memoryUser.createdAt,
      },
      token: `token_${memoryUser._id}_${Date.now()}`,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ ok: false, error: "Server error during registration." });
  }
};

/**
 * Login existing user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({ ok: false, error: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ ok: false, error: "Password is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check MongoDB if connected
    if (req.app.locals.dbConnected) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user) {
          if (user.password !== password) {
            return res.status(401).json({ ok: false, error: "Invalid password. Please check your credentials." });
          }

          const currentArea = `${user.location || "Global"}, ${user.country || "Online"} (Active Session)`;
          await User.findByIdAndUpdate(user._id, { lastConnectedArea: currentArea });

          return res.json({
            ok: true,
            message: "Login successful.",
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone || "",
              gender: user.gender || "",
              country: user.country,
              location: user.location,
              lastConnectedArea: currentArea,
              authProvider: user.authProvider,
              createdAt: user.createdAt,
            },
            token: `token_${user._id}_${Date.now()}`,
          });
        }
      } catch (dbErr) {
        console.warn("MongoDB login error:", dbErr.message);
      }
    }

    // Check in-memory store
    const memUser = inMemoryUsers.get(normalizedEmail);
    if (!memUser) {
      // STRICT: User is not registered!
      return res.status(404).json({
        ok: false,
        error: "This email is not registered. Please sign up first.",
      });
    }

    if (memUser.password && memUser.password !== password) {
      return res.status(401).json({ ok: false, error: "Invalid password. Please check your credentials." });
    }

    const currentArea = `${memUser.location || "Global"}, ${memUser.country || "Online"} (Active Session)`;
    memUser.lastConnectedArea = currentArea;
    inMemoryUsers.set(normalizedEmail, memUser);

    return res.json({
      ok: true,
      message: "Login successful.",
      user: {
        id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone || "",
        gender: memUser.gender || "",
        country: memUser.country,
        location: memUser.location,
        lastConnectedArea: currentArea,
        authProvider: memUser.authProvider,
        createdAt: memUser.createdAt,
      },
      token: `token_${memUser._id}_${Date.now()}`,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ ok: false, error: "Server error during login." });
  }
};

/**
 * Google Sign In / Sign Up handler
 * Supports custom user-selected Google accounts
 */
exports.googleAuth = async (req, res) => {
  try {
    const { name, email, country, location, phone, gender, avatar } = req.body || {};

    if (!email || !email.trim() || !email.includes("@")) {
      return res.status(400).json({ ok: false, error: "A valid Google Email address is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userName = name?.trim() || normalizedEmail.split("@")[0] || "Google User";
    const userCountry = country?.trim() || "United States";
    const userLocation = location?.trim() || "Global";
    const userPhone = phone?.trim() || "";
    const userGender = gender?.trim() || "";
    const currentArea = `${userLocation}, ${userCountry} (Google Auth Session)`;

    // Check MongoDB
    if (req.app.locals.dbConnected) {
      try {
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          user = await User.create({
            name: userName,
            email: normalizedEmail,
            country: userCountry,
            location: userLocation,
            phone: userPhone,
            gender: userGender,
            lastConnectedArea: currentArea,
            authProvider: "google",
            avatar: avatar || "",
          });
        } else {
          user = await User.findByIdAndUpdate(
            user._id,
            { lastConnectedArea: currentArea },
            { new: true }
          );
        }

        // Mirror in memory
        inMemoryUsers.set(normalizedEmail, {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          country: user.country,
          location: user.location,
          phone: user.phone || "",
          gender: user.gender || "",
          lastConnectedArea: user.lastConnectedArea || currentArea,
          authProvider: "google",
          avatar: user.avatar,
          createdAt: user.createdAt,
        });

        return res.json({
          ok: true,
          message: "Google authentication successful.",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            gender: user.gender || "",
            country: user.country,
            location: user.location,
            lastConnectedArea: user.lastConnectedArea || currentArea,
            authProvider: "google",
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
          token: `google_token_${user._id}_${Date.now()}`,
        });
      } catch (dbErr) {
        console.warn("MongoDB Google Auth error:", dbErr.message);
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
        phone: userPhone,
        gender: userGender,
        lastConnectedArea: currentArea,
        authProvider: "google",
        avatar: avatar || "",
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers.set(normalizedEmail, memUser);
    } else {
      memUser.lastConnectedArea = currentArea;
      inMemoryUsers.set(normalizedEmail, memUser);
    }

    return res.json({
      ok: true,
      message: "Google authentication successful.",
      user: {
        id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone || "",
        gender: memUser.gender || "",
        country: memUser.country,
        location: memUser.location,
        lastConnectedArea: memUser.lastConnectedArea,
        authProvider: "google",
        avatar: memUser.avatar,
        createdAt: memUser.createdAt,
      },
      token: `google_token_${memUser._id}_${Date.now()}`,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ ok: false, error: "Server error during Google authentication." });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const { email } = req.query || {};
    if (!email) {
      return res.status(400).json({ ok: false, error: "User email parameter is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (req.app.locals.dbConnected) {
      try {
        const user = await User.findOne({ email: normalizedEmail }).select("-password");
        if (user) {
          return res.json({
            ok: true,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone || "",
              gender: user.gender || "",
              country: user.country,
              location: user.location,
              lastConnectedArea: user.lastConnectedArea || `${user.location}, ${user.country}`,
              authProvider: user.authProvider,
              avatar: user.avatar,
              createdAt: user.createdAt,
            },
          });
        }
      } catch (err) {
        console.warn("MongoDB getProfile error:", err.message);
      }
    }

    const memUser = inMemoryUsers.get(normalizedEmail);
    if (memUser) {
      const { password, ...safeUser } = memUser;
      return res.json({
        ok: true,
        user: {
          id: safeUser._id,
          name: safeUser.name,
          email: safeUser.email,
          phone: safeUser.phone || "",
          gender: safeUser.gender || "",
          country: safeUser.country,
          location: safeUser.location,
          lastConnectedArea: safeUser.lastConnectedArea || `${safeUser.location}, ${safeUser.country}`,
          authProvider: safeUser.authProvider,
          avatar: safeUser.avatar,
          createdAt: safeUser.createdAt,
        },
      });
    }

    return res.status(404).json({ ok: false, error: "User profile not found." });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Update user profile (name, email, phone, gender, country, location, lastConnectedArea)
 */
exports.updateProfile = async (req, res) => {
  try {
    const { currentEmail, email, name, phone, gender, country, location, lastConnectedArea } = req.body || {};
    const targetEmail = (currentEmail || email || "").trim().toLowerCase();

    if (!targetEmail) {
      return res.status(400).json({ ok: false, error: "Current user email is required to update profile." });
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (gender !== undefined) updateFields.gender = gender.trim();
    if (country) updateFields.country = country.trim();
    if (location) updateFields.location = location.trim();
    if (lastConnectedArea) updateFields.lastConnectedArea = lastConnectedArea.trim();

    // If changing email address, check if new email already exists
    const newEmail = email ? email.trim().toLowerCase() : targetEmail;
    if (newEmail !== targetEmail) {
      if (req.app.locals.dbConnected) {
        const emailTaken = await User.findOne({ email: newEmail });
        if (emailTaken) {
          return res.status(409).json({ ok: false, error: "The new email address is already in use by another account." });
        }
      }
      if (inMemoryUsers.has(newEmail)) {
        return res.status(409).json({ ok: false, error: "The new email address is already in use by another account." });
      }
      updateFields.email = newEmail;
    }

    if (req.app.locals.dbConnected) {
      try {
        const updated = await User.findOneAndUpdate(
          { email: targetEmail },
          updateFields,
          { new: true }
        ).select("-password");

        if (updated) {
          const userObj = {
            id: updated._id,
            name: updated.name,
            email: updated.email,
            phone: updated.phone || "",
            gender: updated.gender || "",
            country: updated.country,
            location: updated.location,
            lastConnectedArea: updated.lastConnectedArea || `${updated.location}, ${updated.country}`,
            authProvider: updated.authProvider,
            avatar: updated.avatar,
            createdAt: updated.createdAt,
          };

          // Update memory cache
          if (newEmail !== targetEmail) {
            inMemoryUsers.delete(targetEmail);
          }
          inMemoryUsers.set(newEmail, { ...inMemoryUsers.get(targetEmail), ...userObj });

          return res.json({ ok: true, message: "Profile updated successfully.", user: userObj });
        }
      } catch (err) {
        console.warn("MongoDB updateProfile error:", err.message);
      }
    }

    const memUser = inMemoryUsers.get(targetEmail);
    if (memUser) {
      if (name) memUser.name = name.trim();
      if (phone !== undefined) memUser.phone = phone.trim();
      if (gender !== undefined) memUser.gender = gender.trim();
      if (country) memUser.country = country.trim();
      if (location) memUser.location = location.trim();
      if (lastConnectedArea) memUser.lastConnectedArea = lastConnectedArea.trim();
      if (newEmail !== targetEmail) {
        memUser.email = newEmail;
        inMemoryUsers.delete(targetEmail);
      }
      inMemoryUsers.set(newEmail, memUser);

      const userObj = {
        id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone || "",
        gender: memUser.gender || "",
        country: memUser.country,
        location: memUser.location,
        lastConnectedArea: memUser.lastConnectedArea || `${memUser.location}, ${memUser.country}`,
        authProvider: memUser.authProvider,
        avatar: memUser.avatar,
        createdAt: memUser.createdAt,
      };

      return res.json({ ok: true, message: "Profile updated successfully.", user: userObj });
    }

    return res.status(404).json({ ok: false, error: "User profile not found." });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

exports.getMe = async (req, res) => {
  return res.json({ ok: true, message: "Authenticated session." });
};
