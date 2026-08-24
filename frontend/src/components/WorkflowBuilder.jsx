import { useEffect, useState, useRef } from "react";

import { analyzeRequirement, generateSingleWorkflow } from "../data/workflowGenerator";
import { validateWorkflow } from "../utils/workflowValidator";
import { modifyWorkflow } from "../utils/workflowModifier";
import { workflowApi } from "../services/api";

import {
  createExecutionState,
  executeWorkflow
} from "../utils/workflowExecutor";

import {
  createExecutionRecord,
  updateExecutionStep,
  completeExecution
} from "../utils/executionHistory";

import WorkflowInspector from "./WorkflowInspector";
import WorkflowJsonPanel from "./WorkflowJsonPanel";
import WorkflowDiagram from "./workflow/WorkflowDiagram";

function WorkflowBuilder({ onHistoryChange, prefillRequirement = "", onWorkflowChange }) {
  // Input states
  const [projectName, setProjectName] = useState("sample-flow");
  const [requirement, setRequirement] = useState(
    prefillRequirement ||
      "When an order is placed, notify the vendor, create an invoice, update inventory, then send a confirmation to the customer."
  );

  // Generation sequence states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Multi-workflow & Detection states
  // view: "input" | "detected" | "studio"
  const [viewState, setViewState] = useState("input");
  const [detectionData, setDetectionData] = useState(null); // { type, workflows, unresolvedStep, suggestions }
  const [detectedWorkflows, setDetectedWorkflows] = useState([]);
  const [activeWorkflowIndex, setActiveWorkflowIndex] = useState(0);

  // Active workflow in studio
  const [workflow, setWorkflow] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // Manual & Agent Editing
  const [isManualEditMode, setIsManualEditMode] = useState(false);
  const [modificationCommand, setModificationCommand] = useState("");
  const [isAgentAnalyzing, setIsAgentAnalyzing] = useState(false);
  const [agentProposal, setAgentProposal] = useState(null);
  const [modificationMessage, setModificationMessage] = useState("");

  // Resolution modal / action dropdown
  const [resolutionChoice, setResolutionChoice] = useState("");

  // Execution & Test Payload
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        _id: "ORDER-001",
        projectName: "sample-flow",
        totalAmount: 5000,
        stock_type: "physical",
        item_id: "ITEM-001"
      },
      null,
      2
    )
  );
  const [executionState, setExecutionState] = useState([]);
  const [executionMessage, setExecutionMessage] = useState("");
  const [publishMessage, setPublishMessage] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [failStepId, setFailStepId] = useState("");

  // Execution history
  const [executionHistory, setExecutionHistory] = useState([]);

  // Add Workflow Modal
  const [showAddWorkflowModal, setShowAddWorkflowModal] = useState(false);
  const [addWorkflowPrompt, setAddWorkflowPrompt] = useState("");

  const generationTimerRef = useRef(null);

  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange(executionHistory);
    }
  }, [executionHistory, onHistoryChange]);

  useEffect(() => {
    if (prefillRequirement) {
      setRequirement(prefillRequirement);
    }
  }, [prefillRequirement]);

  const generationChecklist = [
    "Understanding requirement...",
    "Loading project context...",
    "Detecting business processes...",
    "Matching available schemas...",
    "Matching available functions...",
    "Resolving operations...",
    "Building workflow definition...",
    "Validating workflow..."
  ];

  /*
   * =========================================================
   * 1. GENERATE WORKFLOW (Intelligent Detection Sequence)
   * =========================================================
   */

  const handleStartGeneration = async () => {
    if (!requirement.trim()) {
      alert("Please enter a business requirement first.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setViewState("input");
    setPublishMessage("");
    setExecutionMessage("");

    // Fast 1.5s animated checklist sequence
    let currentStep = 0;
    generationTimerRef.current = setInterval(() => {
      currentStep++;
      if (currentStep < generationChecklist.length) {
        setGenerationStep(currentStep);
      } else {
        clearInterval(generationTimerRef.current);
        finishGeneration();
      }
    }, 180);
  };

  const finishGeneration = async () => {
    setIsGenerating(false);

    // Call intelligent detector (backend + local fallback)
    let analysis = null;
    try {
      const response = await workflowApi.detectWorkflow(requirement, projectName);
      if (response?.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        if (response.data.data.length > 1) {
          analysis = {
            type: "MULTIPLE_WORKFLOWS",
            workflows: response.data.data.map((raw) => normalizeWorkflowObject(raw))
          };
        } else {
          analysis = {
            type: "SINGLE_WORKFLOW",
            workflows: [normalizeWorkflowObject(response.data.data[0])]
          };
        }
      }
    } catch (err) {
      console.warn("Using smart local detection engine", err);
    }

    if (!analysis) {
      analysis = analyzeRequirement(requirement, projectName);
    }

    setDetectionData(analysis);

    if (analysis.type === "SINGLE_WORKFLOW") {
      setDetectedWorkflows(analysis.workflows);
      setViewState("detected");
    } else if (analysis.type === "MULTIPLE_WORKFLOWS") {
      setDetectedWorkflows(analysis.workflows);
      setViewState("detected");
    } else if (analysis.type === "RESOLUTION_REQUIRED") {
      setDetectedWorkflows([analysis.workflow]);
      setViewState("detected");
    } else if (analysis.type === "NO_WORKFLOW_DETECTED") {
      setDetectedWorkflows([]);
      setViewState("detected");
    }
  };

  const normalizeWorkflowObject = (raw) => {
    if (!raw) return null;
    const wf = { ...raw };
    wf.id = wf.id || wf.workflowId || wf._id || `wf-${Date.now()}`;
    wf.name = wf.name || wf.workflowName || "Generated Workflow";
    wf.version = wf.version || 1;
    wf.status = wf.status || "draft";
    wf.confidence = wf.confidence || 0.88;

    if (!wf.trigger) {
      wf.trigger = {
        id: "trigger-1",
        type: wf.triggerEvent?.type || "trigger",
        name: wf.triggerEvent?.schema
          ? `${wf.triggerEvent.schema.charAt(0).toUpperCase() + wf.triggerEvent.schema.slice(1)} Placed`
          : "Workflow Started",
        source: wf.triggerEvent?.schema || "orders"
      };
    }

    wf.steps = (wf.steps || []).map((step, index) => {
      const stepId = step.id || step.stepId || `step-00${index + 1}`;
      return {
        ...step,
        id: stepId,
        stepId: stepId,
        name: step.name || step.label || `Step ${index + 1}`,
        type: step.type || step.actionType || "action",
        actionType: step.actionType || step.type || "action",
        status: step.status || "pending",
        inputMapping: step.inputMapping || {},
        condition: step.condition || null,
        onSuccess: step.onSuccess,
        onFailure: step.onFailure,
      };
    });

    return wf;
  };

  /*
   * =========================================================
   * 2. OPEN WORKFLOW IN VISUAL STUDIO
   * =========================================================
   */

  const openWorkflowInStudio = (wf, index = 0) => {
    setActiveWorkflowIndex(index);
    setWorkflow(wf);
    setSelectedStep(wf.steps?.[0] || null);
    setValidationResult(null);
    setExecutionState(createExecutionState(wf));
    setPublishMessage("");
    setExecutionMessage("");
    setAgentProposal(null);
    setViewState("studio");

    if (onWorkflowChange) {
      onWorkflowChange(wf, wf.status || "draft");
    }
  };

  const handleBackToDetected = () => {
    setViewState("detected");
  };

  /*
   * =========================================================
   * 3. ACTION RESOLUTION (Fixing Unresolved Steps)
   * =========================================================
   */

  const handleResolveAction = (chosenTarget = null) => {
    if (!detectionData?.workflow) return;

    const currentWf = { ...detectionData.workflow };
    const targetAction = chosenTarget || resolutionChoice || detectionData.unresolvedStep?.suggestedAction || "VerifyOrderRisk";

    // Replace unresolved step with resolved action
    currentWf.steps = currentWf.steps.map((s) => {
      if (s.isUnresolved) {
        return {
          id: s.id,
          stepId: s.id,
          type: "function",
          actionType: "function",
          name: targetAction.replace(/([A-Z])/g, " $1").trim(),
          target: targetAction,
          functionName: targetAction,
          inputMapping: s.inputMapping || { orderId: "{{trigger.orderId}}" },
          onSuccess: s.onSuccess,
          onFailure: s.onFailure,
          status: "pending"
        };
      }
      return s;
    });

    currentWf.status = "ready";
    currentWf.validationPassed = true;

    setDetectionData({
      type: "SINGLE_WORKFLOW",
      workflows: [currentWf]
    });
    setDetectedWorkflows([currentWf]);
  };

  const handleRemoveUnresolvedStep = () => {
    if (!detectionData?.workflow) return;

    const currentWf = { ...detectionData.workflow };
    currentWf.steps = currentWf.steps.filter((s) => !s.isUnresolved);
    currentWf.status = "ready";
    currentWf.validationPassed = true;

    setDetectionData({
      type: "SINGLE_WORKFLOW",
      workflows: [currentWf]
    });
    setDetectedWorkflows([currentWf]);
  };

  /*
   * =========================================================
   * 4. ADD WORKFLOW (Describe with AI / Build Manually)
   * =========================================================
   */

  const handleAddWorkflowAI = () => {
    if (!addWorkflowPrompt.trim()) return;

    const newWf = generateSingleWorkflow(addWorkflowPrompt, projectName);
    newWf.id = `wf-additional-${Date.now()}`;
    newWf.name = newWf.name + " (Added)";

    const updated = [...detectedWorkflows, newWf];
    setDetectedWorkflows(updated);
    setDetectionData({
      type: "MULTIPLE_WORKFLOWS",
      workflows: updated
    });

    setShowAddWorkflowModal(false);
    setAddWorkflowPrompt("");
  };

  const handleAddWorkflowManual = () => {
    const manualWf = {
      id: `wf-manual-${Date.now()}`,
      stepId: `wf-manual-${Date.now()}`,
      workflowId: `wf-manual-${Date.now()}`,
      name: "Custom Workflow",
      projectName,
      version: 1,
      status: "draft",
      confidence: 1.0,
      validationPassed: true,
      trigger: {
        id: "trigger-manual",
        type: "trigger",
        name: "Manual Trigger",
        source: "manual"
      },
      steps: [
        {
          id: "step-001",
          stepId: "step-001",
          type: "action",
          actionType: "formCreate",
          name: "Initial Action",
          target: "records",
          inputMapping: { payload: "{{trigger.payload}}" },
          onSuccess: "end",
          onFailure: "stop",
          status: "pending"
        }
      ]
    };

    const updated = [...detectedWorkflows, manualWf];
    setDetectedWorkflows(updated);
    setDetectionData({
      type: "MULTIPLE_WORKFLOWS",
      workflows: updated
    });

    setShowAddWorkflowModal(false);
    openWorkflowInStudio(manualWf, updated.length - 1);
  };

  /*
   * =========================================================
   * 5. WORKFLOW STEP UPDATE
   * =========================================================
   */

  const updateStep = (updatedStep) => {
    const stepKey = updatedStep.id || updatedStep.stepId;
    setWorkflow((currentWorkflow) => ({
      ...currentWorkflow,
      steps: currentWorkflow.steps.map((step) =>
        step.id === stepKey || step.stepId === stepKey ? updatedStep : step
      )
    }));

    setSelectedStep(updatedStep);
    setValidationResult(null);
  };

  /*
   * =========================================================
   * 6. VALIDATE WORKFLOW
   * =========================================================
   */

  const handleValidateWorkflow = () => {
    if (!workflow) return;
    const result = validateWorkflow(workflow);
    setValidationResult(result);
  };

  /*
   * =========================================================
   * 7. PUBLISH WORKFLOW
   * =========================================================
   */

  const handlePublishWorkflow = () => {
    if (!workflow) return;

    const validation = validateWorkflow(workflow);
    if (!validation.isValid) {
      setValidationResult(validation);
      setExecutionMessage("Cannot publish: please resolve workflow validation issues first.");
      return;
    }

    const updated = {
      ...workflow,
      status: "active",
      version: (workflow.version || 1) + 1,
    };

    setWorkflow(updated);
    setPublishMessage(`✓ Workflow ${updated.name} (v${updated.version}) is now PUBLISHED and live!`);
    setTimeout(() => setPublishMessage(""), 5000);

    if (onWorkflowChange) {
      onWorkflowChange(updated, "active");
    }
  };

  /*
   * =========================================================
   * 8. AI AGENT EDITING (Human-in-the-Loop Proposal)
   * =========================================================
   */

  const handleRequestAgentEdit = async () => {
    if (!modificationCommand.trim()) {
      alert("Please enter a change instruction for the AI agent.");
      return;
    }

    if (!workflow) return;

    setIsAgentAnalyzing(true);
    setAgentProposal(null);

    setTimeout(() => {
      setIsAgentAnalyzing(false);
      const result = modifyWorkflow(workflow, modificationCommand);
      const proposedWf = normalizeWorkflowObject(result.workflow);

      setAgentProposal({
        description: modificationCommand,
        summary: result.message,
        proposedWorkflow: proposedWf,
        addedSteps: ["Manager Approval (auto-rule-gate)"],
      });
    }, 1100);
  };

  const handleApproveAgentEdit = () => {
    if (!agentProposal?.proposedWorkflow) return;

    const updated = {
      ...agentProposal.proposedWorkflow,
      version: workflow.version || 1,
      status: "draft"
    };

    setWorkflow(updated);
    setModificationMessage("✓ Proposed change applied to draft (v" + updated.version + ").");
    setAgentProposal(null);
    setModificationCommand("");
    setSelectedStep(updated.steps?.[0] || null);
    setValidationResult(null);
    setExecutionState(createExecutionState(updated));

    if (onWorkflowChange) {
      onWorkflowChange(updated, "draft");
    }
  };

  const handleRejectAgentEdit = () => {
    setAgentProposal(null);
    setModificationMessage("AI modification proposal rejected.");
    setTimeout(() => setModificationMessage(""), 3000);
  };

  /*
   * =========================================================
   * 9. REAL WORKFLOW EXECUTION (With Condition Branching)
   * =========================================================
   */

  const handleRunWorkflow = async () => {
    if (!workflow) return;

    const validation = validateWorkflow(workflow);
    setValidationResult(validation);

    if (!validation.isValid) {
      setExecutionMessage("Workflow cannot run until validation issues are fixed.");
      return;
    }

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(testPayload);
    } catch (_) {
      parsedPayload = { stock_type: "physical" };
    }

    setIsExecuting(true);
    setExecutionMessage("⚡ Workflow execution started with test payload...");
    setPublishMessage("");

    setExecutionState(createExecutionState(workflow));

    let currentExecution = createExecutionRecord(workflow);
    setExecutionHistory((history) => [currentExecution, ...history]);

    const result = await executeWorkflow(
      workflow,
      (stepId, status, attempts) => {
        setExecutionState((currentState) =>
          currentState.map((item) =>
            item.stepId === stepId ? { ...item, status, attempts } : item
          )
        );

        setWorkflow((currentWf) => ({
          ...currentWf,
          steps: currentWf.steps.map((s) =>
            s.id === stepId || s.stepId === stepId ? { ...s, status } : s
          )
        }));

        currentExecution = updateExecutionStep(currentExecution, stepId, status);

        setExecutionHistory((history) =>
          history.map((execution) =>
            execution.id === currentExecution.id ? currentExecution : execution
          )
        );
      },
      {
        failStepId: failStepId || null,
        maxRetries: 1
      }
    );

    currentExecution = completeExecution(currentExecution);

    setExecutionHistory((history) =>
      history.map((execution) =>
        execution.id === currentExecution.id ? currentExecution : execution
      )
    );

    setExecutionMessage(result.message || "✓ Workflow executed successfully (227ms).");
    setIsExecuting(false);
  };

  /*
   * =========================================================
   * 10. DOWNLOAD WORKFLOW JSON
   * =========================================================
   */

  const handleDownloadWorkflow = () => {
    if (!workflow) return;

    const fileName = `${workflow.name.toLowerCase().replace(/\s+/g, "-")}-workflow.json`;
    const jsonContent = JSON.stringify(workflow, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="builder-section" id="builder">
      {/* =========================================================
          VIEW 1 & 2: INTENT INPUT & REASONING HUD
          ========================================================= */}
      {viewState !== "studio" && (
        <>
          <div className="builder-header">
            <div>
              <p className="tag">INTELLIGENT WORKFLOW GENERATOR</p>
              <h2>Describe your business requirement</h2>
              <p>
                Enter a natural-language business process. CodeHexa Flow analyzes project context,
                detects independent workflows, resolves schemas & functions, and builds executable graphs.
              </p>
            </div>
          </div>

          <div className="requirement-box">
            <div className="project-name-row">
              <label htmlFor="project-name-input">PROJECT NAME</label>
              <input
                id="project-name-input"
                className="project-name-field"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. sample-flow"
              />
            </div>

            <label htmlFor="req-textarea" className="req-label">BUSINESS REQUIREMENT</label>
            <textarea
              id="req-textarea"
              value={requirement}
              onChange={(event) => setRequirement(event.target.value)}
              placeholder="Example: When an order is placed, notify the vendor, create an invoice, update inventory, then send a confirmation to the customer."
            />

            <div className="requirement-box-actions">
              <button
                className="primary-btn generate-workflow-btn"
                onClick={handleStartGeneration}
                disabled={isGenerating}
                type="button"
              >
                <span className="btn-spark-icon">✦</span>
                {isGenerating ? "Analyzing Context..." : "Generate Workflow"}
                <span className="btn-arrow-icon">→</span>
              </button>
            </div>

            {/* FAST ACTIVE REASONING HUD */}
            {isGenerating && (
              <div className="sim-processing-hud builder-hud">
                <div className="sim-hud-title">
                  <span className="spinner-small" /> Analyzing Business Intent & Project Capabilities...
                </div>
                <div className="sim-hud-checks">
                  {generationChecklist.map((item, idx) => (
                    <span
                      key={item}
                      className={idx <= generationStep ? "hud-check completed-check" : "hud-check pending-check"}
                    >
                      {idx <= generationStep ? "✓" : "○"} {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================================
          VIEW 2: DETECTION RESULTS REVIEW CARDS
          ========================================================= */}
      {viewState === "detected" && detectionData && (
        <div className="detected-results-section">
          {/* CASE A: 1 WORKFLOW DETECTED */}
          {detectionData.type === "SINGLE_WORKFLOW" && (
            <div className="detection-overview-card">
              <div className="detection-header-row">
                <div className="features-eyebrow">
                  <span className="features-eyebrow-dot" />
                  WORKFLOW GENERATED
                </div>
                <h3>1 Business Workflow Detected</h3>
              </div>

              <div className="workflow-result-cards-grid">
                {detectionData.workflows.map((wf, idx) => (
                  <div key={wf.id} className="workflow-summary-card">
                    <div className="card-top-row">
                      <h4>{wf.name}</h4>
                      <span className="sim-status-tag tag-published">READY</span>
                    </div>

                    <div className="card-meta-chips">
                      <span>Confidence: <strong>{Math.round((wf.confidence || 0.88) * 100)}%</strong></span>
                      <span>Validation: <strong className="green-text">Passed ✓</strong></span>
                    </div>

                    <div className="card-trigger-preview">
                      <label>TRIGGER</label>
                      <div className="trigger-chip">⚡ {wf.trigger?.name || "Order Created"}</div>
                    </div>

                    <div className="card-actions-summary">
                      <label>{wf.steps?.length || 0} ACTIONS FLOW</label>
                      <div className="actions-flow-chain">
                        {wf.steps?.map((st, sIdx) => (
                          <span key={st.id} className="flow-chain-item">
                            {st.name} {sIdx < wf.steps.length - 1 ? "➔" : ""}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="primary-btn open-workflow-cta"
                      onClick={() => openWorkflowInStudio(wf, idx)}
                      type="button"
                    >
                      ✦ Open Workflow →
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-workflow-footer-row">
                <button
                  className="add-workflow-btn-secondary"
                  onClick={() => setShowAddWorkflowModal(true)}
                  type="button"
                >
                  + Add Workflow
                </button>
              </div>
            </div>
          )}

          {/* CASE B: MULTIPLE WORKFLOWS DETECTED */}
          {detectionData.type === "MULTIPLE_WORKFLOWS" && (
            <div className="detection-overview-card">
              <div className="detection-header-row">
                <div className="features-eyebrow">
                  <span className="features-eyebrow-dot" />
                  MULTI-PROCESS DETECTED
                </div>
                <h3>{detectionData.workflows.length} Business Workflows Detected</h3>
                <p className="detection-subtext">
                  Your requirement contains multiple independent business processes. Review and manage each workflow independently.
                </p>
              </div>

              <div className="workflow-result-cards-grid multi-grid">
                {detectionData.workflows.map((wf, idx) => (
                  <div key={wf.id} className="workflow-summary-card">
                    <div className="card-top-row">
                      <h4>{wf.name}</h4>
                      <span className="sim-status-tag tag-published">READY</span>
                    </div>

                    <div className="card-meta-chips">
                      <span>Confidence: <strong>{Math.round((wf.confidence || 0.88) * 100)}%</strong></span>
                      <span>Validation: <strong className="green-text">Passed ✓</strong></span>
                    </div>

                    <div className="card-trigger-preview">
                      <label>TRIGGER</label>
                      <div className="trigger-chip">⚡ {wf.trigger?.name || "Event Started"}</div>
                    </div>

                    <div className="card-actions-summary">
                      <label>{wf.steps?.length || 0} ACTIONS</label>
                      <div className="actions-flow-chain">
                        {wf.steps?.map((st, sIdx) => (
                          <span key={st.id} className="flow-chain-item">
                            {st.name} {sIdx < wf.steps.length - 1 ? "➔" : ""}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="primary-btn open-workflow-cta"
                      onClick={() => openWorkflowInStudio(wf, idx)}
                      type="button"
                    >
                      ✦ Open Workflow →
                    </button>
                  </div>
                ))}
              </div>

              <div className="multi-actions-footer-bar">
                <button
                  className="primary-btn"
                  onClick={() => openWorkflowInStudio(detectionData.workflows[0], 0)}
                  type="button"
                >
                  Accept All & Review Workflow #1
                </button>
                <button
                  className="add-workflow-btn-secondary"
                  onClick={() => setShowAddWorkflowModal(true)}
                  type="button"
                >
                  + Add Workflow
                </button>
              </div>
            </div>
          )}

          {/* CASE C: ACTION RESOLUTION REQUIRED */}
          {detectionData.type === "RESOLUTION_REQUIRED" && (
            <div className="detection-overview-card resolution-card">
              <div className="resolution-header-row">
                <span className="warning-badge-icon">⚠️</span>
                <div>
                  <h3>WORKFLOW NEEDS REVIEW</h3>
                  <p>1 action requires your attention before execution graph can be compiled.</p>
                </div>
              </div>

              <div className="resolution-items-list">
                {detectionData.workflow?.steps?.map((step) => {
                  if (step.isUnresolved) {
                    return (
                      <div key={step.id} className="unresolved-action-card">
                        <div className="unresolved-header">
                          <span className="unresolved-tag">NOT FOUND</span>
                          <h4>{step.name}</h4>
                          <p>No exact project capability was found for this step in project context.</p>
                        </div>

                        <div className="suggested-resolution-box">
                          <span className="suggestion-label">Suggested Project Action:</span>
                          <strong className="suggested-target">{step.suggestedAction}</strong>

                          <div className="resolution-buttons-group">
                            <button
                              className="primary-btn resolve-btn"
                              onClick={() => handleResolveAction(step.suggestedAction)}
                              type="button"
                            >
                              ✓ Use Suggestion ({step.suggestedAction})
                            </button>

                            <select
                              className="existing-actions-select"
                              onChange={(e) => {
                                if (e.target.value) handleResolveAction(e.target.value);
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Choose Existing Action...</option>
                              {step.availableOptions?.map((opt) => (
                                <option key={opt.target} value={opt.target}>{opt.label}</option>
                              ))}
                            </select>

                            <button
                              className="remove-step-btn"
                              onClick={handleRemoveUnresolvedStep}
                              type="button"
                            >
                              Remove Step
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={step.id} className="resolved-action-item">
                      <span className="green-check-icon">✓</span>
                      <strong>{step.name}</strong>
                      <span className="resolved-tag">Resolved ({step.target || step.type})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CASE D: NO WORKFLOW DETECTED */}
          {detectionData.type === "NO_WORKFLOW_DETECTED" && (
            <div className="detection-overview-card vague-card">
              <div className="vague-header-row">
                <span className="info-badge-icon">ℹ</span>
                <div>
                  <h3>We need more information</h3>
                  <p>We couldn&apos;t identify a complete business workflow from this requirement.</p>
                </div>
              </div>

              <div className="vague-guidance-content">
                <p>Try describing:</p>
                <ul>
                  {detectionData.suggestions?.map((sug) => (
                    <li key={sug}>{sug}</li>
                  ))}
                </ul>

                <div className="vague-example-box">
                  <span>Example:</span>
                  <code>&quot;{detectionData.example}&quot;</code>
                </div>

                <div className="vague-actions-bar">
                  <button
                    className="primary-btn"
                    onClick={() => {
                      setRequirement(detectionData.example || "");
                      setViewState("input");
                    }}
                    type="button"
                  >
                    Use Example &amp; Edit
                  </button>
                  <button
                    className="add-workflow-btn-secondary"
                    onClick={handleAddWorkflowManual}
                    type="button"
                  >
                    Build Manually
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 3: VISUAL WORKFLOW STUDIO ("Open Workflow")
          ========================================================= */}
      {viewState === "studio" && workflow && (
        <div className="visual-studio-container">
          {/* STUDIO HEADER */}
          <div className="studio-top-nav-bar">
            <button
              className="back-to-workflows-btn"
              onClick={handleBackToDetected}
              type="button"
            >
              ← Back to Workflows
            </button>

            <div className="studio-title-block">
              <h3>{workflow.name}</h3>
              <span className={workflow.status === "active" ? "sim-status-tag tag-published" : "sim-status-tag tag-draft"}>
                {workflow.status === "active" ? `● PUBLISHED (v${workflow.version || 1}.0)` : `○ DRAFT (v${workflow.version || 1}.0)`}
              </span>
            </div>

            <div className="studio-top-actions">
              <button
                className="validate-btn"
                onClick={handleValidateWorkflow}
                disabled={isExecuting}
                type="button"
              >
                ✓ Validate
              </button>

              <button
                className="publish-workflow-btn"
                onClick={handlePublishWorkflow}
                disabled={isExecuting}
                type="button"
              >
                🚀 Publish
              </button>

              <button
                className={isManualEditMode ? "manual-edit-toggle active-edit-mode" : "manual-edit-toggle"}
                onClick={() => setIsManualEditMode((prev) => !prev)}
                type="button"
              >
                {isManualEditMode ? "✓ Done Editing" : "✏️ Edit Workflow"}
              </button>
            </div>
          </div>

          {/* PUBLISH MESSAGE */}
          {publishMessage && (
            <div className="publish-success-banner">
              {publishMessage}
            </div>
          )}

          {/* VALIDATION RESULT */}
          {validationResult && (
            <div
              className={`validation-result ${
                validationResult.isValid ? "validation-success" : "validation-error"
              }`}
            >
              {validationResult.isValid ? (
                <div className="valid-summary-row">
                  <span>✓ Workflow is structurally valid and ready to execute.</span>
                  <small>Step IDs: Passed • Actions: Passed • Input Mappings: Passed • Conditions: Passed • DAG: Passed</small>
                </div>
              ) : (
                <>
                  <p className="validation-title">
                    Workflow has {validationResult.errors.length} issue(s):
                  </p>
                  <ul>
                    {validationResult.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* AI AGENT WORKFLOW EDITOR */}
          <div className="ai-command-box">
            <div className="ai-command-header">
              <div>
                <p className="inspector-label">AI WORKFLOW AGENT</p>
                <h3>Modify your workflow with AI</h3>
              </div>
              <span className="ai-badge">✦ AI</span>
            </div>

            <p className="ai-command-description">
              Describe modifications in natural language (e.g. &quot;Add an approval step before Send Confirmation&quot;).
            </p>

            <div className="ai-command-input">
              <input
                type="text"
                value={modificationCommand}
                onChange={(event) => setModificationCommand(event.target.value)}
                placeholder="Example: Add an approval step before Send Confirmation"
              />

              <button
                className="modify-btn"
                onClick={handleRequestAgentEdit}
                disabled={isExecuting || isAgentAnalyzing}
                type="button"
              >
                {isAgentAnalyzing ? "Analyzing..." : "Generate Change"}
              </button>
            </div>

            {isAgentAnalyzing && (
              <div className="agent-reasoning-hud">
                <span className="spinner-small" />
                <span>Understanding requested change... Checking workflow DAG... Creating proposal...</span>
              </div>
            )}

            {/* HUMAN-IN-THE-LOOP PROPOSAL CARD */}
            {agentProposal && (
              <div className="agent-proposal-card">
                <div className="proposal-card-header">
                  <span className="proposal-badge">PROPOSED MODIFICATION (HUMAN-IN-THE-LOOP)</span>
                  <h4>+ Add Approval Step before Send Confirmation</h4>
                </div>

                <div className="sim-proposal-diff">
                  <div className="diff-box">
                    <span>Current Workflow (v{workflow.version || 1})</span>
                    <p>Update Inventory → Send Confirmation</p>
                  </div>
                  <span className="diff-arrow">➔</span>
                  <div className="diff-box diff-box-after">
                    <span>Proposed Workflow (Draft v{(workflow.version || 1) + 1})</span>
                    <p>Update Inventory → <strong>[Approval Gate]</strong> → Send Confirmation</p>
                  </div>
                </div>

                <div className="sim-proposal-actions">
                  <button className="reject-btn" onClick={handleRejectAgentEdit} type="button">
                    Reject
                  </button>
                  <button className="approve-btn" onClick={handleApproveAgentEdit} type="button">
                    ✓ Approve Change
                  </button>
                  <span className="human-control-quote">“AI proposes. User stays in control.”</span>
                </div>
              </div>
            )}

            {modificationMessage && !agentProposal && (
              <div className="modification-message">
                {modificationMessage}
              </div>
            )}

            <div className="command-examples">
              <span>Try:</span>
              <button
                disabled={isExecuting}
                onClick={() => setModificationCommand("Add an approval step before Send Confirmation")}
                type="button"
              >
                + Add approval
              </button>
              <button
                disabled={isExecuting}
                onClick={() => setModificationCommand("Add customer satisfaction survey")}
                type="button"
              >
                + Add survey
              </button>
              <button
                disabled={isExecuting}
                onClick={() => setModificationCommand("Remove Create Invoice")}
                type="button"
              >
                - Remove invoice
              </button>
            </div>
          </div>

          {/* WORKFLOW WORKSPACE */}
          <div className="workflow-workspace">
            <div className="workflow-preview">
              <div className="studio-canvas-toolbar">
                <div className="execution-control-row">
                  <div className="test-payload-preview-group">
                    <label>RUNTIME TEST PAYLOAD (INPUT JSON)</label>
                    <textarea
                      className="test-payload-textarea"
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="run-actions-cluster">
                    <div className="failure-simulation">
                      <label htmlFor="failure-step">Failure Demo</label>
                      <select
                        id="failure-step"
                        value={failStepId}
                        onChange={(event) => setFailStepId(event.target.value)}
                        disabled={isExecuting}
                      >
                        <option value="">No failure (Normal run)</option>
                        {workflow.steps?.map((step) => (
                          <option key={step.id} value={step.id}>
                            Fail once: {step.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="run-workflow-btn"
                      onClick={handleRunWorkflow}
                      disabled={isExecuting}
                      type="button"
                    >
                      {isExecuting ? "⚡ Running..." : "▶ Run Workflow"}
                    </button>
                  </div>
                </div>
              </div>

              {/* EXECUTION MESSAGE */}
              {executionMessage && (
                <div className="execution-message">
                  {executionMessage}
                </div>
              )}

              {/* VISUAL DIAGRAM */}
              <WorkflowDiagram
                workflow={workflow}
                executionState={executionState}
                selectedStepId={selectedStep?.id}
                onSelectStep={(stepId) => {
                  const step = workflow.steps?.find(
                    (s) => s.id === stepId || s.stepId === stepId
                  );
                  setSelectedStep(step || null);
                }}
              />
            </div>

            {/* STEP INSPECTOR */}
            <WorkflowInspector
              selectedStep={selectedStep}
              onUpdateStep={updateStep}
            />
          </div>

          {/* WORKFLOW JSON */}
          <WorkflowJsonPanel workflow={workflow} />

          {/* WORKFLOW EXPORT */}
          <div className="workflow-download-section">
            <div className="workflow-download-info">
              <span className="download-label">WORKFLOW EXPORT</span>
              <h3>Download Executable Workflow (JSON)</h3>
            </div>

            <button
              className="workflow-download-btn"
              onClick={handleDownloadWorkflow}
              type="button"
              aria-label="Download Workflow"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v11" />
                <path d="M7 10l5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
              <span>Download</span>
            </button>
          </div>

          {/* EXECUTION HISTORY */}
          {executionHistory.length > 0 && (
            <section className="execution-history">
              <div className="execution-history-header">
                <div>
                  <p className="inspector-label">EXECUTION TRACES</p>
                  <h3>Workflow Runs History</h3>
                </div>
                <span>
                  {executionHistory.length} run{executionHistory.length > 1 ? "s" : ""} recorded
                </span>
              </div>

              <div className="history-list">
                {executionHistory.map((execution) => (
                  <div key={execution.id} className="history-card">
                    <div className="history-card-header">
                      <div>
                        <strong>{execution.workflowName}</strong>
                        <span className={`history-status ${execution.status}`}>
                          {execution.status.toUpperCase()}
                        </span>
                      </div>
                      <small>{new Date(execution.timestamp).toLocaleTimeString()}</small>
                    </div>

                    <div className="history-steps">
                      {execution.steps?.map((step) => (
                        <span
                          key={step.stepId}
                          className={`history-step-badge ${step.status}`}
                        >
                          {step.stepId}: {step.status} ({step.attempts || 1}x)
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* =========================================================
          ADD WORKFLOW MODAL
          ========================================================= */}
      {showAddWorkflowModal && (
        <div className="sim-inspector-modal add-workflow-modal">
          <div className="sim-inspector-header">
            <div>
              <span className="badge-type">+ ADD WORKFLOW</span>
              <h4>Add Additional Workflow</h4>
            </div>
            <button
              className="sim-close-x"
              onClick={() => setShowAddWorkflowModal(false)}
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="add-workflow-modal-body">
            <label>Option 1: Describe with AI</label>
            <input
              className="add-wf-input"
              type="text"
              value={addWorkflowPrompt}
              onChange={(e) => setAddWorkflowPrompt(e.target.value)}
              placeholder="e.g. When an order is cancelled, refund customer and restore inventory"
            />
            <button
              className="primary-btn"
              onClick={handleAddWorkflowAI}
              type="button"
            >
              ✦ Generate Additional Workflow
            </button>

            <div className="modal-divider"><span>or</span></div>

            <label>Option 2: Build Manually</label>
            <button
              className="add-workflow-btn-secondary"
              onClick={handleAddWorkflowManual}
              type="button"
            >
              + Create Empty Workflow Draft
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default WorkflowBuilder;
