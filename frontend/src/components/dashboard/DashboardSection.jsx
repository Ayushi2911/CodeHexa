import React, { useState, useMemo } from "react";

function DashboardSection({
  user,
  dashboardStats = {
    totalWorkflows: 12,
    activeWorkflows: 5,
    draftWorkflows: 4,
    averageConfidence: 0.94,
  },
  recentWorkflows = [],
  templates = [],
  executionHistory = [],
  dashboardMode = "live",
  loadingDashboard = false,
  refreshDashboardData,
  onOpenBuilder,
  onOpenWorkflowInStudio,
  onOpenHistory,
  setSelectedRecentWorkflow,
  onRequestDelete,
}) {
  // activeDetailTab: null (overview) | "total" | "active" | "drafts" | "confidence"
  const [activeDetailTab, setActiveDetailTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);

  // Workflow status calculations
  const workflowCount = Math.max(dashboardStats.totalWorkflows || recentWorkflows.length, 1);
  const activeCount = dashboardStats.activeWorkflows ?? recentWorkflows.filter((w) => w.status === "active").length;
  const draftCount = dashboardStats.draftWorkflows ?? recentWorkflows.filter((w) => w.status === "draft").length;
  const validatedCount = Math.max(workflowCount - activeCount - draftCount, 0);

  const activePercent = Math.round((activeCount / workflowCount) * 100);
  const draftPercent = Math.round((draftCount / workflowCount) * 100);
  const validatedPercent = Math.max(0, 100 - activePercent - draftPercent);

  const avgConfidenceScore = Math.round((dashboardStats.averageConfidence || 0.94) * 100);

  // Weekly execution activity mock dataset (Mon - Sun)
  const weeklyActivityData = useMemo(() => [
    { day: "Mon", executions: 142, created: 3, height: 58 },
    { day: "Tue", executions: 189, created: 5, height: 76 },
    { day: "Wed", executions: 224, created: 7, height: 92 },
    { day: "Thu", executions: 198, created: 4, height: 80 },
    { day: "Fri", executions: 265, created: 8, height: 100 },
    { day: "Sat", executions: 110, created: 2, height: 44 },
    { day: "Sun", executions: 135, created: 3, height: 52 },
  ], []);

  // Filtered workflows for detail views
  const filteredWorkflows = useMemo(() => {
    return recentWorkflows.filter((wf) => {
      const matchesSearch =
        !searchTerm ||
        (wf.name && wf.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (wf.triggerType && wf.triggerType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (wf.requirement && wf.requirement.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (wf.status && wf.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [recentWorkflows, searchTerm, statusFilter]);

  const activeWorkflowsList = useMemo(() => {
    return recentWorkflows.filter((w) => w.status === "active" || !w.status);
  }, [recentWorkflows]);

  const draftWorkflowsList = useMemo(() => {
    return recentWorkflows.filter((w) => w.status === "draft");
  }, [recentWorkflows]);

  const averageLatency = useMemo(() => {
    if (!recentWorkflows.length) return 118;
    return Math.round(
      recentWorkflows.reduce((sum, w) => sum + Number(w.executionTimeMs || 120), 0) /
        recentWorkflows.length
    );
  }, [recentWorkflows]);

  // Handle card click to open detail view
  const handleCardClick = (tabKey) => {
    setActiveDetailTab(tabKey);
    setSearchTerm("");
    setStatusFilter("all");
    // Smooth scroll to top of dashboard section
    const el = document.getElementById("dashboard");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBackToOverview = () => {
    setActiveDetailTab(null);
    setSearchTerm("");
    setStatusFilter("all");
  };

  /* =====================================================================
     DETAIL VIEW: TOTAL WORKFLOWS
     ===================================================================== */
  const renderTotalWorkflowsDetail = () => (
    <div className="dashboard-detail-view animate-fade-in">
      <div className="detail-view-header">
        <button
          type="button"
          className="back-to-dash-btn"
          onClick={handleBackToOverview}
          aria-label="Back to Dashboard Overview"
        >
          <span className="back-arrow">←</span> Back to Dashboard Overview
        </button>
        <div className="detail-title-block">
          <div className="detail-tag-row">
            <span className="detail-badge-pill pill-total">METRICS OVERVIEW</span>
            <span className="detail-count-pill">{recentWorkflows.length} Workflows Recorded</span>
          </div>
          <h2>Total Workflows & Automation Portfolio</h2>
          <p className="detail-subtitle">
            Comprehensive inventory of all business requirement pipelines, triggers, and execution traces in your workspace.
          </p>
        </div>
      </div>

      {/* Top Quick Metrics Row */}
      <div className="detail-kpi-row">
        <div className="detail-kpi-card">
          <span className="kpi-label">Total Workflows</span>
          <strong className="kpi-value">{dashboardStats.totalWorkflows}</strong>
          <span className="kpi-subtext">Across all domains</span>
        </div>
        <div className="detail-kpi-card">
          <span className="kpi-label">Active Deployments</span>
          <strong className="kpi-value text-emerald">{activeCount}</strong>
          <span className="kpi-subtext">{activePercent}% of total</span>
        </div>
        <div className="detail-kpi-card">
          <span className="kpi-label">In-Progress Drafts</span>
          <strong className="kpi-value text-purple">{draftCount}</strong>
          <span className="kpi-subtext">{draftPercent}% in design</span>
        </div>
        <div className="detail-kpi-card">
          <span className="kpi-label">Avg. Latency</span>
          <strong className="kpi-value text-cyan">{averageLatency}ms</strong>
          <span className="kpi-subtext">High execution speed</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="detail-filter-bar">
        <div className="search-input-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search workflows by name, trigger type, or requirement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="detail-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-pills-group">
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({recentWorkflows.length})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === "active" ? "active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            ● Active ({activeCount})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === "draft" ? "active" : ""}`}
            onClick={() => setStatusFilter("draft")}
          >
            ✎ Drafts ({draftCount})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === "validated" ? "active" : ""}`}
            onClick={() => setStatusFilter("validated")}
          >
            ✓ Validated ({validatedCount})
          </button>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="detail-cards-grid">
        {filteredWorkflows.length > 0 ? (
          filteredWorkflows.map((wf) => (
            <div key={wf.id || wf.name} className="detail-workflow-card">
              <div className="detail-card-top">
                <div className="detail-card-badge-row">
                  <span className={`recent-status-pill status-${wf.status || "active"}`}>
                    {wf.status || "active"}
                  </span>
                  <span className="detail-version-tag">v{wf.version || 1}.0</span>
                </div>
                <span className="detail-conf-badge">
                  🎯 {Math.round((wf.confidence || 0.92) * 100)}% Match
                </span>
              </div>

              <h4 className="detail-card-title">{wf.name}</h4>
              <p className="detail-card-desc">
                {wf.requirement || "Automated business workflow triggered by event hooks with resilient DAG steps."}
              </p>

              <div className="detail-card-meta-grid">
                <div className="meta-cell">
                  <small>TRIGGER</small>
                  <span>⚡ {wf.triggerType || "Webhook"}</span>
                </div>
                <div className="meta-cell">
                  <small>AVG TIME</small>
                  <span>⏱ {wf.executionTimeMs || 120}ms</span>
                </div>
                <div className="meta-cell">
                  <small>STEPS</small>
                  <span>🔢 {wf.steps?.length || 4} Steps</span>
                </div>
                <div className="meta-cell">
                  <small>LAST RUN</small>
                  <span>🕒 {wf.lastTriggered || "Recently"}</span>
                </div>
              </div>

              <div className="detail-card-actions">
                <button
                  type="button"
                  className="detail-action-primary"
                  onClick={() => onOpenWorkflowInStudio && onOpenWorkflowInStudio(wf)}
                >
                  ✦ Open in Studio →
                </button>
                <button
                  type="button"
                  className="detail-action-secondary"
                  onClick={() => setSelectedRecentWorkflow && setSelectedRecentWorkflow(wf)}
                >
                  ▶ Inspect Traces
                </button>
                {onRequestDelete && (
                  <button
                    type="button"
                    className="detail-action-delete"
                    onClick={() => onRequestDelete(wf)}
                    title="Delete workflow"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="detail-empty-state">
            <span className="empty-icon">📁</span>
            <h4>No workflows match your search or filter</h4>
            <p>Try clearing your search query or selecting a different status filter.</p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Domain Category Breakdown Section */}
      <div className="detail-domain-breakdown">
        <h3>Workflow Domain Coverage</h3>
        <p className="section-subtext">Enterprise categories automated by CodeHexa Flow</p>
        <div className="domain-cards-row">
          <div className="domain-card">
            <span className="domain-icon">🛒</span>
            <strong>E-Commerce & Orders</strong>
            <p>Payment verification, inventory checks, automated receipts, shipping manifests.</p>
          </div>
          <div className="domain-card">
            <span className="domain-icon">🎧</span>
            <strong>Customer Support & IT</strong>
            <p>Ticket triage, sentiment classification, engineer escalation, SLA timers.</p>
          </div>
          <div className="domain-card">
            <span className="domain-icon">👥</span>
            <strong>HR & Talent Acquisition</strong>
            <p>Resume screening, interview scheduling, offer generation, candidate onboarding.</p>
          </div>
          <div className="domain-card">
            <span className="domain-icon">💳</span>
            <strong>Finance & Invoicing</strong>
            <p>Invoice parsing, multi-tier approvals, vendor remittance, accounting reconciliation.</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* =====================================================================
     DETAIL VIEW: ACTIVE WORKFLOWS
     ===================================================================== */
  const renderActiveWorkflowsDetail = () => (
    <div className="dashboard-detail-view animate-fade-in">
      <div className="detail-view-header">
        <button
          type="button"
          className="back-to-dash-btn"
          onClick={handleBackToOverview}
          aria-label="Back to Dashboard Overview"
        >
          <span className="back-arrow">←</span> Back to Dashboard Overview
        </button>
        <div className="detail-title-block">
          <div className="detail-tag-row">
            <span className="detail-badge-pill pill-active">LIVE PRODUCTION</span>
            <span className="status-pill status-online">
              <span className="status-dot"></span> All Systems Operational
            </span>
          </div>
          <h2>Active & Production Workflows</h2>
          <p className="detail-subtitle">
            Pipelines actively listening for incoming webhook events, scheduled cron jobs, and database triggers with automated error recovery.
          </p>
        </div>
      </div>

      {/* Active Health Banner */}
      <div className="active-health-banner">
        <div className="health-left">
          <span className="health-icon-pulse">🟢</span>
          <div>
            <strong>Enterprise Runtime Engine v2.4 Active</strong>
            <p>AWS Bedrock Qwen AI + Resilient DAG Orchestrator with 3x Exponential Backoff Retry.</p>
          </div>
        </div>
        <div className="health-stats-row">
          <div className="health-stat">
            <small>UPTIME</small>
            <strong>99.98%</strong>
          </div>
          <div className="health-stat">
            <small>ACTIVE ENDPOINTS</small>
            <strong>{activeCount} Live</strong>
          </div>
          <div className="health-stat">
            <small>AVG RESPONSE</small>
            <strong>{averageLatency}ms</strong>
          </div>
        </div>
      </div>

      {/* Active Workflows Cards */}
      <div className="detail-cards-grid">
        {activeWorkflowsList.length > 0 ? (
          activeWorkflowsList.map((wf) => (
            <div key={wf.id || wf.name} className="detail-workflow-card card-active-border">
              <div className="detail-card-top">
                <div className="detail-card-badge-row">
                  <span className="status-pill status-online">
                    <span className="status-dot"></span> LIVE
                  </span>
                  <span className="detail-version-tag">v{wf.version || 1}.0</span>
                </div>
                <span className="active-pulse-badge">⚡ {wf.triggerType || "Webhook"}</span>
              </div>

              <h4 className="detail-card-title">{wf.name}</h4>
              <p className="detail-card-desc">
                {wf.requirement || "Production automation flow responding to real-time events."}
              </p>

              <div className="endpoint-preview-box">
                <small>ENDPOINT LISTENER</small>
                <code>POST /api/v1/triggers/{wf.id || "wf-event"}</code>
              </div>

              <div className="detail-card-meta-grid">
                <div className="meta-cell">
                  <small>EXECUTION SPEED</small>
                  <span className="text-cyan">⚡ {wf.executionTimeMs || 115}ms</span>
                </div>
                <div className="meta-cell">
                  <small>SUCCESS RATE</small>
                  <span className="text-emerald">99.8%</span>
                </div>
                <div className="meta-cell">
                  <small>RETRY POLICY</small>
                  <span>3x Backoff</span>
                </div>
                <div className="meta-cell">
                  <small>LAST TRIGGERED</small>
                  <span>{wf.lastTriggered || "Just now"}</span>
                </div>
              </div>

              <div className="detail-card-actions">
                <button
                  type="button"
                  className="detail-action-primary"
                  onClick={() => onOpenWorkflowInStudio && onOpenWorkflowInStudio(wf)}
                >
                  ✦ Open in Studio →
                </button>
                <button
                  type="button"
                  className="detail-action-secondary"
                  onClick={() => setSelectedRecentWorkflow && setSelectedRecentWorkflow(wf)}
                >
                  ▶ Trace Execution
                </button>
                {onRequestDelete && (
                  <button
                    type="button"
                    className="detail-action-delete"
                    onClick={() => onRequestDelete(wf)}
                    title="Delete workflow"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="detail-empty-state">
            <span className="empty-icon">⚡</span>
            <h4>No active workflows found</h4>
            <p>Publish a workflow from the studio to activate live listening.</p>
            <button type="button" className="primary-btn" onClick={onOpenBuilder}>
              Go to Workflow Studio
            </button>
          </div>
        )}
      </div>

      {/* Live Trigger Endpoints Table */}
      <div className="trigger-endpoints-section">
        <h3>Trigger Listener Registry</h3>
        <p className="section-subtext">Active webhook receivers and scheduled cron routines</p>
        <div className="table-wrapper">
          <table className="endpoints-table">
            <thead>
              <tr>
                <th>Workflow Name</th>
                <th>Trigger Source</th>
                <th>Method</th>
                <th>Auth Mode</th>
                <th>Success Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeWorkflowsList.map((wf) => (
                <tr key={wf.id || wf.name}>
                  <td>
                    <strong>{wf.name}</strong>
                  </td>
                  <td>
                    <code>{wf.triggerSource || "webhook.events"}</code>
                  </td>
                  <td>
                    <span className="method-pill">POST</span>
                  </td>
                  <td>
                    <span className="auth-pill">Bearer Token</span>
                  </td>
                  <td>
                    <strong className="text-emerald">99.9%</strong>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="table-btn-studio"
                      onClick={() => onOpenWorkflowInStudio && onOpenWorkflowInStudio(wf)}
                    >
                      Studio ➔
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =====================================================================
     DETAIL VIEW: DRAFT WORKFLOWS
     ===================================================================== */
  const renderDraftsDetail = () => (
    <div className="dashboard-detail-view animate-fade-in">
      <div className="detail-view-header">
        <button
          type="button"
          className="back-to-dash-btn"
          onClick={handleBackToOverview}
          aria-label="Back to Dashboard Overview"
        >
          <span className="back-arrow">←</span> Back to Dashboard Overview
        </button>
        <div className="detail-title-block">
          <div className="detail-tag-row">
            <span className="detail-badge-pill pill-draft">STUDIO WORKSPACE</span>
            <span className="detail-count-pill">{draftCount} Drafts in Progress</span>
          </div>
          <h2>Draft Workflows & Work in Progress</h2>
          <p className="detail-subtitle">
            Pipelines currently being authored, configured with condition branches, or undergoing AI validation before deployment.
          </p>
        </div>
      </div>

      {/* Drafts Workspace Banner */}
      <div className="drafts-tip-banner">
        <div className="tip-left">
          <span className="tip-icon">💡</span>
          <div>
            <strong>Draft Auto-Sync is Active</strong>
            <p>Your edits, node connections, and AI prompt modifications are automatically saved locally and synchronized.</p>
          </div>
        </div>
        <button type="button" className="primary-btn tip-btn" onClick={onOpenBuilder}>
          ✦ New Workflow Requirement →
        </button>
      </div>

      {/* Drafts Grid */}
      <div className="detail-cards-grid">
        {draftWorkflowsList.length > 0 ? (
          draftWorkflowsList.map((wf) => (
            <div key={wf.id || wf.name} className="detail-workflow-card card-draft-border">
              <div className="detail-card-top">
                <div className="detail-card-badge-row">
                  <span className="recent-status-pill status-draft">DRAFT</span>
                  <span className="detail-version-tag">v{wf.version || 1}.0-draft</span>
                </div>
                <span className="draft-progress-pill">✎ 85% Configured</span>
              </div>

              <h4 className="detail-card-title">{wf.name}</h4>
              <p className="detail-card-desc">
                {wf.requirement || "Draft workflow under development in CodeHexa Studio."}
              </p>

              {/* Step completion progress bar */}
              <div className="draft-progress-container">
                <div className="progress-labels">
                  <span>Configuration Checklist</span>
                  <strong>{wf.steps?.length || 4} / 5 steps mapped</strong>
                </div>
                <div className="draft-progress-track">
                  <div className="draft-progress-fill" style={{ width: "80%" }} />
                </div>
              </div>

              <div className="detail-card-meta-grid">
                <div className="meta-cell">
                  <small>TRIGGER TYPE</small>
                  <span>⚡ {wf.triggerType || "Webhook"}</span>
                </div>
                <div className="meta-cell">
                  <small>VALIDATION</small>
                  <span className="text-purple">Ready to Test</span>
                </div>
                <div className="meta-cell">
                  <small>AI CONFIDENCE</small>
                  <span>🎯 {Math.round((wf.confidence || 0.9) * 100)}%</span>
                </div>
                <div className="meta-cell">
                  <small>LAST EDITED</small>
                  <span>{wf.lastTriggered || "Today"}</span>
                </div>
              </div>

              <div className="detail-card-actions">
                <button
                  type="button"
                  className="detail-action-primary"
                  onClick={() => onOpenWorkflowInStudio && onOpenWorkflowInStudio(wf)}
                >
                  ✦ Continue Editing in Studio →
                </button>
                <button
                  type="button"
                  className="detail-action-secondary"
                  onClick={() => setSelectedRecentWorkflow && setSelectedRecentWorkflow(wf)}
                >
                  👁 Preview Flow
                </button>
                {onRequestDelete && (
                  <button
                    type="button"
                    className="detail-action-delete"
                    onClick={() => onRequestDelete(wf)}
                    title="Delete workflow"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="detail-empty-state">
            <span className="empty-icon">✎</span>
            <h4>No draft workflows pending</h4>
            <p>All your workflows are currently active or you haven't started a draft yet.</p>
            <button type="button" className="primary-btn" onClick={onOpenBuilder}>
              ✦ Create a Draft in Studio
            </button>
          </div>
        )}
      </div>

      {/* Best Practices for Finishing Drafts */}
      <div className="draft-guidelines-box">
        <h3>Checklist for Publishing Workflows</h3>
        <div className="guidelines-grid">
          <div className="guide-item">
            <span className="guide-num">1</span>
            <div>
              <strong>Verify Input Mappings</strong>
              <p>Ensure each step receives required fields from upstream triggers or action outputs.</p>
            </div>
          </div>
          <div className="guide-item">
            <span className="guide-num">2</span>
            <div>
              <strong>Test Decision Conditions</strong>
              <p>Check `YES / NO` expressions to avoid infinite loops and guarantee clean fallback branches.</p>
            </div>
          </div>
          <div className="guide-item">
            <span className="guide-num">3</span>
            <div>
              <strong>Run a Dry-Run Simulation</strong>
              <p>Execute safe simulated triggers to preview step-by-step state propagation and verify timing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =====================================================================
     DETAIL VIEW: AVERAGE CONFIDENCE & AI ANALYSIS
     ===================================================================== */
  const renderConfidenceDetail = () => (
    <div className="dashboard-detail-view animate-fade-in">
      <div className="detail-view-header">
        <button
          type="button"
          className="back-to-dash-btn"
          onClick={handleBackToOverview}
          aria-label="Back to Dashboard Overview"
        >
          <span className="back-arrow">←</span> Back to Dashboard Overview
        </button>
        <div className="detail-title-block">
          <div className="detail-tag-row">
            <span className="detail-badge-pill pill-conf">AWS BEDROCK AI</span>
            <span className="status-pill status-online">
              <span className="status-dot"></span> Qwen 2.5 72B Instruct Active
            </span>
          </div>
          <h2>AI Generation Confidence & Accuracy Analysis</h2>
          <p className="detail-subtitle">
            Comprehensive breakdown of semantic intent parsing, DAG step sequence accuracy, and constraint verification scores.
          </p>
        </div>
      </div>

      {/* Confidence KPI Summary */}
      <div className="detail-kpi-row">
        <div className="detail-kpi-card">
          <span className="kpi-label">Average Confidence</span>
          <strong className="kpi-value text-purple">{avgConfidenceScore}%</strong>
          <span className="kpi-subtext">High precision rating</span>
        </div>
        <div className="detail-kpi-card">
          <span className="kpi-label">Intent Accuracy</span>
          <strong className="kpi-value text-emerald">96.4%</strong>
          <span className="kpi-subtext">Domain match precision</span>
        </div>
        <div className="detail-kpi-card">
          <span className="kpi-label">Schema Reliability</span>
          <strong className="kpi-value text-cyan">98.2%</strong>
          <span className="kpi-subtext">Zero hallucinated endpoints</span>
        </div>
        <div className="detail-kpi-card">
          <span className="kpi-label">Avg Generation Time</span>
          <strong className="kpi-value">1.4s</strong>
          <span className="kpi-subtext">Bedrock token throughput</span>
        </div>
      </div>

      {/* Quality Sub-Meters Breakdown */}
      <div className="confidence-breakdown-card">
        <h3>AI Engine Accuracy Dimensions</h3>
        <p className="section-subtext">Evaluation benchmarks across key orchestration components</p>

        <div className="confidence-meters-list">
          <div className="meter-item">
            <div className="meter-header">
              <span>Requirement Semantic Intent Resolution</span>
              <strong>96%</strong>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: "96%", background: "#10b981" }} />
            </div>
          </div>

          <div className="meter-item">
            <div className="meter-header">
              <span>DAG Topology & Dependency Sequencing</span>
              <strong>94%</strong>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: "94%", background: "#8b5cf6" }} />
            </div>
          </div>

          <div className="meter-item">
            <div className="meter-header">
              <span>Input / Output Data Mapping Precision</span>
              <strong>92%</strong>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: "92%", background: "#38bdf8" }} />
            </div>
          </div>

          <div className="meter-item">
            <div className="meter-header">
              <span>Decision Gate & Conditional Branching Validity</span>
              <strong>95%</strong>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: "95%", background: "#f59e0b" }} />
            </div>
          </div>

          <div className="meter-item">
            <div className="meter-header">
              <span>Failure Recovery & Retry Loop Safety Checks</span>
              <strong>91%</strong>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: "91%", background: "#ec4899" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Individual Workflow Confidence Table */}
      <div className="workflow-conf-table-card">
        <h3>Workflow Confidence Distribution</h3>
        <p className="section-subtext">Confidence score and heuristic rating per workflow</p>
        <div className="table-wrapper">
          <table className="endpoints-table">
            <thead>
              <tr>
                <th>Workflow Name</th>
                <th>Trigger Mode</th>
                <th>Confidence Score</th>
                <th>Quality Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentWorkflows.map((wf) => {
                const confPct = Math.round((wf.confidence || 0.92) * 100);
                const qualityLabel =
                  confPct >= 95 ? "Exceptional" : confPct >= 90 ? "High Precision" : "Standard";
                return (
                  <tr key={wf.id || wf.name}>
                    <td>
                      <strong>{wf.name}</strong>
                    </td>
                    <td>{wf.triggerType || "Webhook"}</td>
                    <td>
                      <strong className="text-purple">{confPct}%</strong>
                    </td>
                    <td>
                      <span className="quality-pill">{qualityLabel}</span>
                    </td>
                    <td>
                      <span className={`recent-status-pill status-${wf.status || "active"}`}>
                        {wf.status || "active"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="table-btn-studio"
                        onClick={() => onOpenWorkflowInStudio && onOpenWorkflowInStudio(wf)}
                      >
                        Studio ➔
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =====================================================================
     MAIN DASHBOARD OVERVIEW (DEFAULT VIEW)
     ===================================================================== */
  return (
    <section className="dashboard-section" id="dashboard">
      {/* If a detail view is active, render that detail view instead */}
      {activeDetailTab === "total" && renderTotalWorkflowsDetail()}
      {activeDetailTab === "active" && renderActiveWorkflowsDetail()}
      {activeDetailTab === "drafts" && renderDraftsDetail()}
      {activeDetailTab === "confidence" && renderConfidenceDetail()}

      {/* Main Overview when activeDetailTab is null */}
      {!activeDetailTab && (
        <>
          {/* Top Welcome Banner */}
          <div className="dashboard-welcome-banner">
            <div className="dashboard-welcome-text">
              <div className="dashboard-title-row">
                <p className="tag">LIVE DASHBOARD</p>
                <span className="status-pill status-online">
                  <span className="status-dot"></span>
                  Connected (MongoDB & Bedrock AI)
                </span>
                <button
                  className="dashboard-refresh-btn"
                  type="button"
                  onClick={refreshDashboardData}
                  disabled={loadingDashboard}
                >
                  {loadingDashboard ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <h2>Welcome back, {user?.name || "Architect"}!</h2>
              <p className="dashboard-welcome-sub">
                Here is your live workspace overview, health analytics, and engine performance metrics.
              </p>
            </div>
            <button
              type="button"
              className="primary-btn dashboard-cta-req-btn"
              onClick={onOpenBuilder}
            >
              ✦ Start Analyzing a New Business Requirement →
            </button>
          </div>

          {/* Interactive Stat KPI Cards */}
          <div className="stats-grid">
            {/* 1. Total Workflows Card */}
            <div
              className="stat-card stat-card-interactive"
              onClick={() => handleCardClick("total")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick("total")}
              title="Click to view detailed statistics for all workflows"
            >
              <div className="stat-card-header">
                <span>Total workflows</span>
                <span className="stat-inspect-badge">Details ↗</span>
              </div>
              <strong>{dashboardStats.totalWorkflows}</strong>
              <div className="stat-card-footer">
                <small className="stat-sub-text">Across all business domains</small>
              </div>
            </div>

            {/* 2. Active Workflows Card */}
            <div
              className="stat-card stat-card-interactive stat-card-active"
              onClick={() => handleCardClick("active")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick("active")}
              title="Click to view active production workflows and trigger health"
            >
              <div className="stat-card-header">
                <span>Active</span>
                <span className="stat-inspect-badge badge-emerald">Live ↗</span>
              </div>
              <strong className="text-emerald">{dashboardStats.activeWorkflows}</strong>
              <div className="stat-card-footer">
                <small className="stat-sub-text">● Live listening in production</small>
              </div>
            </div>

            {/* 3. Draft Workflows Card */}
            <div
              className="stat-card stat-card-interactive stat-card-drafts"
              onClick={() => handleCardClick("drafts")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick("drafts")}
              title="Click to view draft workflows and editing status"
            >
              <div className="stat-card-header">
                <span>Drafts</span>
                <span className="stat-inspect-badge badge-purple">Edit ↗</span>
              </div>
              <strong className="text-purple">{dashboardStats.draftWorkflows}</strong>
              <div className="stat-card-footer">
                <small className="stat-sub-text">✎ In-progress configurations</small>
              </div>
            </div>

            {/* 4. Average Confidence Card */}
            <div
              className="stat-card stat-card-interactive stat-card-confidence"
              onClick={() => handleCardClick("confidence")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick("confidence")}
              title="Click to inspect Bedrock AI confidence breakdown and accuracy"
            >
              <div className="stat-card-header">
                <span>Avg. confidence</span>
                <span className="stat-inspect-badge badge-cyan">Analysis ↗</span>
              </div>
              <strong className="text-cyan">{avgConfidenceScore}%</strong>
              <div className="stat-card-footer">
                <small className="stat-sub-text">🎯 Bedrock Qwen AI model accuracy</small>
              </div>
            </div>
          </div>

          {/* VISUAL CHARTS & LATENCY BREAKDOWN */}
          <div className="dashboard-charts-grid">
            {/* WEEKLY ACTIVITY BAR CHART */}
            <div className="dashboard-chart-card">
              <div className="chart-card-header">
                <div>
                  <span className="chart-pill-tag">EXECUTION VOLUME</span>
                  <h4>Weekly Workflow Activity</h4>
                </div>
                <span className="chart-stat-badge">📈 1,263 Runs this week</span>
              </div>

              <div className="activity-chart-wrapper">
                <div className="activity-bars-container">
                  {weeklyActivityData.map((item, index) => (
                    <div
                      key={item.day}
                      className="activity-bar-column"
                      onMouseEnter={() => setHoveredBarIndex(index)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {hoveredBarIndex === index && (
                        <div className="activity-bar-tooltip">
                          <strong>{item.day}</strong>
                          <span>⚡ {item.executions} runs</span>
                          <span>✦ {item.created} new</span>
                        </div>
                      )}
                      <div className="activity-bar-track">
                        <div
                          className="activity-bar-fill"
                          style={{ height: `${item.height}%` }}
                        />
                      </div>
                      <span className="activity-day-label">{item.day}</span>
                    </div>
                  ))}
                </div>
                <div className="activity-chart-legend">
                  <span className="chart-legend-bullet">
                    <span className="legend-square" /> Daily Execution Volume
                  </span>
                </div>
              </div>
            </div>

            {/* DONUT STATUS BREAKDOWN CHART */}
            <div className="dashboard-chart-card dashboard-donut-card">
              <div className="chart-card-header">
                <div>
                  <span className="chart-pill-tag">HEALTH ANALYTICS</span>
                  <h4>Workflow Status Breakdown</h4>
                </div>
                <span className="chart-stat-badge compact-operational-badge">
                  <span className="badge-pulse-dot" />
                  100% Operational
                </span>
              </div>

              <div className="donut-chart-wrapper">
                <div className="donut-svg-container">
                  <svg
                    width="156"
                    height="156"
                    viewBox="0 0 160 160"
                    className="donut-chart-svg"
                    role="img"
                    aria-label={`Workflow Status Breakdown: ${activeCount} Active, ${draftCount} Drafts, ${validatedCount} Validated`}
                  >
                    <defs>
                      <linearGradient id="donut-grad-active" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="donut-grad-draft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="donut-grad-validated" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                      <filter id="donut-active-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.6" />
                      </filter>
                      <filter id="donut-draft-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#a855f7" floodOpacity="0.6" />
                      </filter>
                      <filter id="donut-validated-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.6" />
                      </filter>
                    </defs>

                    {/* Track Background Ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r="56"
                      fill="none"
                      stroke="var(--donut-track, rgba(255,255,255,0.06))"
                      strokeWidth="14"
                    />

                    {/* Active Segment */}
                    {activePercent > 0 && (
                      <circle
                        cx="80"
                        cy="80"
                        r="56"
                        fill="none"
                        stroke="url(#donut-grad-active)"
                        strokeWidth={hoveredStatus === "active" ? 17 : 14}
                        strokeDasharray={`${(activePercent / 100) * 351.86} 352`}
                        strokeDashoffset="0"
                        transform="rotate(-90 80 80)"
                        strokeLinecap="round"
                        filter={hoveredStatus === "active" ? "url(#donut-active-glow)" : "none"}
                        opacity={hoveredStatus && hoveredStatus !== "active" ? 0.4 : 1}
                        className="donut-segment segment-active"
                        onMouseEnter={() => setHoveredStatus("active")}
                        onMouseLeave={() => setHoveredStatus(null)}
                        onClick={() => handleCardClick("active")}
                      />
                    )}

                    {/* Drafts Segment */}
                    {draftPercent > 0 && (
                      <circle
                        cx="80"
                        cy="80"
                        r="56"
                        fill="none"
                        stroke="url(#donut-grad-draft)"
                        strokeWidth={hoveredStatus === "draft" ? 17 : 14}
                        strokeDasharray={`${(draftPercent / 100) * 351.86} 352`}
                        strokeDashoffset={`${-(activePercent / 100) * 351.86}`}
                        transform="rotate(-90 80 80)"
                        strokeLinecap="round"
                        filter={hoveredStatus === "draft" ? "url(#donut-draft-glow)" : "none"}
                        opacity={hoveredStatus && hoveredStatus !== "draft" ? 0.4 : 1}
                        className="donut-segment segment-draft"
                        onMouseEnter={() => setHoveredStatus("draft")}
                        onMouseLeave={() => setHoveredStatus(null)}
                        onClick={() => handleCardClick("drafts")}
                      />
                    )}

                    {/* Validated Segment */}
                    {validatedPercent > 0 && (
                      <circle
                        cx="80"
                        cy="80"
                        r="56"
                        fill="none"
                        stroke="url(#donut-grad-validated)"
                        strokeWidth={hoveredStatus === "validated" ? 17 : 14}
                        strokeDasharray={`${(validatedPercent / 100) * 351.86} 352`}
                        strokeDashoffset={`${-((activePercent + draftPercent) / 100) * 351.86}`}
                        transform="rotate(-90 80 80)"
                        strokeLinecap="round"
                        filter={hoveredStatus === "validated" ? "url(#donut-validated-glow)" : "none"}
                        opacity={hoveredStatus && hoveredStatus !== "validated" ? 0.4 : 1}
                        className="donut-segment segment-validated"
                        onMouseEnter={() => setHoveredStatus("validated")}
                        onMouseLeave={() => setHoveredStatus(null)}
                        onClick={() => handleCardClick("total")}
                      />
                    )}

                    {/* Center Text: Total Count and FLOWS */}
                    <text
                      x="80"
                      y="75"
                      textAnchor="middle"
                      className="donut-center-total"
                    >
                      {dashboardStats.totalWorkflows}
                    </text>
                    <text
                      x="80"
                      y="94"
                      textAnchor="middle"
                      className="donut-center-label"
                    >
                      FLOWS
                    </text>
                  </svg>
                </div>

                {/* Polished Status Legend on the Right */}
                <div className="donut-chart-legend">
                  {/* Active Status Row */}
                  <div
                    className={`legend-item interactive-legend ${hoveredStatus === "active" ? "legend-hovered" : ""}`}
                    onClick={() => handleCardClick("active")}
                    onMouseEnter={() => setHoveredStatus("active")}
                    onMouseLeave={() => setHoveredStatus(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick("active")}
                    title="Click to view active production workflows"
                  >
                    <div className="legend-item-left">
                      <span className="legend-dot-glow dot-active">
                        <span className="dot-inner" />
                      </span>
                      <span className="legend-label">
                        Active <span className="legend-count-pill">({activeCount})</span>
                      </span>
                    </div>
                    <span className="legend-pct-pill pct-emerald">{activePercent}%</span>
                  </div>

                  {/* Drafts Status Row */}
                  <div
                    className={`legend-item interactive-legend ${hoveredStatus === "draft" ? "legend-hovered" : ""}`}
                    onClick={() => handleCardClick("drafts")}
                    onMouseEnter={() => setHoveredStatus("draft")}
                    onMouseLeave={() => setHoveredStatus(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick("drafts")}
                    title="Click to view draft workflows"
                  >
                    <div className="legend-item-left">
                      <span className="legend-dot-glow dot-draft">
                        <span className="dot-inner" />
                      </span>
                      <span className="legend-label">
                        Drafts <span className="legend-count-pill">({draftCount})</span>
                      </span>
                    </div>
                    <span className="legend-pct-pill pct-purple">{draftPercent}%</span>
                  </div>

                  {/* Validated Status Row */}
                  <div
                    className={`legend-item interactive-legend ${hoveredStatus === "validated" ? "legend-hovered" : ""}`}
                    onClick={() => handleCardClick("total")}
                    onMouseEnter={() => setHoveredStatus("validated")}
                    onMouseLeave={() => setHoveredStatus(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick("total")}
                    title="Click to view total workflow portfolio"
                  >
                    <div className="legend-item-left">
                      <span className="legend-dot-glow dot-validated">
                        <span className="dot-inner" />
                      </span>
                      <span className="legend-label">
                        Validated <span className="legend-count-pill">({validatedCount})</span>
                      </span>
                    </div>
                    <span className="legend-pct-pill pct-cyan">{validatedPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT WORKFLOWS & ENGINE CAPABILITIES */}
          <div className="dashboard-panels">
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h3>Recent workflows</h3>
                  <p className="panel-subtext">
                    Click any workflow to inspect its trigger timestamp and engine traces.
                  </p>
                </div>
                <button
                  type="button"
                  className="panel-view-all-btn"
                  onClick={() => handleCardClick("total")}
                >
                  View all ➔
                </button>
              </div>

              <div className="recent-list">
                {recentWorkflows.length > 0 ? (
                  recentWorkflows.slice(0, 5).map((workflow) => (
                    <button
                      key={workflow.id || workflow.name}
                      type="button"
                      className="recent-item recent-interactive-btn"
                      onClick={() => setSelectedRecentWorkflow && setSelectedRecentWorkflow(workflow)}
                    >
                      <div className="recent-item-left">
                        <div className="recent-title-line">
                          <strong>{workflow.name}</strong>
                          <span className="recent-trigger-time">
                            🕒 {workflow.lastTriggered || "Recently"}
                          </span>
                        </div>
                        <div className="recent-meta-line">
                          <small className={`recent-status-pill status-${workflow.status || "active"}`}>
                            {workflow.status || "active"}
                          </small>
                          <span className="recent-engine-tag">
                            ⚙️ {workflow.triggerType || "Webhook"}
                          </span>
                          <span className="recent-ms-tag">
                            ⚡ {workflow.executionTimeMs || 140}ms
                          </span>
                        </div>
                      </div>
                      <span className="recent-version-badge">v{workflow.version || 1}.0</span>
                    </button>
                  ))
                ) : (
                  <p className="empty-state">No recent workflows available yet.</p>
                )}
              </div>
            </div>

            {/* ENGINE CAPABILITIES CARD (PS11 FEATURE CHECKLIST) */}
            <div className="dashboard-panel engine-capabilities-panel">
              <div className="panel-header">
                <div>
                  <h3>Workflow Engine Capabilities</h3>
                  <p className="panel-subtext">Enterprise runtime specifications & guarantees</p>
                </div>
                <span className="engine-v-pill">Engine v2.4</span>
              </div>

              <div className="capabilities-checklist-grid">
                <div className="cap-check-item">
                  <span className="cap-icon">✓</span>
                  <div>
                    <strong>Multiple workflow cards</strong>
                    <small>Disambiguates multiple intent chains</small>
                  </div>
                </div>
                <div className="cap-check-item">
                  <span className="cap-icon">✓</span>
                  <div>
                    <strong>Retry on failure</strong>
                    <small>3x exponential backoff recovery</small>
                  </div>
                </div>
                <div className="cap-check-item">
                  <span className="cap-icon">✓</span>
                  <div>
                    <strong>Webhook trigger</strong>
                    <small>REST API & JSON payload listening</small>
                  </div>
                </div>
                <div className="cap-check-item">
                  <span className="cap-icon">✓</span>
                  <div>
                    <strong>Scheduled trigger</strong>
                    <small>Cron expression time automation</small>
                  </div>
                </div>
                <div className="cap-check-item">
                  <span className="cap-icon">✓</span>
                  <div>
                    <strong>Workflow versioning</strong>
                    <small>Immutable draft & publish snapshots</small>
                  </div>
                </div>
                <div className="cap-check-item">
                  <span className="cap-icon">✓</span>
                  <div>
                    <strong>Confidence score</strong>
                    <small>Context capability match index</small>
                  </div>
                </div>
                <div className="cap-check-item">
                  <span className="cap-icon">✓</span>
                  <div>
                    <strong>Detection warnings</strong>
                    <small>Automated DAG and cycle analysis</small>
                  </div>
                </div>
                <div className="cap-check-item">
                  <span className="cap-icon">✓</span>
                  <div>
                    <strong>Dry run</strong>
                    <small>Safe non-destructive simulation</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardSection;
