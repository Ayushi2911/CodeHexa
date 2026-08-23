function RequirementPanel({
  requirement,
  onRequirementChange,
  onGenerateWorkflow,
  isGenerating = false,
}) {
  return (
    <div className="requirement-panel">
      <div className="requirement-panel-header">
        <h3>📝 Workflow Requirement</h3>
        <p>Describe what you want your workflow to do.</p>
      </div>

      <textarea
        value={requirement || ""}
        onChange={(event) => onRequirementChange(event.target.value)}
        placeholder="Example: When a new customer signs up, validate their details, create an account, and send a welcome email."
        rows="6"
      />

      <button
        className="generate-workflow-button"
        onClick={onGenerateWorkflow}
        disabled={!requirement?.trim() || isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Workflow"}
      </button>
    </div>
  );
}

export default RequirementPanel;