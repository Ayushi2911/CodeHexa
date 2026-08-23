const express =
  require("express");

const cors =
  require("cors");

const dotenv =
  require("dotenv");

const connectDatabase =
  require(
    "./config/database"
  );

dotenv.config();

const app =
  express();

const PORT =
  process.env.PORT ||
  4000;

app.use(cors());

app.use(
  express.json({
    limit: "1mb",
  })
);

const workflowRoutes =
  require(
    "./routes/workflowRoutes"
  );

const formsRoutes =
  require(
    "./routes/formsRoutes"
  );

app.use(
  "/api/workflows",
  workflowRoutes
);

app.use(
  "/workflow",
  workflowRoutes
);

app.use(
  "/forms",
  formsRoutes
);

app.get(
  "/",
  (req, res) =>
    res.json({
      ok: true,

      message:
        "CodeHexa PS11 backend is running",

      project:
        "PS11 - Business Workflow Detection & Diagram Generation",
    })
);

app.get(
  "/api/health",

  (req, res) =>
    res.json({
      ok: true,

      status:
        "healthy",

      database:
        app.locals
          .dbConnected
          ? "connected"
          : "not connected",
    })
);

app.use(
  (req, res) =>
    res
      .status(404)
      .json({
        ok: false,

        error: {
          code:
            "NOT_FOUND",

          message:
            "API endpoint not found",

          path:
            req.originalUrl,
        },
      })
);

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(err);

    res
      .status(500)
      .json({
        ok: false,

        error: {
          code:
            "INTERNAL_ERROR",

          message:
            err.message,
        },
      });
  }
);

async function startServer() {
  const dbConnected =
    await connectDatabase();

  app.locals.dbConnected =
    dbConnected;

  app.listen(
    PORT,
    () => {
      console.log(
        `PS11 backend running at http://localhost:${PORT} | MongoDB: ${
          dbConnected
            ? "connected"
            : "not connected"
        }`
      );
    }
  );
}

if (
  require.main ===
  module
) {
  startServer()
    .catch(
      (error) => {
        console.error(
          error
        );

        process.exit(1);
      }
    );
}

module.exports = app;