function ApprovalActions({
  onApprove,
  onReject,
  disabled = false,
}) {
  return (
    <div className="approval-actions">
      <div className="approval-actions-header">
        <div>
          <h3>Review Required</h3>
          <p>
            Approve or reject the proposed workflow changes.
          </p>
        </div>

        <span className="approval-badge">
          APPROVAL
        </span>
      </div>

      <div className="approval-buttons">
        <button
          className="approval-reject-button"
          onClick={onReject}
          disabled={disabled}
        >
          Reject
        </button>

        <button
          className="approval-approve-button"
          onClick={onApprove}
          disabled={disabled}
        >
          Approve
        </button>
      </div>
    </div>
  );
}

export default ApprovalActions;
