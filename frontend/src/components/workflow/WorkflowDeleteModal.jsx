import React, { useState } from "react";

function WorkflowDeleteModal({
  isOpen,
  workflow,
  onClose,
  onSoftDelete,
  onPermanentDelete,
  onExportAndDelete,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState("trash"); // "trash" | "permanent" | "export_trash"

  if (!isOpen || !workflow) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (selectedChoice === "trash") {
        await onSoftDelete(workflow);
      } else if (selectedChoice === "permanent") {
        await onPermanentDelete(workflow);
      } else if (selectedChoice === "export_trash") {
        await onExportAndDelete(workflow);
      }
      onClose();
    } catch (err) {
      console.error("Delete action failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="auth-modal-overlay delete-modal-overlay" onClick={onClose}>
      <div
        className="delete-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Header */}
        <div className="delete-modal-header">
          <div className="delete-title-cluster">
            <span className="delete-icon-badge">🗑️</span>
            <div>
              <span className="delete-eyebrow">WORKFLOW DELETION</span>
              <h3 id="delete-dialog-title">Delete &quot;{workflow.name || "Workflow"}&quot;?</h3>
            </div>
          </div>
          <button
            className="delete-modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        {/* Workflow Quick Metadata Summary */}
        <div className="delete-target-preview">
          <div className="delete-preview-item">
            <small>TARGET WORKFLOW</small>
            <strong>{workflow.name}</strong>
          </div>
          <div className="delete-preview-item">
            <small>VERSION & STATUS</small>
            <span>v{workflow.version || 1}.0 • {(workflow.status || "draft").toUpperCase()}</span>
          </div>
          <div className="delete-preview-item">
            <small>STEPS COUNT</small>
            <span>{workflow.steps?.length || 0} Actions</span>
          </div>
        </div>

        <p className="delete-instruction">
          Please select how you would like to handle this workflow:
        </p>

        {/* 3 Choices Grid */}
        <div className="delete-choices-container">
          {/* CHOICE 1: SOFT DELETE */}
          <div
            className={`delete-choice-card ${selectedChoice === "trash" ? "selected" : ""}`}
            onClick={() => setSelectedChoice("trash")}
            role="radio"
            aria-checked={selectedChoice === "trash"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedChoice("trash")}
          >
            <div className="choice-radio-col">
              <input
                type="radio"
                name="deleteOption"
                checked={selectedChoice === "trash"}
                onChange={() => setSelectedChoice("trash")}
                aria-label="Delete with 7 days recovery"
              />
            </div>
            <div className="choice-content-col">
              <div className="choice-title-row">
                <strong>Move to Trash</strong>
                <span className="choice-badge badge-recommended">Recommended (7-Day Recovery)</span>
              </div>
              <p>
                Temporarily delete the workflow. It will be moved to <strong>Settings → Data &amp; Storage → Deleted Workflows</strong> for <strong>7 days</strong>, where you can restore it at any time. After 7 days, it will be automatically and permanently removed.
              </p>
            </div>
          </div>

          {/* CHOICE 2: PERMANENT DELETE */}
          <div
            className={`delete-choice-card delete-choice-danger ${selectedChoice === "permanent" ? "selected" : ""}`}
            onClick={() => setSelectedChoice("permanent")}
            role="radio"
            aria-checked={selectedChoice === "permanent"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedChoice("permanent")}
          >
            <div className="choice-radio-col">
              <input
                type="radio"
                name="deleteOption"
                checked={selectedChoice === "permanent"}
                onChange={() => setSelectedChoice("permanent")}
                aria-label="Delete permanently"
              />
            </div>
            <div className="choice-content-col">
              <div className="choice-title-row">
                <strong className="text-danger">Delete Permanently</strong>
                <span className="choice-badge badge-danger">Irreversible</span>
              </div>
              <p>
                Permanently remove the workflow immediately from your workspace, executions, and database. <span className="warning-text">Warning: This action cannot be undone or recovered.</span>
              </p>
            </div>
          </div>

          {/* CHOICE 3: DELETE & EXPORT DATA */}
          <div
            className={`delete-choice-card delete-choice-export ${selectedChoice === "export_trash" ? "selected" : ""}`}
            onClick={() => setSelectedChoice("export_trash")}
            role="radio"
            aria-checked={selectedChoice === "export_trash"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedChoice("export_trash")}
          >
            <div className="choice-radio-col">
              <input
                type="radio"
                name="deleteOption"
                checked={selectedChoice === "export_trash"}
                onChange={() => setSelectedChoice("export_trash")}
                aria-label="Export data then move to trash"
              />
            </div>
            <div className="choice-content-col">
              <div className="choice-title-row">
                <strong>Delete &amp; Export Data</strong>
                <span className="choice-badge badge-export">Backup &amp; Trash</span>
              </div>
              <p>
                Export and download the workflow&apos;s operational data, step schemas, and execution history as a JSON file first, then move the workflow to Trash (available for <strong>7 days</strong> for full recovery).
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-cancel-btn"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`delete-confirm-btn btn-mode-${selectedChoice}`}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span>Processing...</span>
            ) : selectedChoice === "trash" ? (
              <span>Move to Trash (7 Days) →</span>
            ) : selectedChoice === "permanent" ? (
              <span>Delete Permanently ✕</span>
            ) : (
              <span>✦ Export JSON &amp; Move to Trash →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDeleteModal;
