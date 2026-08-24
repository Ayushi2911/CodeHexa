import StepInspector from "../components/editor/StepInspector";
import ConditionEditor from "../components/editor/ConditionEditor";
import ConnectionEditor from "../components/editor/ConnectionEditor";
import InputMappingEditor from "../components/editor/InputMappingEditor";

function WorkflowEditor({
  workflow,
  selectedStep,
  onUpdateStep,
}) {
  if (!workflow) {
    return (
      <main className="workflow-editor-page">
        <div className="workflow-editor-empty">
          <h2>Workflow Editor</h2>
          <p>
            Generate or select a workflow to start editing.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="workflow-editor-page">
      <div className="workflow-editor-header">
        <div>
          <span className="editor-label">
            WORKFLOW EDITOR
          </span>

          <h1>
            {workflow.name || "Untitled Workflow"}
          </h1>

          <p>
            Configure the selected workflow step.
          </p>
        </div>

        <span className="editor-step-count">
          {workflow.steps?.length || 0} steps
        </span>
      </div>

      <div className="workflow-editor-layout">
        <div className="workflow-editor-step-list">
          <h3>Workflow Steps</h3>

          {workflow.steps?.map((step, index) => (
            <button
              key={step.id}
              className={`editor-step-item ${
                selectedStep?.id === step.id
                  ? "selected"
                  : ""
              }`}
              onClick={() => onUpdateStep(step)}
            >
              <span>{index + 1}</span>

              <div>
                <strong>
                  {step.name || step.type}
                </strong>

                <small>
                  {step.type || "step"}
                </small>
              </div>
            </button>
          ))}
        </div>

        <div className="workflow-editor-panels">
          <StepInspector
            selectedStep={selectedStep}
            onUpdateStep={onUpdateStep}
          />

          <ConditionEditor
            step={selectedStep}
            onUpdateStep={onUpdateStep}
          />

          <ConnectionEditor
            workflow={workflow}
            step={selectedStep}
            onUpdateStep={onUpdateStep}
          />

          <InputMappingEditor
            step={selectedStep}
            onUpdateStep={onUpdateStep}
          />
        </div>
      </div>
    </main>
  );
}

export default WorkflowEditor;
