const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn(
      "MONGODB_URI is not set. Running in demo mode without MongoDB."
    );
    return false;
  }

  try {
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");

    return true;
  } catch (error) {
    console.warn(
      "MongoDB connection failed. Running in demo mode.",
      error.message
    );

    return false;
  }
}

module.exports = connectDatabase;