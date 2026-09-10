const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema(
  {
    workflowAlerts: {
      type: Boolean,
      default: true,
    },
    executionAlerts: {
      type: Boolean,
      default: true,
    },
    systemAlerts: {
      type: Boolean,
      default: true,
    },
    digestFrequency: {
      type: String,
      enum: ["realtime", "daily", "weekly"],
      default: "realtime",
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    country: {
      type: String,
      default: "United States",
      trim: true,
    },
    location: {
      type: String,
      default: "Global",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-binary", "Prefer not to say", ""],
      default: "",
    },
    role: {
      type: String,
      default: "Pro Developer",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    themePreference: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "dark",
    },
    notificationPreferences: {
      type: notificationPreferenceSchema,
      default: () => ({
        workflowAlerts: true,
        executionAlerts: true,
        systemAlerts: true,
        digestFrequency: "realtime",
        emailNotifications: true,
      }),
    },
    storageUsedBytes: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastConnectedArea: {
      type: String,
      default: "Local Session / Global",
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    avatar: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
