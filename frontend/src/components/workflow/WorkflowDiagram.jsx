function WorkflowDiagram({
  workflow,
  selectedStepId,
  onSelectStep,
}) {
  if (!workflow) {
    return (
      <div className="workflow-diagram empty-diagram">
        <p>No workflow generated yet.</p>
      </div>
    );
  }

  return (
    <div className="workflow-diagram">
      {/* START */}
      <div className="workflow-node workflow-start">
        <div className="workflow-node-icon">▶</div>

        <div className="workflow-node-content">
          <span className="workflow-node-label">
            TRIGGER
          </span>

          <strong>
            {workflow.trigger?.name || "Workflow Trigger"}
          </strong>
        </div>
      </div>

      {/* CONNECTION */}
      {workflow.steps.length > 0 && (
        <div className="workflow-connector">
          <span />
        </div>
      )}

      {/* STEPS */}
      {workflow.steps.map((step, index) => {
        const isSelected =
          selectedStepId === step.id;

        const status = step.status || "pending";

        return (
          <div
            className="workflow-node-wrapper"
            key={step.id}
          >
            <button
              type="button"
              className={`workflow-node workflow-step-node ${
                isSelected ? "selected" : ""
              } status-${status}`}
              onClick={() => onSelectStep(step.id)}
            >
              <div className="workflow-node-number">
                {index + 1}
              </div>

              <div className="workflow-node-content">
                <span className="workflow-node-label">
                  {step.type || "STEP"}
                </span>

                <strong>
                  {step.name || "Unnamed Step"}
                </strong>

                {step.description && (
                  <span className="workflow-node-description">
                    {step.description}
                  </span>
                )}
              </div>

              <div className="workflow-node-status">
                {status === "running" && "⏳"}
                {status === "success" && "✓"}
                {status === "failed" && "✕"}
                {status === "pending" && "○"}
              </div>
            </button>

            {index <
              workflow.steps.length - 1 && (
              <div className="workflow-connector">
                <span />
              </div>
            )}
          </div>
        );
      })}

      {/* END */}
      {workflow.steps.length > 0 && (
        <div className="workflow-connector">
          <span />
        </div>
      )}

      <div className="workflow-node workflow-end">
        <div className="workflow-node-icon">✓</div>

        <div className="workflow-node-content">
          <span className="workflow-node-label">
            COMPLETE
          </span>

          <strong>Workflow Finished</strong>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDiagram;
