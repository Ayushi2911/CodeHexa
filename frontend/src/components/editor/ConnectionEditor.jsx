function ConnectionEditor({ workflow, step, onUpdateStep }) {
  if (!workflow || !step) {
    return (
      <div className="connection-editor">
        <h3>Connection Editor</h3>
        <p>Select a workflow step first.</p>
      </div>
    );
  }

  const otherSteps = workflow.steps.filter(
    (item) => item.id !== step.id
  );

  const nextStepId = step.nextStepId || "";

  const handleChange = (value) => {
    onUpdateStep({
      ...step,
      nextStepId: value,
    });
  };

  return (
    <div className="connection-editor">
      <div className="connection-editor-header">
        <h3>Connection Editor</h3>
        <p>Choose which step should run after this step.</p>
      </div>

      <label htmlFor="next-step">
        Next Step
      </label>

      <select
        id="next-step"
        value={nextStepId}
        onChange={(event) =>
          handleChange(event.target.value)
        }
      >
        <option value="">
          No next step
        </option>

        {otherSteps.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ConnectionEditor;