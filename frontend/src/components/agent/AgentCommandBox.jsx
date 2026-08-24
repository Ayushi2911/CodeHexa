function AgentCommandBox({
  command,
  onCommandChange,
  onSubmit,
  isProcessing = false,
}) {
  return (
    <div className="agent-command-box">
      <div className="agent-command-header">
        <div>
          <span className="agent-label">
            AI AGENT
          </span>

          <h3>
            Tell the agent what to change
          </h3>

          <p>
            Describe a workflow change in natural language.
          </p>
        </div>

        <span className="agent-icon">
          ✦
        </span>
      </div>

      <div className="agent-command-input">
        <textarea
          value={command || ""}
          onChange={(event) =>
            onCommandChange(event.target.value)
          }
          placeholder="Example: Add an approval step before sending the confirmation email."
          rows="4"
          disabled={isProcessing}
        />

        <button
          className="agent-submit-button"
          onClick={onSubmit}
          disabled={
            isProcessing || !command?.trim()
          }
        >
          {isProcessing
            ? "Processing..."
            : "Apply AI Change"}
        </button>
      </div>

      <div className="agent-command-examples">
        <span>Try:</span>

        <button
          type="button"
          onClick={() =>
            onCommandChange(
              "Add an approval step"
            )
          }
          disabled={isProcessing}
        >
          Add approval
        </button>

        <button
          type="button"
          onClick={() =>
            onCommandChange(
              "Add an email notification"
            )
          }
          disabled={isProcessing}
        >
          Add notification
        </button>

        <button
          type="button"
          onClick={() =>
            onCommandChange(
              "Remove the invoice step"
            )
          }
          disabled={isProcessing}
        >
          Remove step
        </button>
      </div>
    </div>
  );
}

export default AgentCommandBox;
