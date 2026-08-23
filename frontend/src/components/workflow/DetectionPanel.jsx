function DetectionPanel({ workflow }) {
  if (!workflow) {
    return (
      <div className="detection-panel">
        <h3>Workflow Detection</h3>
        <p>No workflow available yet.</p>
      </div>
    );
  }

  const totalSteps = workflow.steps?.length || 0;

  return (
    <div className="detection-panel">
      <h3>🔍 Workflow Detection</h3>

      <div className="detection-item">
        <span>Workflow Name</span>
        <strong>{workflow.name || "Untitled Workflow"}</strong>
      </div>

      <div className="detection-item">
        <span>Total Steps</span>
        <strong>{totalSteps}</strong>
      </div>

      <div className="detection-item">
        <span>Status</span>
        <strong>Ready</strong>
      </div>

      <div className="detection-result">
        ✓ Workflow structure detected successfully
      </div>
    </div>
  );
}

export default DetectionPanel;