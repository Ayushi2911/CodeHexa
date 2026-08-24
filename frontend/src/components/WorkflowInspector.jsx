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
    name: selectedStep?.name || "",
    target: selectedStep?.target || selectedStep?.schema || selectedStep?.functionName || "",
    onSuccess: selectedStep?.onSuccess || "",
    onFailure: selectedStep?.onFailure || ""
  });

  const [isSaved, setIsSaved] = useState(false);

  // Synchronize immediately on step change
  useEffect(() => {
    if (selectedStep) {
      setFormData({
        name: selectedStep.name || "",
        target: selectedStep.target || selectedStep.schema || selectedStep.functionName || "",
        onSuccess: selectedStep.onSuccess || "",
        onFailure: selectedStep.onFailure || ""
      });
      setIsSaved(false);
    }
  }, [selectedStep?.id, selectedStep?.stepId]);

  if (!selectedStep) {
    return (
      <aside className="workflow-inspector empty-inspector">
        <div className="empty-inspector-icon">
          <svg
            width="28"
            height="28"
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
          Click any step in the flowchart to inspect its configuration,
          dynamic input mappings, and execution routes.
        </p>

        <div className="inspector-hint">
          <span className="hint-dot" />
          Click a node to begin
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
    setIsSaved(false);
  };

  const handleSave = () => {
    onUpdateStep({
      ...selectedStep,
      ...formData
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <aside className="workflow-inspector active-inspector-panel">
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
            {(selectedStep.type || selectedStep.actionType || "STEP").toUpperCase()}
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
          <label htmlFor="step-target">Target Capability</label>
          <input
            id="step-target"
            name="target"
            value={formData.target}
            onChange={handleChange}
            placeholder="Target service or schema"
          />
        </div>
      </div>

      {/* Dynamic Input Mapping */}
      <div className="inspector-section">
        <div className="section-heading">
          <span className="section-line" />
          <span>DYNAMIC INPUT MAPPING (CONTEXT PASSING)</span>
        </div>

        {Object.entries(selectedStep.inputMapping || {}).length > 0 ? (
          <div className="mapping-list">
            {Object.entries(selectedStep.inputMapping || {}).map(([key, value]) => {
              const strVal = typeof value === "object" ? JSON.stringify(value) : String(value);
              const isPreviousStepOutput = strVal.includes("step-");

              return (
                <div
                  key={key}
                  className={isPreviousStepOutput ? "mapping-item mapping-highlighted" : "mapping-item"}
                >
                  <div className="mapping-source">
                    <span>{key}:</span>
                  </div>

                  <div className="mapping-arrow">
                    <ArrowRightIcon />
                  </div>

                  <div className="mapping-target-val">
                    <code>{strVal}</code>
                    {isPreviousStepOutput && (
                      <span className="reuse-badge">Output from previous step</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mapping-empty">
            No input mappings configured for this step.
          </div>
        )}
      </div>

      {/* Condition Evaluation (if any) */}
      {selectedStep.condition && (
        <div className="inspector-section">
          <div className="section-heading">
            <span className="section-line" />
            <span>RUNTIME CONDITION RULE</span>
          </div>

          <div className="inspector-condition-card">
            <label>Evaluated at execution:</label>
            <code>
              {typeof selectedStep.condition === "object"
                ? `${selectedStep.condition.field || "field"} == "${selectedStep.condition.value || "physical"}"`
                : selectedStep.condition}
            </code>
            <small>If true, step executes; if false, step is skipped.</small>
          </div>
        </div>
      )}

      {/* Execution Routing Paths */}
      <div className="inspector-section">
        <div className="section-heading">
          <span className="section-line" />
          <span>EXECUTION ROUTING PATHS</span>
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
              placeholder="e.g. step-003 or next"
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
              placeholder="e.g. stop or skip"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        className={isSaved ? "save-step-btn saved-success-btn" : "save-step-btn"}
        onClick={handleSave}
        type="button"
      >
        <span>{isSaved ? "✓ Changes Saved!" : "Save Changes"}</span>
        {!isSaved && (
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
        )}
      </button>
    </aside>
  );
}

export default WorkflowInspector;
