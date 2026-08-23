import { useState } from "react";

function WorkflowJsonPanel({ workflow }) {
  const [copied, setCopied] = useState(false);

  if (!workflow) {
    return null;
  }

  const formattedJson = JSON.stringify(workflow, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy workflow JSON:", error);
      alert("Could not copy JSON.");
    }
  };

  return (
    <section className="json-panel">
      <div className="json-panel-header">
        <div>
          <p className="inspector-label">CANONICAL WORKFLOW JSON</p>
          <h3>Workflow Definition</h3>
        </div>

        <button className="copy-json-btn" onClick={handleCopy}>
          {copied ? "Copied ✓" : "Copy JSON"}
        </button>
      </div>

      <pre className="json-content">{formattedJson}</pre>
    </section>
  );
}

export default WorkflowJsonPanel;
