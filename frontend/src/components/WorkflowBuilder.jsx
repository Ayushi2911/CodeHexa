import { useEffect, useState } from "react";

import { generateWorkflowFromRequirement } from "../data/workflowGenerator";
import { validateWorkflow } from "../utils/workflowValidator";
import { modifyWorkflow } from "../utils/workflowModifier";

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

function WorkflowBuilder({ onHistoryChange, prefillRequirement = "" }) {
  const [requirement, setRequirement] = useState(prefillRequirement);
  const [workflow, setWorkflow] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // AI modification
  const [modificationCommand, setModificationCommand] = useState("");
  const [modificationMessage, setModificationMessage] =
    useState("");

  // Execution
  const [executionState, setExecutionState] = useState([]);
  const [executionMessage, setExecutionMessage] =
    useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [failStepId, setFailStepId] = useState("");

  // Execution history
  const [executionHistory, setExecutionHistory] =
    useState([]);

  /*
   * =========================================================
   * SEND HISTORY TO APP
   * =========================================================
   */

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

  /*
   * =========================================================
   * GENERATE WORKFLOW
   * =========================================================
   */

  const generateWorkflow = () => {
    if (!requirement.trim()) {
      alert(
        "Please enter a business requirement first."
      );
      return;
    }

    const generatedWorkflow =
      generateWorkflowFromRequirement(requirement);

    setWorkflow(generatedWorkflow);
    setSelectedStep(null);
    setValidationResult(null);

    setModificationCommand("");
    setModificationMessage("");

    setExecutionState(
      createExecutionState(generatedWorkflow)
    );

    setExecutionMessage("");
  };

  /*
   * =========================================================
   * UPDATE WORKFLOW STEP
   * =========================================================
   */

  const updateStep = (updatedStep) => {
    setWorkflow((currentWorkflow) => ({
      ...currentWorkflow,
      steps: currentWorkflow.steps.map((step) =>
        step.id === updatedStep.id
          ? updatedStep
          : step
      )
    }));

    setSelectedStep(updatedStep);
    setValidationResult(null);
  };

  /*
   * =========================================================
   * VALIDATE WORKFLOW
   * =========================================================
   */

  const handleValidateWorkflow = () => {
    if (!workflow) {
      return;
    }

    const result = validateWorkflow(workflow);

    setValidationResult(result);
  };

  /*
   * =========================================================
   * AI MODIFY WORKFLOW
   * =========================================================
   */

  const handleModifyWorkflow = () => {
    if (!modificationCommand.trim()) {
      alert(
        "Please enter a modification command."
      );
      return;
    }

    if (!workflow) {
      return;
    }

    const result = modifyWorkflow(
      workflow,
      modificationCommand
    );

    setWorkflow(result.workflow);

    setModificationMessage(result.message);

    setModificationCommand("");

    setSelectedStep(null);

    setValidationResult(null);

    setExecutionState(
      createExecutionState(result.workflow)
    );

    setExecutionMessage("");
  };

  /*
   * =========================================================
   * DOWNLOAD WORKFLOW
   * =========================================================
   */

  const handleDownloadWorkflow = () => {
    if (!workflow) {
      alert("Generate a workflow first.");
      return;
    }

    const workflowFile = {
      name: workflow.name,
      trigger: workflow.trigger,
      steps: workflow.steps,
      downloadedAt: new Date().toISOString()
    };

    const json = JSON.stringify(
      workflowFile,
      null,
      2
    );

    const blob = new Blob(
      [json],
      {
        type: "application/json"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "CodeHexa-Workflow.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * =========================================================
   * RUN WORKFLOW
   * =========================================================
   */

  const handleRunWorkflow = async () => {
    if (!workflow || isExecuting) {
      return;
    }

    const validation =
      validateWorkflow(workflow);

    setValidationResult(validation);

    if (!validation.isValid) {
      setExecutionMessage(
        "Workflow cannot run until validation issues are fixed."
      );

      return;
    }

    setIsExecuting(true);

    setExecutionMessage(
      "Workflow execution started."
    );

    setExecutionState(
      createExecutionState(workflow)
    );

    let currentExecution =
      createExecutionRecord(workflow);

    setExecutionHistory((history) => [
      currentExecution,
      ...history
    ]);

    const result = await executeWorkflow(
      workflow,
      (stepId, status, attempts) => {

        setExecutionState((currentState) =>
          currentState.map((item) =>
            item.stepId === stepId
              ? {
                  ...item,
                  status,
                  attempts
                }
              : item
          )
        );

        currentExecution =
          updateExecutionStep(
            currentExecution,
            stepId,
            status
          );

        setExecutionHistory((history) =>
          history.map((execution) =>
            execution.id ===
            currentExecution.id
              ? currentExecution
              : execution
          )
        );
      },
      {
        failStepId:
          failStepId || null,

        maxRetries: 1
      }
    );

    currentExecution =
      completeExecution(
        currentExecution
      );

    setExecutionHistory((history) =>
      history.map((execution) =>
        execution.id ===
        currentExecution.id
          ? currentExecution
          : execution
      )
    );

    setExecutionMessage(
      result.message
    );

    setIsExecuting(false);
  };

  /*
   * =========================================================
   * STEP STATUS
   * =========================================================
   */

  const getStepStatus = (stepId) => {
    return (
      executionState.find(
        (item) =>
          item.stepId === stepId
      )?.status || "pending"
    );
  };

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <section
      className="builder-section"
      id="builder"
    >

      <div className="builder-header">

        <div>

          <p className="tag">
            WORKFLOW STUDIO
          </p>

          <h2>
            Describe your requirement
          </h2>

          <p>
            Enter a business requirement,
            generate a workflow, modify it,
            validate it, and execute it
            step-by-step.
          </p>

        </div>

      </div>


      {/* REQUIREMENT INPUT */}

      <div className="requirement-box">

        <textarea
          value={requirement}
          onChange={(event) =>
            setRequirement(
              event.target.value
            )
          }
          placeholder="Example: When an order is placed, create an invoice, update inventory, and send a confirmation to the customer."
        />

        <button
          className="primary-btn"
          onClick={generateWorkflow}
        >
          Generate Workflow
        </button>

      </div>


      {workflow && (
        <>

          {/* AI WORKFLOW EDITOR */}

          <div className="ai-command-box">

            <div className="ai-command-header">

              <div>

                <p className="inspector-label">
                  AI WORKFLOW EDITOR
                </p>

                <h3>
                  Modify your workflow
                </h3>

              </div>

              <span className="ai-badge">
                AI
              </span>

            </div>


            <p className="ai-command-description">
              Describe the change you want
              to make.
            </p>


            <div className="ai-command-input">

              <input
                type="text"
                value={modificationCommand}
                onChange={(event) =>
                  setModificationCommand(
                    event.target.value
                  )
                }
                placeholder="Example: Add an email notification"
              />

              <button
                className="modify-btn"
                onClick={
                  handleModifyWorkflow
                }
                disabled={isExecuting}
              >
                Apply Change
              </button>

            </div>


            {modificationMessage && (
              <div className="modification-message">
                {modificationMessage}
              </div>
            )}


            <div className="command-examples">

              <span>
                Try:
              </span>

              <button
                disabled={isExecuting}
                onClick={() =>
                  setModificationCommand(
                    "Add an email notification"
                  )
                }
              >
                Add email
              </button>

              <button
                disabled={isExecuting}
                onClick={() =>
                  setModificationCommand(
                    "Add an approval step"
                  )
                }
              >
                Add approval
              </button>

              <button
                disabled={isExecuting}
                onClick={() =>
                  setModificationCommand(
                    "Remove Create Invoice"
                  )
                }
              >
                Remove invoice
              </button>

            </div>

          </div>


          {/* WORKFLOW WORKSPACE */}

          <div className="workflow-workspace">

            <div className="workflow-preview">

              <div className="workflow-preview-header">

                <div>

                  <h3>
                    {workflow.name}
                  </h3>

                  <span>
                    {workflow.steps.length} steps
                  </span>

                </div>


                <div className="workflow-actions">

                  <button
                    className="validate-btn"
                    onClick={
                      handleValidateWorkflow
                    }
                    disabled={isExecuting}
                  >
                    Validate Workflow
                  </button>


                  <div className="failure-simulation">

                    <label htmlFor="failure-step">
                      Demo Failure Simulation
                    </label>

                    <select
                      id="failure-step"
                      value={failStepId}
                      onChange={(event) =>
                        setFailStepId(
                          event.target.value
                        )
                      }
                      disabled={isExecuting}
                    >

                      <option value="">
                        No failure — Normal execution
                      </option>

                      {workflow.steps.map(
                        (step) => (
                          <option
                            key={step.id}
                            value={step.id}
                          >
                            Fail once:{" "}
                            {step.name}
                          </option>
                        )
                      )}

                    </select>

                  </div>


                  <button
                    className="run-workflow-btn"
                    onClick={
                      handleRunWorkflow
                    }
                    disabled={isExecuting}
                  >
                    {isExecuting
                      ? "Running..."
                      : "Run Workflow"}
                  </button>

                </div>

              </div>


              {/* VALIDATION */}

              {validationResult && (

                <div
                  className={`validation-result ${
                    validationResult.isValid
                      ? "validation-success"
                      : "validation-error"
                  }`}
                >

                  {validationResult.isValid ? (

                    <p>
                      ✓ Workflow is valid and
                      ready to run.
                    </p>

                  ) : (

                    <>

                      <p className="validation-title">
                        Workflow has{" "}
                        {
                          validationResult
                            .errors.length
                        }{" "}
                        issue(s):
                      </p>

                      <ul>

                        {validationResult.errors.map(
                          (error) => (
                            <li key={error}>
                              {error}
                            </li>
                          )
                        )}

                      </ul>

                    </>

                  )}

                </div>

              )}


              {/* EXECUTION MESSAGE */}

              {executionMessage && (

                <div className="execution-message">
                  {executionMessage}
                </div>

              )}


              {/* WORKFLOW STEPS */}

              <div className="workflow-steps">

                <div className="workflow-step-wrapper">

                  <div className="workflow-step trigger-step">

                    <span className="step-type">
                      TRIGGER
                    </span>

                    <h4>
                      {workflow.trigger.name}
                    </h4>

                  </div>


                  {workflow.steps.length > 0 && (

                    <div className="step-arrow">
                      ↓
                    </div>

                  )}

                </div>


                {workflow.steps.map(
                  (step, index) => {

                    const stepStatus =
                      getStepStatus(
                        step.id
                      );

                    return (

                      <div
                        className="workflow-step-wrapper"
                        key={step.id}
                      >

                        <button
                          className={`workflow-step clickable-step status-${stepStatus} ${
                            selectedStep?.id ===
                            step.id
                              ? "selected-step"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedStep(
                              step
                            )
                          }
                          disabled={
                            isExecuting
                          }
                        >

                          <span className="step-type">
                            {step.type.toUpperCase()}
                          </span>

                          <h4>
                            {step.name}
                          </h4>

                          <span className="execution-status">
                            {stepStatus.toUpperCase()}
                          </span>

                        </button>


                        {index <
                          workflow.steps.length -
                            1 && (

                          <div className="step-arrow">
                            ↓
                          </div>

                        )}

                      </div>

                    );
                  }
                )}

              </div>

            </div>


            {/* INSPECTOR */}

            <WorkflowInspector
              selectedStep={
                selectedStep
              }
              onUpdateStep={
                updateStep
              }
            />

          </div>


          {/* WORKFLOW JSON */}

          <WorkflowJsonPanel
            workflow={workflow}
          />


          {/* =================================================
              WORKFLOW EXPORT / DOWNLOAD
              ================================================= */}

          <div className="workflow-download-section">

            <div className="workflow-download-info">

              <span className="download-label">
                WORKFLOW EXPORT
              </span>

              <h3>
                Download Workflow
              </h3>

            </div>


            <button
              className="workflow-download-btn"
              onClick={
                handleDownloadWorkflow
              }
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

              <span>
                Download
              </span>

            </button>

          </div>


          {/* EXECUTION HISTORY */}

          {executionHistory.length > 0 && (

            <section className="execution-history">

              <div className="execution-history-header">

                <div>

                  <p className="inspector-label">
                    EXECUTION HISTORY
                  </p>

                  <h3>
                    Workflow Runs
                  </h3>

                </div>


                <span>
                  {executionHistory.length}{" "}
                  run
                  {executionHistory.length >
                  1
                    ? "s"
                    : ""}
                </span>

              </div>


              <div className="execution-history-list">

                {executionHistory.map(
                  (
                    execution,
                    index
                  ) => (

                    <div
                      className="execution-history-card"
                      key={
                        execution.id
                      }
                    >

                      <div className="execution-card-header">

                        <div>

                          <h4>
                            Run #
                            {
                              executionHistory.length -
                              index
                            }
                          </h4>

                          <p>
                            {
                              execution.workflowName
                            }
                          </p>

                        </div>


                        <span
                          className={`history-status history-${execution.status}`}
                        >
                          {
                            execution.status
                          }
                        </span>

                      </div>


                      <div className="execution-times">

                        <span>
                          Started:{" "}
                          {
                            execution.startedAt
                          }
                        </span>


                        {execution.completedAt && (

                          <span>
                            Completed:{" "}
                            {
                              execution.completedAt
                            }
                          </span>

                        )}

                      </div>


                      <div className="execution-step-list">

                        {execution.steps.map(
                          (step) => (

                            <div
                              className="execution-history-step"
                              key={
                                step.stepId
                              }
                            >

                              <span>
                                {step.status ===
                                "success"
                                  ? "✓"
                                  : step.status ===
                                    "running"
                                  ? "●"
                                  : "○"}
                              </span>


                              <span>
                                {
                                  step.stepName
                                }
                              </span>


                              <small>
                                {
                                  step.status
                                }
                              </small>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>

          )}

        </>

      )}

    </section>
  );
}

export default WorkflowBuilder;