import LiveWorkflowStatus from "../components/execution/LiveWorkflowStatus";
import RunButton from "../components/execution/RunButton";
import RunLogs from "../components/execution/RunLogs";
import TriggerPanel from "../components/execution/TriggerPanel";

function Execution({
  workflow,
  executionState = [],
  executionHistory = [],
  isExecuting = false,
  onRun,
  onTriggerChange,
}) {
  if (!workflow) {
    return (
      <main className="execution-page">
        <div className="execution-empty">
          <h2>Workflow Execution</h2>

          <p>
            Generate or select a workflow before running it.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="execution-page">
      <div className="execution-page-header">
        <div>
          <span className="execution-label">
            EXECUTION CENTER
          </span>

          <h1>
            {workflow.name || "Workflow Execution"}
          </h1>

          <p>
            Run the workflow and monitor every step in real time.
          </p>
        </div>

        <RunButton
          onRun={onRun}
          isExecuting={isExecuting}
        />
      </div>

      <div className="execution-layout">
        <div className="execution-main">
          <LiveWorkflowStatus
            workflow={workflow}
            executionState={executionState}
          />

          <RunLogs
            executionHistory={executionHistory}
          />
        </div>

        <aside className="execution-sidebar">
          <TriggerPanel
            workflow={workflow}
            onTriggerChange={onTriggerChange}
          />
        </aside>
      </div>
    </main>
  );
}

export default Execution;
