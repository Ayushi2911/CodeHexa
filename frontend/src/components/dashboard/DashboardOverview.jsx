function DashboardOverview({
  workflows = [],
  executionHistory = [],
}) {
  const totalWorkflows = workflows.length;

  const totalRuns = executionHistory.length;

  const successfulRuns = executionHistory.filter(
    (execution) => execution.status === "completed"
  ).length;

  const failedRuns = executionHistory.filter(
    (execution) => execution.status === "failed"
  ).length;

  const successRate =
    totalRuns > 0
      ? Math.round(
          (successfulRuns / totalRuns) * 100
        )
      : 0;

  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-label">
            WORKFLOW PLATFORM
          </span>

          <h2>Dashboard Overview</h2>

          <p>
            Monitor workflows, executions, and automation
            performance.
          </p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span>Workflows</span>
          <strong>{totalWorkflows}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Total Runs</span>
          <strong>{totalRuns}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Successful Runs</span>
          <strong>{successfulRuns}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Success Rate</span>
          <strong>{successRate}%</strong>
        </div>
      </div>

      {failedRuns > 0 && (
        <div className="dashboard-warning">
          <strong>
            ⚠ {failedRuns} failed run
            {failedRuns === 1 ? "" : "s"}
          </strong>

          <span>
            Review the execution logs for details.
          </span>
        </div>
      )}
    </div>
  );
}

export default DashboardOverview;
