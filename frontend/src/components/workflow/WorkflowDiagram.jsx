import { useState } from "react";

function WorkflowDiagram({
  workflow,
  executionState = [],
  selectedStepId,
  onSelectStep,
  onReorderSteps,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  if (!workflow) {
    return (
      <div className="workflow-diagram empty-diagram">
        <p>No workflow generated yet.</p>
      </div>
    );
  }

  const steps = workflow.steps || [];

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const fromIndexStr = e.dataTransfer.getData("text/plain");
    const fromIndex = Number(fromIndexStr);
    if (!isNaN(fromIndex) && fromIndex !== targetIndex && onReorderSteps) {
      onReorderSteps(fromIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="workflow-diagram">
      {/* START / TRIGGER NODE */}
      <div className="workflow-node workflow-start">
        <div className="workflow-node-icon">⚡</div>

        <div className="workflow-node-content">
          <span className="workflow-node-label">
            TRIGGER
          </span>

          <strong>
            {workflow.trigger?.name || "Order Placed"}
          </strong>
          <small className="node-subtext">{workflow.trigger?.source || "orders"}</small>
        </div>
      </div>

      {/* CONNECTOR TO FIRST STEP */}
      {steps.length > 0 && (
        <div className="workflow-connector connector-active">
          <span />
        </div>
      )}

      {/* WORKFLOW STEPS */}
      {steps.map((step, index) => {
        const stepKey = step.id || step.stepId;
        const isSelected = selectedStepId === stepKey;

        const exec = executionState?.find((e) => e.stepId === stepKey);
        const status = exec?.status || step.status || "pending";

        const typeLabel = (step.type || step.actionType || "ACTION").toUpperCase();
        const isNextActive = index < steps.length - 1 && (status === "success" || status === "running");

        return (
          <div
            className={`workflow-node-wrapper ${dragOverIndex === index ? "drag-target-active" : ""} ${draggedIndex === index ? "is-being-dragged" : ""}`}
            key={stepKey || index}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            <button
              type="button"
              className={`workflow-node workflow-step-node ${
                isSelected ? "selected" : ""
              } status-${status}`}
              onClick={() => onSelectStep(stepKey)}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              title="Click to inspect • Drag to reorder step"
            >
              <div className="node-left-controls">
                <span className="drag-grip-handle" title="Drag to reorder step">
                  ⋮⋮
                </span>
                <div className="workflow-node-number">
                  {index + 1}
                </div>
              </div>

              <div className="workflow-node-content">
                <span className="workflow-node-label">
                  {typeLabel}
                </span>

                <strong>
                  {step.name || "Unnamed Step"}
                </strong>

                {step.target && (
                  <span className="workflow-node-target">
                    {step.target}
                  </span>
                )}

                {step.condition && (
                  <span className="workflow-node-condition">
                    Condition: {typeof step.condition === "object" ? `${step.condition.field || "field"} == ${step.condition.value || "val"}` : step.condition}
                  </span>
                )}
              </div>

              <div className="workflow-node-status">
                {status === "running" && <span className="status-spinner-small" />}
                {status === "success" && "✓"}
                {status === "failed" && "✕"}
                {status === "pending" && "○"}
                {status === "retrying" && "↺"}
              </div>
            </button>

            {index < steps.length - 1 && (
              <div className={`workflow-connector ${isNextActive ? "connector-active" : ""}`}>
                <span />
              </div>
            )}
          </div>
        );
      })}

      {/* CONNECTOR TO END */}
      {steps.length > 0 && (
        <div className={`workflow-connector ${steps.length > 0 && executionState?.every((s) => s.status === "success") ? "connector-active" : ""}`}>
          <span />
        </div>
      )}

      {/* END / COMPLETE NODE */}
      <div className="workflow-node workflow-end">
        <div className="workflow-node-icon">✓</div>

        <div className="workflow-node-content">
          <span className="workflow-node-label">
            COMPLETE
          </span>

          <strong>Workflow Finished</strong>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDiagram;
