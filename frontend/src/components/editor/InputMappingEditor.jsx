function InputMappingEditor({ step, onUpdateStep }) {
  if (!step) {
    return (
      <div className="input-mapping-editor">
        <h3>Input Mapping</h3>
        <p>Select a workflow step first.</p>
      </div>
    );
  }

  const inputMapping = step.inputMapping || {};

  const handleFieldChange = (field, value) => {
    onUpdateStep({
      ...step,
      inputMapping: {
        ...inputMapping,
        [field]: value,
      },
    });
  };

  return (
    <div className="input-mapping-editor">
      <div className="input-mapping-header">
        <h3>Input Mapping</h3>
        <p>Configure the input values for this workflow step.</p>
      </div>

      <label>
        Input Source
        <input
          type="text"
          value={inputMapping.source || ""}
          onChange={(event) =>
            handleFieldChange("source", event.target.value)
          }
          placeholder="Example: order.customer.email"
        />
      </label>

      <label>
        Output Variable
        <input
          type="text"
          value={inputMapping.output || ""}
          onChange={(event) =>
            handleFieldChange("output", event.target.value)
          }
          placeholder="Example: customerEmail"
        />
      </label>

      {Object.keys(inputMapping).length > 0 && (
        <div className="mapping-preview">
          <span>Current Mapping</span>

          <code>
            {JSON.stringify(inputMapping, null, 2)}
          </code>
        </div>
      )}
    </div>
  );
}

export default InputMappingEditor;