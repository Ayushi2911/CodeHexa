function StepInspector({ selectedStep, onUpdateStep }) {
  if (!selectedStep) {
    return (
      <div className="step-inspector">
        <h3>Step Inspector</h3>
        <p>Select a workflow step to view and edit its details.</p>
      </div>
    );
  }

  const handleChange = (field, value) => {
    onUpdateStep({
      ...selectedStep,
      [field]: value,
    });
  };

  return (
    <div className="step-inspector">
      <div className="step-inspector-header">
        <div>
          <h3>Step Inspector</h3>
          <p>Edit the selected workflow step.</p>
        </div>

        <span className="step-type-badge">
          {selectedStep.type || "STEP"}
        </span>
      </div>

      <label>
        Step Name
        <input
          type="text"
          value={selectedStep.name || ""}
          onChange={(event) =>
            handleChange("name", event.target.value)
          }
        />
      </label>

      <label>
        Description
        <textarea
          value={selectedStep.description || ""}
          onChange={(event) =>
            handleChange("description", event.target.value)
          }
          rows="4"
        />
      </label>
    </div>
  );
}

export default StepInspector;
