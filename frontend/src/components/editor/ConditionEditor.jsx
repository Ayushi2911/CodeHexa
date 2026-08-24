function ConditionEditor({ step, onUpdateStep }) {
  if (!step) {
    return (
      <div className="condition-editor">
        <h3>Condition Editor</h3>
        <p>Select a workflow step first.</p>
      </div>
    );
  }

  const condition = step.condition || "";

  const handleChange = (value) => {
    onUpdateStep({
      ...step,
      condition: value,
    });
  };

  return (
    <div className="condition-editor">
      <div className="condition-editor-header">
        <h3>Condition Editor</h3>
        <p>Add a condition for this workflow step.</p>
      </div>

      <label htmlFor="step-condition">
        Condition
      </label>

      <input
        id="step-condition"
        type="text"
        value={condition}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Example: order.total > 1000"
      />

      {condition && (
        <div className="condition-preview">
          <span>Current condition:</span>
          <code>{condition}</code>
        </div>
      )}
    </div>
  );
}

export default ConditionEditor;
