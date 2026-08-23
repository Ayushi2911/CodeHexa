import WorkflowDiagram from "../components/workflow/WorkflowDiagram";
import DetectionPanel from "../components/workflow/DetectionPanel";
import DraftWorkflowCard from "../components/workflow/DraftWorkflowCard";
import RequirementPanel from "../components/workflow/RequirementPanel";

function WorkflowStudio({
  workflow,
  requirement,
  onRequirementChange,
  onGenerateWorkflow,
  selectedStepId,
  onSelectStep,
  isGenerating = false,
}) {
  return (
    <main className="workflow-studio-page">
      <div className="workflow-studio-header">
        <span className="studio-label">
          WORKFLOW STUDIO
        </span>

        <h1>Design and automate your workflow</h1>

        <p>
          Describe your business requirement and turn it into
          an executable workflow.
        </p>
      </div>

      <RequirementPanel
        requirement={requirement}
        onRequirementChange={onRequirementChange}
        onGenerateWorkflow={onGenerateWorkflow}
        isGenerating={isGenerating}
      />

      {workflow && (
        <>
          <DetectionPanel workflow={workflow} />

          <DraftWorkflowCard
            workflow={workflow}
          />

          <WorkflowDiagram
            workflow={workflow}
            selectedStepId={selectedStepId}
            onSelectStep={onSelectStep}
          />
        </>
      )}
    </main>
  );
}

export default WorkflowStudio;