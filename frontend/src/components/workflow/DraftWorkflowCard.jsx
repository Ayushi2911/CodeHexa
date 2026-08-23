function DraftWorkflowCard({ workflow, onUseWorkflow }) {
  if (!workflow) {
    return (
      <div className="draft-workflow-card">
        <h3>Draft Workflow</h3>
        <p>No workflow has been generated yet.</p>
      </div>
    );
  }

  const steps = workflow.steps || [];

  return (
    <div className="draft-workflow-card">
      <div className="draft-card-header">
        <div>
          <h3>📋 Draft Workflow</h3>
          <p>{workflow.name || "Untitled Workflow"}</p>
        </div>

        {onUseWorkflow && (
          <button
            className="use-workflow-button"
            onClick={() => onUseWorkflow(workflow)}
          >
            Use Workflow
          </button>
        )}
      </div>

      <div className="draft-workflow-info">
        <div>
          <span>Steps</span>
          <strong>{steps.length}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>Draft</strong>
        </div>
      </div>

      <div className="draft-steps">
        {steps.map((step, index) => (
          <div className="draft-step" key={step.id || index}>
            <span className="draft-step-number">{index + 1}</span>

            <div>
              <strong>{step.name || step.type || `Step ${index + 1}`}</strong>

              {step.description && (
                <p>{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DraftWorkflowCard;