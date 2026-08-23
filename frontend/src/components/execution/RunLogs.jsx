function RunLogs({ executionHistory = [] }) {
  if (!executionHistory.length) {
    return (
      <div className="run-logs">
        <div className="run-logs-header">
          <h3>Execution Logs</h3>
          <span>0 runs</span>
        </div>

        <p className="run-logs-empty">
          No workflow executions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="run-logs">
      <div className="run-logs-header">
        <div>
          <h3>Execution Logs</h3>
          <p>Recent workflow execution activity.</p>
        </div>

        <span>
          {executionHistory.length}{" "}
          {executionHistory.length === 1 ? "run" : "runs"}
        </span>
      </div>

      <div className="run-logs-list">
        {executionHistory.map((execution, index) => (
          <div
            className="run-log-card"
            key={execution.id}
          >
            <div className="run-log-top">
              <div>
                <strong>
                  Run #{executionHistory.length - index}
                </strong>

                <p>
                  {execution.workflowName ||
                    "Unnamed Workflow"}
                </p>
              </div>

              <span
                className={`run-log-status run-log-${execution.status}`}
              >
                {execution.status?.toUpperCase() ||
                  "UNKNOWN"}
              </span>
            </div>

            <div className="run-log-time">
              <span>
                Started: {execution.startedAt || "—"}
              </span>

              <span>
                Completed:{" "}
                {execution.completedAt || "—"}
              </span>
            </div>

            {execution.steps?.length > 0 && (
              <div className="run-log-steps">
                {execution.steps.map((step) => (
                  <div
                    className="run-log-step"
                    key={step.stepId}
                  >
                    <span>
                      {step.status === "success"
                        ? "✓"
                        : step.status === "failed"
                        ? "✕"
                        : step.status === "running"
                        ? "●"
                        : "○"}
                    </span>

                    <span>
                      {step.stepName}
                    </span>

                    <small>
                      {step.status?.toUpperCase()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RunLogs;