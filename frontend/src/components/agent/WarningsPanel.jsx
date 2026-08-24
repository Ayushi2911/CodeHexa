function WarningsPanel({ warnings = [] }) {
  if (!warnings.length) {
    return (
      <div className="warnings-panel warnings-none">
        <div className="warnings-header">
          <div>
            <h3>Warnings</h3>
            <p>No issues detected in the proposed changes.</p>
          </div>

          <span className="warning-status">
            ✓ Clear
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="warnings-panel">
      <div className="warnings-header">
        <div>
          <h3>⚠ Warnings</h3>
          <p>Review these items before approving the changes.</p>
        </div>

        <span className="warning-count">
          {warnings.length}
        </span>
      </div>

      <div className="warnings-list">
        {warnings.map((warning, index) => (
          <div
            className="warning-item"
            key={warning.id || index}
          >
            <span className="warning-icon">!</span>

            <div>
              <strong>
                {warning.title || "Workflow Warning"}
              </strong>

              <p>
                {warning.message ||
                  warning.description ||
                  String(warning)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WarningsPanel;
