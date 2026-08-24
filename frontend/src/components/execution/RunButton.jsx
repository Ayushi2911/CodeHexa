function RunButton({ onRun, isExecuting = false, disabled = false }) {
  return (
    <button
      className="run-button"
      onClick={onRun}
      disabled={isExecuting || disabled}
    >
      {isExecuting ? (
        <>
          <span>⏳</span>
          Running Workflow...
        </>
      ) : (
        <>
          <span>▶</span>
          Run Workflow
        </>
      )}
    </button>
  );
}

export default RunButton;
