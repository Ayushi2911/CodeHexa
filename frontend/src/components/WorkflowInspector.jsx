import { useEffect, useState } from "react";

function ArrowRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

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
        name: selectedStep.name || "",
        target: selectedStep.target || selectedStep.schema || selectedStep.functionName || "",
        onSuccess: selectedStep.onSuccess || "",
        onFailure: selectedStep.onFailure || ""
      });
    }
  }, [selectedStep]);

  if (!selectedStep) {
    return (
      <aside className="workflow-inspector empty-inspector">
        <div className="empty-inspector-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
            <path d="M8 17h3" />
          </svg>
        </div>

        <p className="inspector-label">STEP INSPECTOR</p>

        <h3>Select a workflow step</h3>

        <p>
          Choose any step from the workflow to inspect its configuration,
          mappings, and execution paths.
        </p>

        <div className="inspector-hint">
          <span className="hint-dot" />
          Click a step to begin
        </div>
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
      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title-row">
          <div>
            <p className="inspector-label">STEP INSPECTOR</p>
            <h3>{selectedStep.name}</h3>
          </div>
        </div>

        <div className="inspector-meta">
          <span className="meta-pill">
            {selectedStep.type || selectedStep.actionType || "STEP"}
          </span>
        </div>
      </div>

      {/* Configuration */}
      <div className="inspector-section">
        <div className="section-heading">
          <span className="section-line" />
          <span>CONFIGURATION</span>
        </div>

        <div className="inspector-field">
          <label htmlFor="step-name">Step Name</label>

          <input
            id="step-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter step name"
          />
        </div>

        <div className="inspector-field">
          <label htmlFor="step-target">Target</label>

          <input
            id="step-target"
            name="target"
            value={formData.target}
            onChange={handleChange}
            placeholder="Target service or resource"
          />
        </div>
      </div>

      {/* Input Mapping */}
      <div className="inspector-section">
        <div className="section-heading">
          <span className="section-line" />
          <span>INPUT MAPPING</span>
        </div>

        {Object.entries(selectedStep.inputMapping || {}).length > 0 ? (
          <div className="mapping-list">
            {Object.entries(selectedStep.inputMapping || {}).map(
              ([key, value]) => (
                <div className="mapping-item" key={key}>
                  <div className="mapping-source">
                    <span>{key}</span>
                  </div>

                  <div className="mapping-arrow">
                    <ArrowRightIcon />
                  </div>

                  <code>{typeof value === "object" ? JSON.stringify(value) : String(value)}</code>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="mapping-empty">
            No input mappings configured for this step.
          </div>
        )}
      </div>

      {/* Execution Paths */}
      <div className="inspector-section">
        <div className="section-heading">
          <span className="section-line" />
          <span>EXECUTION PATHS</span>
        </div>

        <div className="execution-path-card success-path">
          <div className="path-icon">
            <CheckIcon />
          </div>

          <div className="path-content">
            <label htmlFor="on-success">On Success</label>

            <input
              id="on-success"
              name="onSuccess"
              value={formData.onSuccess}
              onChange={handleChange}
              placeholder="Next step"
            />
          </div>
        </div>

        <div className="execution-path-card failure-path">
          <div className="path-icon">
            <AlertIcon />
          </div>

          <div className="path-content">
            <label htmlFor="on-failure">On Failure</label>

            <input
              id="on-failure"
              name="onFailure"
              value={formData.onFailure}
              onChange={handleChange}
              placeholder="Failure handler"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <button className="save-step-btn" onClick={handleSave}>
        <span>Save Changes</span>

        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
          <path d="M17 21v-8H7v8" />
          <path d="M7 3v5h8" />
        </svg>
      </button>
    </aside>
  );
}

export default WorkflowInspector;
