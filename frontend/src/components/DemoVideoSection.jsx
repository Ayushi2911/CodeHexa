import { useState, useEffect, useRef } from "react";

function DemoVideoSection({ onOpenBuilder }) {
  // Timeline step (0 to 34)
  const [timelineStep, setTimelineStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isClicking, setIsClicking] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);

  // Auto-hide controls overlay
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shellRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  // Dynamic typing states (character-by-character)
  const [projectName, setProjectName] = useState("");
  const [requirementText, setRequirementText] = useState("");
  const [agentEditText, setAgentEditText] = useState("");

  // Inspector & Modal States
  const [activeInspector, setActiveInspector] = useState(null); // "invoice" | "inventory" | "proposal" | "logs"
  const [workflowNodesCount, setWorkflowNodesCount] = useState(0); // 0 to 5
  const [hasApprovalNode, setHasApprovalNode] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState("DRAFT");
  const [workflowVersion, setWorkflowVersion] = useState("v1.0");
  const [executingStep, setExecutingStep] = useState(-1);
  const [conditionChecked, setConditionChecked] = useState(false);

  // Cursor coordinates (% within simulator canvas)
  const [cursor, setCursor] = useState({ x: 50, y: 15, visible: true });

  const timerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const TOTAL_STEPS = 34;

  const fullProjectName = "sample-flow";
  const fullRequirementText =
    "When an order is placed, notify the vendor, create an invoice, update inventory, then send a confirmation to the customer.";
  const fullAgentEditText = "Add an approval step before Send Confirmation";

  const stepTitles = [
    "Navigating to Workflow Studio",
    "Selecting Project Name field",
    "Rapid typing: sample-flow",
    "Selecting Business Requirement input",
    "Typing business requirement...",
    "Hovering over Generate Workflow",
    "CLICK: Generate Workflow initiated",
    "Analyzing requirement & loading schemas...",
    "Matching functions & building workflow graph...",
    "Workflow builds: Order Created trigger appears",
    "Connector travels → Notify Vendor appears",
    "Connector travels → Create Invoice appears",
    "Connector travels → Update Inventory appears",
    "Connector travels → Send Confirmation appears",
    "Clicking Create Invoice node",
    "Inspecting input mapping: {{step-001.vendorId}}",
    "Closing Create Invoice inspector",
    "Clicking Update Inventory node",
    "Inspecting runtime condition: stock_type == physical",
    "Closing Update Inventory inspector",
    "Selecting AI Agent Command box",
    "Typing: Add an approval step before Send Confirmation",
    "Generating AI modification...",
    "Proposed Change preview: + Add Approval Step",
    "CLICK: Approve Change button pressed",
    "Workflow reconnects with Approval step (v2 Draft)",
    "Validating workflow graph...",
    "Static checks passed → Workflow Valid ✓",
    "Publishing workflow → Status: PUBLISHED ✓",
    "Configuring test payload: stock_type = physical",
    "CLICK: Run Workflow initiated",
    "Live Execution: Step-by-step green pulse flow...",
    "Workflow Completed Successfully ✓",
    "Viewing Execution History & Traceable Logs",
    "CodeHexa Flow: From Intent to Executable Graph",
  ];

  // Auto-hide controls when user is inactive
  const handleUserActivity = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2800);
  };

  const handleContainerLeave = () => {
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 800);
  };

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (shellRef.current?.requestFullscreen) {
        shellRef.current.requestFullscreen();
      } else if (shellRef.current?.webkitRequestFullscreen) {
        shellRef.current.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // 1. Master Timeline Progression Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const stepDurations = [
      1000, // 0: enter nav
      700,  // 1: click project field
      1000, // 2: type project
      700,  // 3: click req field
      2000, // 4: type req
      500,  // 5: hover generate
      700,  // 6: click generate
      800,  // 7: analysis 1
      800,  // 8: analysis 2
      500,  // 9: node 1
      500,  // 10: node 2
      500,  // 11: node 3
      500,  // 12: node 4
      500,  // 13: node 5
      700,  // 14: click node invoice
      1300, // 15: inspect mapping
      600,  // 16: close inspector
      700,  // 17: click node inventory
      1100, // 18: inspect condition
      600,  // 19: close inspector
      700,  // 20: click agent edit
      1500, // 21: type agent prompt
      800,  // 22: click agent submit
      1200, // 23: view proposal
      800,  // 24: click approve
      800,  // 25: reconnect v2
      800,  // 26: validate
      800,  // 27: valid check
      1000, // 28: publish v2
      800,  // 29: payload ready
      700,  // 30: click run
      2800, // 31: live exec pulse
      1000, // 32: exec complete
      2000, // 33: open logs & view
      3800, // 34: outro summary
    ];

    const currentDuration = (stepDurations[timelineStep] || 1000) / playbackSpeed;

    const clickSteps = [0, 1, 3, 6, 14, 16, 17, 19, 20, 22, 24, 26, 28, 30, 33];
    if (clickSteps.includes(timelineStep)) {
      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 260);
    }

    timerRef.current = setTimeout(() => {
      setTimelineStep((prev) => (prev + 1) % (TOTAL_STEPS + 1));
    }, currentDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timelineStep, isPlaying, playbackSpeed]);

  // 2. Character-by-Character Smooth Typing Engine
  useEffect(() => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    if (timelineStep === 2) {
      let charIdx = 0;
      setProjectName("");
      typingTimerRef.current = setInterval(() => {
        charIdx++;
        setProjectName(fullProjectName.slice(0, charIdx));
        if (charIdx >= fullProjectName.length) {
          clearInterval(typingTimerRef.current);
        }
      }, 35 / playbackSpeed);
    } else if (timelineStep === 4) {
      let charIdx = 0;
      setRequirementText("");
      typingTimerRef.current = setInterval(() => {
        charIdx += 2;
        setRequirementText(fullRequirementText.slice(0, charIdx));
        if (charIdx >= fullRequirementText.length) {
          setRequirementText(fullRequirementText);
          clearInterval(typingTimerRef.current);
        }
      }, 25 / playbackSpeed);
    } else if (timelineStep === 21) {
      let charIdx = 0;
      setAgentEditText("");
      typingTimerRef.current = setInterval(() => {
        charIdx += 2;
        setAgentEditText(fullAgentEditText.slice(0, charIdx));
        if (charIdx >= fullAgentEditText.length) {
          setAgentEditText(fullAgentEditText);
          clearInterval(typingTimerRef.current);
        }
      }, 30 / playbackSpeed);
    }

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [timelineStep, playbackSpeed]);

  // 3. Coordinate Tracking & UI Synchronization
  useEffect(() => {
    switch (timelineStep) {
      case 0:
        setCursor({ x: 38, y: 14, visible: true });
        setHoveredElement("nav-studio");
        setProjectName("");
        setRequirementText("");
        setAgentEditText("");
        setActiveInspector(null);
        setWorkflowNodesCount(0);
        setHasApprovalNode(false);
        setWorkflowStatus("DRAFT");
        setWorkflowVersion("v1.0");
        setExecutingStep(-1);
        setConditionChecked(false);
        break;

      case 1:
        setCursor({ x: 20, y: 32, visible: true });
        setHoveredElement("project-field");
        break;

      case 2:
        setCursor({ x: 26, y: 32, visible: true });
        setHoveredElement("project-field");
        break;

      case 3:
        setCursor({ x: 32, y: 44, visible: true });
        setHoveredElement("req-field");
        break;

      case 4:
        setCursor({ x: 62, y: 48, visible: true });
        setHoveredElement("req-field");
        break;

      case 5:
        setCursor({ x: 78, y: 58, visible: true });
        setHoveredElement("btn-generate");
        break;

      case 6:
        setCursor({ x: 78, y: 58, visible: true });
        setHoveredElement("btn-generate");
        break;

      case 7:
      case 8:
        setCursor({ x: 50, y: 50, visible: true });
        setHoveredElement(null);
        break;

      case 9:
        setWorkflowNodesCount(1);
        setCursor({ x: 16, y: 46, visible: true });
        setHoveredElement("node-1");
        break;

      case 10:
        setWorkflowNodesCount(2);
        setCursor({ x: 34, y: 46, visible: true });
        setHoveredElement("node-2");
        break;

      case 11:
        setWorkflowNodesCount(3);
        setCursor({ x: 52, y: 46, visible: true });
        setHoveredElement("node-3");
        break;

      case 12:
        setWorkflowNodesCount(4);
        setCursor({ x: 70, y: 46, visible: true });
        setHoveredElement("node-4");
        break;

      case 13:
        setWorkflowNodesCount(5);
        setCursor({ x: 88, y: 46, visible: true });
        setHoveredElement("node-5");
        break;

      case 14:
        setCursor({ x: 52, y: 46, visible: true });
        setHoveredElement("node-invoice");
        setActiveInspector("invoice");
        break;

      case 15:
        setCursor({ x: 60, y: 50, visible: true });
        setHoveredElement("mapping-vendor");
        break;

      case 16:
        setCursor({ x: 74, y: 24, visible: true });
        setHoveredElement("modal-close");
        setActiveInspector(null);
        break;

      case 17:
        setCursor({ x: 70, y: 46, visible: true });
        setHoveredElement("node-inventory");
        setActiveInspector("inventory");
        break;

      case 18:
        setCursor({ x: 56, y: 44, visible: true });
        setHoveredElement("condition-box");
        break;

      case 19:
        setCursor({ x: 74, y: 24, visible: true });
        setHoveredElement("modal-close");
        setActiveInspector(null);
        break;

      case 20:
        setCursor({ x: 28, y: 76, visible: true });
        setHoveredElement("agent-input");
        break;

      case 21:
        setCursor({ x: 50, y: 76, visible: true });
        setHoveredElement("agent-input");
        break;

      case 22:
        setCursor({ x: 80, y: 76, visible: true });
        setHoveredElement("btn-agent-submit");
        break;

      case 23:
        setCursor({ x: 50, y: 52, visible: true });
        setHoveredElement(null);
        setActiveInspector("proposal");
        break;

      case 24:
        setCursor({ x: 66, y: 70, visible: true });
        setHoveredElement("btn-approve");
        break;

      case 25:
        setActiveInspector(null);
        setHasApprovalNode(true);
        setWorkflowVersion("v2.0 (Draft)");
        setCursor({ x: 50, y: 48, visible: true });
        setHoveredElement(null);
        break;

      case 26:
        setCursor({ x: 68, y: 20, visible: true });
        setHoveredElement("btn-validate");
        break;

      case 27:
        setCursor({ x: 68, y: 20, visible: true });
        setHoveredElement("btn-validate");
        break;

      case 28:
        setCursor({ x: 83, y: 20, visible: true });
        setHoveredElement("btn-publish");
        setWorkflowStatus("PUBLISHED");
        setWorkflowVersion("v2.0 (Live)");
        break;

      case 29:
        setCursor({ x: 20, y: 86, visible: true });
        setHoveredElement("payload-box");
        break;

      case 30:
        setCursor({ x: 86, y: 86, visible: true });
        setHoveredElement("btn-run");
        break;

      case 31:
        setCursor({ x: 50, y: 46, visible: false });
        setHoveredElement(null);
        setExecutingStep(1);
        setTimeout(() => setExecutingStep(2), 400);
        setTimeout(() => {
          setExecutingStep(3);
          setConditionChecked(true);
        }, 900);
        setTimeout(() => setExecutingStep(4), 1400);
        setTimeout(() => setExecutingStep(5), 1900);
        break;

      case 32:
        setExecutingStep(6);
        setCursor({ x: 50, y: 82, visible: true });
        setHoveredElement(null);
        break;

      case 33:
        setCursor({ x: 22, y: 20, visible: true });
        setHoveredElement("btn-logs");
        setActiveInspector("logs");
        break;

      case 34:
        setActiveInspector(null);
        setCursor({ x: 50, y: 86, visible: true });
        setHoveredElement("btn-cta-studio");
        break;

      default:
        break;
    }
  }, [timelineStep]);

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const restart = () => {
    setTimelineStep(0);
    setIsPlaying(true);
  };

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetStep = Math.round(pct * TOTAL_STEPS);
    setTimelineStep(targetStep);
  };

  return (
    <section className="demo-section" id="demo">
      <div className="demo-header">
        <div className="features-eyebrow">
          <span className="features-eyebrow-dot" />
          SEE IT IN ACTION
        </div>

        <h2>See CodeHexa Flow in Action</h2>

        <p className="demo-subtitle">
          Watch a natural-language business requirement become a context-aware, validated, editable and executable workflow.
        </p>
      </div>

      <div
        ref={shellRef}
        className={`real-simulator-shell ${isFullscreen ? "is-fullscreen" : ""}`}
        onMouseMove={handleUserActivity}
        onMouseEnter={handleUserActivity}
        onMouseLeave={handleContainerLeave}
        onClick={handleUserActivity}
      >
        {/* Browser Top Bar */}
        <div className="simulator-browser-bar">
          <div className="simulator-window-dots">
            <span className="sim-dot sim-dot-red" />
            <span className="sim-dot sim-dot-yellow" />
            <span className="sim-dot sim-dot-green" />
          </div>

          <div className="simulator-url-bar">
            <span className="url-lock">🔒</span>
            <span className="url-text">https://app.codehexa.com/studio/sample-flow</span>
          </div>

          <div className="simulator-header-badges">
            <span className={workflowStatus === "PUBLISHED" ? "sim-status-tag tag-published" : "sim-status-tag tag-draft"}>
              {workflowStatus === "PUBLISHED" ? "● PUBLISHED (v2.0)" : "○ DRAFT (v1.0)"}
            </span>
          </div>
        </div>

        {/* Live Interaction Stage */}
        <div className="simulator-stage-canvas">
          {/* REAL VISIBLE MOUSE CURSOR */}
          {cursor.visible && (
            <div
              className={isClicking ? "sim-mouse-cursor cursor-clicking" : "sim-mouse-cursor"}
              style={{
                left: cursor.x + "%",
                top: cursor.y + "%",
              }}
            >
              <svg className="cursor-arrow-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.88c.45 0 .67-.54.35-.85L5.85 2.86a.5.5 0 0 0-.35.35z"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              </svg>
              {isClicking && <span className="cursor-click-ripple" />}
            </div>
          )}

          {/* Simulator Navigation Bar */}
          <div className="sim-navbar">
            <div className="sim-brand">✦ CodeHexa<span>Flow</span></div>
            <div className="sim-nav-links">
              <span className="sim-nav-link">Home</span>
              <span className={timelineStep === 0 ? "sim-nav-link active-sim-link hovered-nav" : "sim-nav-link active-sim-link"}>
                Workflow Studio
              </span>
              <span className="sim-nav-link">Templates</span>
              <span className="sim-nav-link">History</span>
            </div>
            <div className="sim-nav-actions">
              <span className="sim-badge-engine">Qwen Engine</span>
            </div>
          </div>

          {/* Simulator Body */}
          <div className="sim-studio-body">
            {/* Top Config Row */}
            <div className="sim-studio-toolbar">
              <div className="sim-project-input-group">
                <label>PROJECT NAME</label>
                <div className={timelineStep === 1 || timelineStep === 2 ? "sim-input-box focused-field" : "sim-input-box"}>
                  <span>{projectName || (timelineStep >= 1 ? "" : "Enter project...")}</span>
                  {(timelineStep === 1 || timelineStep === 2) && <span className="blinking-cursor">|</span>}
                </div>
              </div>

              <div className="sim-toolbar-actions">
                <button
                  type="button"
                  className={timelineStep === 26 ? "sim-tool-btn btn-active-click" : (hoveredElement === "btn-validate" ? "sim-tool-btn hovered-tool-btn" : "sim-tool-btn")}
                >
                  ✓ Validate Workflow
                </button>
                <button
                  type="button"
                  className={timelineStep === 28 ? "sim-tool-btn sim-btn-publish btn-active-click" : (hoveredElement === "btn-publish" ? "sim-tool-btn sim-btn-publish hovered-tool-btn" : "sim-tool-btn sim-btn-publish")}
                >
                  🚀 Publish Workflow
                </button>
              </div>
            </div>

            {/* Requirement Input Box (Steps 3 to 8) */}
            {timelineStep <= 8 && (
              <div className="sim-requirement-card">
                <label>NATURAL LANGUAGE BUSINESS REQUIREMENT</label>
                <div className={timelineStep === 3 || timelineStep === 4 ? "sim-textarea focused-field" : "sim-textarea"}>
                  {requirementText || (timelineStep >= 3 ? "" : "Describe your workflow here...")}
                  {(timelineStep === 3 || timelineStep === 4) && <span className="blinking-cursor">|</span>}
                </div>

                <div className="sim-req-actions">
                  <button
                    type="button"
                    className={timelineStep === 6 ? "primary-btn sim-generate-btn btn-active-click" : (hoveredElement === "btn-generate" ? "primary-btn sim-generate-btn hovered-tool-btn" : "primary-btn sim-generate-btn")}
                  >
                    <span>✦</span> Generate Workflow →
                  </button>
                </div>

                {timelineStep >= 7 && timelineStep <= 8 && (
                  <div className="sim-processing-hud">
                    <div className="sim-hud-title">
                      <span className="spinner-small" /> Analyzing Business Intent & Project Context...
                    </div>
                    <div className="sim-hud-checks">
                      <span className="hud-check">✓ Understanding requirement</span>
                      <span className="hud-check">✓ Loading project context</span>
                      <span className="hud-check">✓ Matching functions & schemas</span>
                      <span className="hud-check">✓ Building workflow graph</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visual Workflow Canvas (Steps 9 to 33) */}
            {timelineStep >= 9 && timelineStep <= 33 && (
              <div className="sim-graph-canvas">
                <div className="sim-canvas-header">
                  <div className="canvas-title">
                    <strong>OrderPlaced Workflow</strong>
                    <small>{workflowVersion}</small>
                  </div>
                  <div className="canvas-pills">
                    {timelineStep >= 27 && <span className="pill-valid">✓ Workflow Valid</span>}
                    {timelineStep >= 25 && <span className="pill-modified">Draft v2 Applied</span>}
                  </div>
                </div>

                {/* Nodes Sequence */}
                <div className="sim-nodes-row">
                  {workflowNodesCount >= 1 && (
                    <div className={executingStep >= 1 ? "sim-node trigger-node exec-success" : "sim-node trigger-node"}>
                      <span className="node-kind">TRIGGER</span>
                      <div className="node-name">⚡ Order Created</div>
                      <small>order.created</small>
                    </div>
                  )}

                  {workflowNodesCount >= 2 && <span className="sim-arrow">➔</span>}

                  {workflowNodesCount >= 2 && (
                    <div className={executingStep >= 2 ? "sim-node fn-node exec-success" : (executingStep === 1 ? "sim-node fn-node exec-running" : "sim-node fn-node")}>
                      <span className="node-kind">FUNCTION</span>
                      <div className="node-name">✉️ Notify Vendor</div>
                      <small>sendVendorNotification()</small>
                      {executingStep >= 2 && <span className="node-check-pill">✓</span>}
                    </div>
                  )}

                  {workflowNodesCount >= 3 && <span className="sim-arrow">➔</span>}

                  {workflowNodesCount >= 3 && (
                    <div className={activeInspector === "invoice" || hoveredElement === "node-invoice" ? "sim-node form-node inspected-node" : (executingStep >= 3 ? "sim-node form-node exec-success" : (executingStep === 2 ? "sim-node form-node exec-running" : "sim-node form-node"))}>
                      <span className="node-kind">FORM CREATE</span>
                      <div className="node-name">📄 Create Invoice</div>
                      <small>invoices.insert()</small>
                      {executingStep >= 3 && <span className="node-check-pill">✓</span>}
                    </div>
                  )}

                  {workflowNodesCount >= 4 && <span className="sim-arrow">➔</span>}

                  {workflowNodesCount >= 4 && (
                    <div className={activeInspector === "inventory" || hoveredElement === "node-inventory" ? "sim-node op-node inspected-node" : (executingStep >= 4 ? "sim-node op-node exec-success" : (executingStep === 3 ? "sim-node op-node exec-running" : "sim-node op-node"))}>
                      <span className="node-kind">OPERATION</span>
                      <div className="node-name">📦 Update Inventory</div>
                      <small>inventory.decrement()</small>
                      {conditionChecked && <span className="node-cond-pill">Condition: True ✓</span>}
                      {executingStep >= 4 && <span className="node-check-pill">✓</span>}
                    </div>
                  )}

                  {hasApprovalNode && (
                    <>
                      <span className="sim-arrow">➔</span>
                      <div className={executingStep >= 5 ? "sim-node approval-node exec-success" : (executingStep === 4 ? "sim-node approval-node exec-running" : "sim-node approval-node")}>
                        <span className="node-kind tag-approval">APPROVAL GATE</span>
                        <div className="node-name">🛡️ Manager Approval</div>
                        <small>auto-rule-gate()</small>
                        {executingStep >= 5 && <span className="node-check-pill">✓</span>}
                      </div>
                    </>
                  )}

                  {workflowNodesCount >= 5 && <span className="sim-arrow">➔</span>}

                  {workflowNodesCount >= 5 && (
                    <div className={executingStep >= 5 ? "sim-node fn-node exec-success" : "sim-node fn-node"}>
                      <span className="node-kind">FUNCTION</span>
                      <div className="node-name">✓ Send Confirmation</div>
                      <small>customerEmail.send()</small>
                      {executingStep >= 5 && <span className="node-check-pill">✓</span>}
                    </div>
                  )}
                </div>

                {/* AI Agent Command Bar */}
                <div className="sim-agent-command-bar">
                  <span className="agent-tag">✦ AI AGENT</span>
                  <div className={timelineStep === 20 || timelineStep === 21 ? "sim-agent-input focused-field" : "sim-agent-input"}>
                    {agentEditText || (timelineStep >= 20 ? "" : "Tell the AI agent what to change in the workflow...")}
                    {(timelineStep === 20 || timelineStep === 21) && <span className="blinking-cursor">|</span>}
                  </div>
                  <button
                    type="button"
                    className={timelineStep === 22 ? "sim-agent-submit-btn btn-active-click" : (hoveredElement === "btn-agent-submit" ? "sim-agent-submit-btn hovered-tool-btn" : "sim-agent-submit-btn")}
                  >
                    Generate Change
                  </button>
                </div>
              </div>
            )}

            {/* Test Payload Bar (Steps 29 to 32) */}
            {timelineStep >= 29 && timelineStep <= 32 && (
              <div className="sim-execution-bar">
                <div className="sim-payload-preview">
                  <label>TEST PAYLOAD (INPUT)</label>
                  <code>{'{ "orderId": "ORD-9281", "stock_type": "physical", "totalAmount": 249.00 }'}</code>
                </div>

                <button
                  type="button"
                  className={timelineStep === 30 ? "primary-btn sim-run-btn btn-active-click" : (hoveredElement === "btn-run" ? "primary-btn sim-run-btn hovered-tool-btn" : "primary-btn sim-run-btn")}
                >
                  ▶ Run Workflow
                </button>

                {executingStep === 6 && (
                  <span className="sim-exec-success-pill">
                    ✓ Workflow Completed Successfully (227ms)
                  </span>
                )}
              </div>
            )}

            {/* Modal: Create Invoice Mapping */}
            {activeInspector === "invoice" && (
              <div className="sim-inspector-modal">
                <div className="sim-inspector-header">
                  <div>
                    <span className="badge-type">STEP CONFIGURATION</span>
                    <h4>Create Invoice Step (Inspector)</h4>
                  </div>
                  <button className="sim-close-x" type="button">✕</button>
                </div>

                <div className="sim-mapping-list">
                  <div className="sim-map-row">
                    <label>order_id:</label>
                    <code>{"{{trigger._id}}"}</code>
                  </div>
                  <div className="sim-map-row highlighted-map-row">
                    <label>vendor_id:</label>
                    <code className="glow-code">{"{{step-001.vendorId}}"}</code>
                    <span className="sim-reuse-tag">From Notify Vendor Step</span>
                  </div>
                  <div className="sim-map-row">
                    <label>amount:</label>
                    <code>{"{{trigger.totalAmount}}"}</code>
                  </div>
                </div>

                <div className="sim-inspector-footer">
                  <small>“Outputs from previous steps automatically become inputs to the next.”</small>
                </div>
              </div>
            )}

            {/* Modal: Update Inventory Condition */}
            {activeInspector === "inventory" && (
              <div className="sim-inspector-modal">
                <div className="sim-inspector-header">
                  <div>
                    <span className="badge-type">RUNTIME CONDITION</span>
                    <h4>Update Inventory Step</h4>
                  </div>
                  <button className="sim-close-x" type="button">✕</button>
                </div>

                <div className="sim-condition-preview">
                  <label>EVALUATED AT RUNTIME:</label>
                  <div className="condition-rule-card">
                    <code>stock_type == &quot;physical&quot;</code>
                  </div>
                  <p>When stock_type is physical, inventory is decremented. If digital, the step is safely skipped.</p>
                </div>
              </div>
            )}

            {/* Modal: Proposed Changes */}
            {activeInspector === "proposal" && (
              <div className="sim-inspector-modal proposal-box">
                <div className="sim-inspector-header">
                  <div>
                    <span className="proposal-badge">PROPOSED CHANGE (HUMAN-IN-THE-LOOP)</span>
                    <h4>+ Add Approval Step before Send Confirmation</h4>
                  </div>
                </div>

                <div className="sim-proposal-diff">
                  <div className="diff-box">
                    <span>Before (v1)</span>
                    <p>Update Inventory → Send Confirmation</p>
                  </div>
                  <span className="diff-arrow">➔</span>
                  <div className="diff-box diff-box-after">
                    <span>After (v2 Draft)</span>
                    <p>Update Inventory → <strong>[Approval Gate]</strong> → Send Confirmation</p>
                  </div>
                </div>

                <div className="sim-proposal-actions">
                  <button className="reject-btn" type="button">Reject</button>
                  <button className={timelineStep === 24 ? "approve-btn btn-active-click" : (hoveredElement === "btn-approve" ? "approve-btn hovered-tool-btn" : "approve-btn")} type="button">
                    ✓ Approve Change
                  </button>
                  <span className="human-control-quote">“AI proposes. The user stays in control.”</span>
                </div>
              </div>
            )}

            {/* Modal: Run Logs */}
            {activeInspector === "logs" && (
              <div className="sim-inspector-modal logs-modal">
                <div className="sim-inspector-header">
                  <div>
                    <span className="badge-type">RUN TRACE #1042</span>
                    <h4>Execution History & Traceable Outputs</h4>
                  </div>
                  <button className="sim-close-x" type="button">✕</button>
                </div>

                <div className="sim-logs-table">
                  <div className="sim-log-item success">
                    <span>✓</span> <strong>Notify Vendor</strong> <small>42ms</small>
                    <code>{'{ vendorId: "VEND-402", notified: true }'}</code>
                  </div>
                  <div className="sim-log-item success expanded">
                    <span>✓</span> <strong>Create Invoice</strong> <small>78ms</small>
                    <code>{'{ invoiceId: "INV-8891", amount: 249.00 }'}</code>
                  </div>
                  <div className="sim-log-item success">
                    <span>✓</span> <strong>Update Inventory</strong> <small>35ms</small>
                    <code>{'condition: physical == physical (True)'}</code>
                  </div>
                  <div className="sim-log-item success">
                    <span>✓</span> <strong>Manager Approval</strong> <small>12ms</small>
                    <code>{'approvedBy: "auto-policy-rules"'}</code>
                  </div>
                  <div className="sim-log-item success">
                    <span>✓</span> <strong>Send Confirmation</strong> <small>60ms</small>
                    <code>{'deliveredTo: "customer@example.com"'}</code>
                  </div>
                </div>
              </div>
            )}

            {/* Outro Summary (Step 34) */}
            {timelineStep === 34 && (
              <div className="sim-outro-card">
                <div className="journey-track">
                  <span>DESCRIBE</span> <i>➔</i>
                  <span>GENERATE</span> <i>➔</i>
                  <span>EDIT</span> <i>➔</i>
                  <span>VALIDATE</span> <i>➔</i>
                  <span>PUBLISH</span> <i>➔</i>
                  <span>EXECUTE</span>
                </div>

                <h2>CodeHexa<span>Flow</span></h2>
                <p>From Business Intent to Executable Workflow.</p>

                <button
                  className="primary-btn sim-cta-studio-btn"
                  onClick={onOpenBuilder}
                  type="button"
                >
                  ✦ Open Workflow Studio →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating Glassmorphic Video Controls Overlay (Auto-Hides) */}
        <div className={`demo-floating-controls-overlay ${showControls ? "controls-visible" : ""}`}>
          {/* Clickable Seek Scrub Bar */}
          <div className="video-seek-bar-track" onClick={handleScrub}>
            <div
              className="video-seek-bar-progress"
              style={{ width: ((timelineStep + 1) / (TOTAL_STEPS + 1)) * 100 + "%" }}
            >
              <span className="seek-thumb-handle" />
            </div>
          </div>

          <div className="video-controls-row">
            {/* Left Controls: Play/Pause, Restart, Action Counter */}
            <div className="video-ctrls-left">
              <button
                className="video-ctrl-btn main-play-btn"
                onClick={togglePlay}
                type="button"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              <button
                className="video-ctrl-btn restart-ctrl-btn"
                onClick={restart}
                type="button"
                title="Restart from beginning"
              >
                ↺
              </button>

              <div className="video-step-pill">
                <span className="pill-dot" />
                <span>Action {timelineStep + 1}/{TOTAL_STEPS + 1}: <strong>{stepTitles[timelineStep]}</strong></span>
              </div>
            </div>

            {/* Right Controls: Speed Selector & Fullscreen */}
            <div className="video-ctrls-right">
              <div className="video-speed-group">
                <button
                  className={`speed-pill ${playbackSpeed === 1 ? "active-speed" : ""}`}
                  onClick={() => setPlaybackSpeed(1)}
                  type="button"
                >
                  1x
                </button>
                <button
                  className={`speed-pill ${playbackSpeed === 1.5 ? "active-speed" : ""}`}
                  onClick={() => setPlaybackSpeed(1.5)}
                  type="button"
                >
                  1.5x
                </button>
                <button
                  className={`speed-pill ${playbackSpeed === 2 ? "active-speed" : ""}`}
                  onClick={() => setPlaybackSpeed(2)}
                  type="button"
                >
                  2x
                </button>
              </div>

              <button
                className="video-ctrl-btn fullscreen-btn"
                onClick={toggleFullscreen}
                type="button"
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Watch Fullscreen"}
              >
                {isFullscreen ? "✕ Exit" : "⛶ Fullscreen"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DemoVideoSection;
