import { useEffect, useState } from "react";

function WorkflowInspector({ selectedStep, onUpdateStep }) {
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    onSuccess: "",
    onFailure: ""
  });

  useEffect(() => {
    if (selectedStep) {
      setFormData({
        name: selectedStep.name,
        target: selectedStep.target,
        onSuccess: selectedStep.onSuccess,
        onFailure: selectedStep.onFailure
      });
    }
  }, [selectedStep]);

  if (!selectedStep) {
    return (
      <aside className="workflow-inspector empty-inspector">
        <h3>Step Inspector</h3>
        <p>Click a workflow step to view and edit its details.</p>
      </aside>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));
  };

  const handleSave = () => {
    onUpdateStep({
      ...selectedStep,
      ...formData
    });
  };

  return (
    <aside className="workflow-inspector">
      <div className="inspector-header">
        <p className="inspector-label">STEP INSPECTOR</p>
        <h3>{selectedStep.name}</h3>
      </div>

      <div className="inspector-section">
        <label>Type</label>
        <p>{selectedStep.type}</p>
      </div>

      <div className="inspector-section">
        <label>Action Type</label>
        <p>{selectedStep.actionType}</p>
      </div>

      <div className="inspector-section">
        <label htmlFor="step-name">Step Name</label>

        <input
          id="step-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="inspector-section">
        <label htmlFor="step-target">Target</label>

        <input
          id="step-target"
          name="target"
          value={formData.target}
          onChange={handleChange}
        />
      </div>

      <div className="inspector-section">
        <label>Input Mapping</label>

        <div className="mapping-list">
          {Object.entries(selectedStep.inputMapping || {}).map(
            ([key, value]) => (
              <div className="mapping-item" key={key}>
                <span>{key}</span>
                <span className="mapping-arrow">→</span>
                <code>{value}</code>
              </div>
            )
          )}
        </div>
      </div>

      <div className="execution-paths">
        <div className="path">
          <label htmlFor="on-success">On Success</label>

          <input
            id="on-success"
            name="onSuccess"
            value={formData.onSuccess}
            onChange={handleChange}
          />
        </div>

        <div className="path">
          <label htmlFor="on-failure">On Failure</label>

          <input
            id="on-failure"
            name="onFailure"
            value={formData.onFailure}
            onChange={handleChange}
          />
        </div>
      </div>

      <button className="save-step-btn" onClick={handleSave}>
        Save Changes
      </button>
    </aside>
  );
}

export default WorkflowInspector;