require("dotenv").config();

const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn(
      "MONGO_URI or MONGODB_URI is not set. Running in demo mode without MongoDB."
    );
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("🚀 MongoDB connection successful!");

    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.warn("Running in demo mode without MongoDB.");

    return false;
  }
}

module.exports = connectDatabase;