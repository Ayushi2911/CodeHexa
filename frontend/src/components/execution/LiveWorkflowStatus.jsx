function LiveWorkflowStatus({ workflow, executionState = [] }) {
  if (!workflow) {
    return (
      <div className="live-workflow-status">
        <h3>Live Workflow Status</h3>
        <p>No workflow is currently loaded.</p>
      </div>
    );
  }

  const getStatus = (stepId) => {
    return (
      executionState.find(
        (item) => item.stepId === stepId
      )?.status || "pending"
    );
  };

  return (
    <div className="live-workflow-status">
      <div className="live-status-header">
        <div>
          <h3>Live Workflow Status</h3>
          <p>Monitor each step during execution.</p>
        </div>

        <span className="live-status-count">
          {workflow.steps?.length || 0} steps
        </span>
      </div>

      <div className="live-status-list">
        {workflow.steps?.map((step, index) => {
          const status = getStatus(step.id);

          return (
            <div
              className={`live-status-step status-${status}`}
              key={step.id}
            >
              <div className="live-step-number">
                {index + 1}
              </div>

              <div className="live-step-info">
                <strong>{step.name}</strong>
                <span>{step.type}</span>
              </div>

              <div className="live-step-status">
                {status.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LiveWorkflowStatus;