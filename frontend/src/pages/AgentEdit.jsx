import AgentCommandBox from "../components/agent/AgentCommandBox";
import ApprovalActions from "../components/agent/ApprovalActions";
import ConfidenceBadge from "../components/agent/ConfidenceBadge";
import ProposedChanges from "../components/agent/ProposedChanges";
import WarningsPanel from "../components/agent/WarningsPanel";

function AgentEdit({
  command = "",
  onCommandChange,
  onSubmit,
  isProcessing = false,
  proposedChanges = [],
  warnings = [],
  confidence = 0,
  onApprove,
  onReject,
}) {
  return (
    <main className="agent-edit-page">
      <div className="agent-edit-header">
        <div>
          <span className="agent-page-label">
            AI WORKFLOW AGENT
          </span>

          <h1>Intelligent Workflow Editing</h1>

          <p>
            Describe a change in natural language and review
            the agent's proposed modifications before applying them.
          </p>
        </div>

        <ConfidenceBadge
          confidence={confidence}
        />
      </div>

      <AgentCommandBox
        command={command}
        onCommandChange={onCommandChange}
        onSubmit={onSubmit}
        isProcessing={isProcessing}
      />

      <div className="agent-review-grid">
        <div>
          <ProposedChanges
            changes={proposedChanges}
            onApprove={onApprove}
            onReject={onReject}
          />
        </div>

        <div>
          <WarningsPanel
            warnings={warnings}
          />

          <ApprovalActions
            onApprove={onApprove}
            onReject={onReject}
            disabled={
              isProcessing ||
              proposedChanges.length === 0
            }
          />
        </div>
      </div>
    </main>
  );
}

export default AgentEdit;
