const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const workflowRoutes = require("./routes/workflowRoutes");

app.use("/api/workflows", workflowRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CodeHexa Backend is running 🚀",
    project: "PS11 - Business Workflow Detection & Diagram Generation",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "CodeHexa API",
    status: "healthy",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CodeHexa backend running on http://localhost:${PORT}`);
});
