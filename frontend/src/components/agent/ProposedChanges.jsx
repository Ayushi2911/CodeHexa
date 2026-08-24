function ProposedChanges({
  changes = [],
  onApprove,
  onReject,
}) {
  if (!changes.length) {
    return (
      <div className="proposed-changes">
        <div className="proposed-changes-header">
          <h3>Proposed Changes</h3>
        </div>

        <p>No changes have been proposed yet.</p>
      </div>
    );
  }

  return (
    <div className="proposed-changes">
      <div className="proposed-changes-header">
        <div>
          <span className="agent-label">
            AI PROPOSAL
          </span>

          <h3>Proposed Workflow Changes</h3>

          <p>
            Review the changes before applying them.
          </p>
        </div>
      </div>

      <div className="proposed-changes-list">
        {changes.map((change, index) => (
          <div
            className="proposed-change"
            key={change.id || index}
          >
            <div className="change-number">
              {index + 1}
            </div>

            <div className="change-content">
              <strong>
                {change.title ||
                  change.name ||
                  "Workflow Change"}
              </strong>

              <p>
                {change.description ||
                  change.reason ||
                  "A workflow modification was proposed."}
              </p>

              {change.type && (
                <span className="change-type">
                  {change.type}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="proposed-changes-actions">
        <button
          className="reject-change-button"
          onClick={onReject}
        >
          Reject
        </button>

        <button
          className="approve-change-button"
          onClick={onApprove}
        >
          Approve Changes
        </button>
      </div>
    </div>
  );
}

export default ProposedChanges;
