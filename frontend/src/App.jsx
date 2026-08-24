import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkflowBuilder from "./components/WorkflowBuilder";
import FeatureCard from "./components/FeatureCard";
import { workflowApi } from "./services/api";

import "./App.css";

function App() {
  const [showHistory, setShowHistory] = useState(false);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    draftWorkflows: 0,
    archivedWorkflows: 0,
    averageConfidence: 0,
  });
  const [templates, setTemplates] = useState([]);
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState("");
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardMode, setDashboardMode] = useState("live");

  const normalizeRecentWorkflow = (workflow, fallbackStatus = "draft") => {
    if (!workflow) return null;

    return {
      id: workflow.id || workflow._id || `local-${Date.now()}-${Math.random()}`,
      name: workflow.name || workflow.title || "Untitled workflow",
      status: workflow.status || fallbackStatus,
      version: workflow.version || 1,
      updatedAt: workflow.updatedAt || new Date().toISOString(),
      confidence: workflow.confidence || 0,
    };
  };

  const updateDashboardFromWorkflow = (workflow, statusOverride = null) => {
    if (!workflow) return;

    const nextItem = normalizeRecentWorkflow(
      workflow,
      statusOverride || workflow.status || "draft"
    );

    setRecentWorkflows((currentItems) => {
      const deduped = currentItems.filter((item) => item.id !== nextItem.id);
      const merged = [nextItem, ...deduped].slice(0, 5);

      const total = Math.max(merged.length, 1);
      const active = merged.filter((item) => item.status === "active").length;
      const draft = merged.filter((item) => item.status === "draft").length;
      const archived = merged.filter((item) => item.status === "archived").length;
      const averageConfidence = merged.length
        ? Number((merged.reduce((sum, item) => sum + (item.confidence || 0), 0) / merged.length).toFixed(2))
        : 0;

      setDashboardStats((previousStats) => ({
        ...previousStats,
        totalWorkflows: total,
        activeWorkflows: active,
        draftWorkflows: draft,
        archivedWorkflows: archived,
        averageConfidence,
      }));

      return merged;
    });

    setDashboardMode("live");
  };

  const refreshDashboardData = async () => {
    try {
      const [statsResult, templatesResult, recentResult] = await Promise.allSettled([
        workflowApi.getStats(),
        workflowApi.getTemplates(),
        workflowApi.getRecentWorkflows(),
      ]);

      const statsData = statsResult.status === "fulfilled"
        ? (statsResult.value.data?.stats || statsResult.value.data || fallbackDashboardStats)
        : fallbackDashboardStats;

      const templatesData = templatesResult.status === "fulfilled"
        ? (templatesResult.value.data?.templates || templatesResult.value.data || fallbackTemplates)
        : fallbackTemplates;

      const recentData = recentResult.status === "fulfilled"
        ? (recentResult.value.data?.workflows || recentResult.value.data || fallbackRecentWorkflows)
        : fallbackRecentWorkflows;

      setDashboardStats(statsData);
      setTemplates(templatesData);
      setRecentWorkflows(Array.isArray(recentData) ? recentData : fallbackRecentWorkflows);

      if (statsResult.status !== "fulfilled" || templatesResult.status !== "fulfilled" || recentResult.status !== "fulfilled") {
        setDashboardMode("demo");
      } else {
        setDashboardMode("live");
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      setDashboardStats(fallbackDashboardStats);
      setTemplates(fallbackTemplates);
      setRecentWorkflows(fallbackRecentWorkflows);
      setDashboardMode("demo");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fallbackDashboardStats = {
    totalWorkflows: 12,
    activeWorkflows: 5,
    draftWorkflows: 4,
    archivedWorkflows: 3,
    averageConfidence: 0.86,
  };

  const fallbackTemplates = [
    {
      id: "order-processing",
      name: "Order Processing",
      description: "Handle order validation, payment processing, and confirmation messaging.",
      category: "commerce",
      requirement: "When a new order is placed, validate the order details, process payment, update inventory, and send a confirmation email to the customer.",
    },
    {
      id: "customer-onboarding",
      name: "Customer Onboarding",
      description: "Collect user data, verify eligibility, and assign onboarding tasks.",
      category: "operations",
      requirement: "When a new customer signs up, verify their information, create an onboarding task, assign a team member, and send a welcome email.",
    },
  ];

  const fallbackRecentWorkflows = [
    { id: "demo-1", name: "Order Processing", status: "active", version: 3 },
    { id: "demo-2", name: "Customer Onboarding", status: "draft", version: 1 },
    { id: "demo-3", name: "Incident Response", status: "validated", version: 2 },
  ];

  /*
   * =========================================================
   * CURSOR FOLLOWING AMBIENT LIGHT
   * =========================================================
   */

  useEffect(() => {
    const handleMouseMove = (event) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${event.clientX}px`
      );

      document.documentElement.style.setProperty(
        "--mouse-y",
        `${event.clientY}px`
      );
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  useEffect(() => {
    refreshDashboardData();
  }, []);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const openBuilder = () => {
    document
      .getElementById("builder")
      ?.scrollIntoView({
        behavior: "smooth"
      });
  };

  const openHistory = () => {
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
  };

  /*
   * =========================================================
   * RECEIVE HISTORY FROM WORKFLOW BUILDER
   * =========================================================
   */

  const handleHistoryChange = (history) => {
    setExecutionHistory(history);
  };

  const handleTemplateSelect = (template) => {
    setActiveTemplate(template.requirement || "");
    openBuilder();
  };

  const handleWorkflowChange = async (workflow, statusOverride = null, persisted = false) => {
    if (workflow) {
      if (persisted) {
        await refreshDashboardData();
        return;
      }

      updateDashboardFromWorkflow(workflow, statusOverride);
      return;
    }

    refreshDashboardData();
  };

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <Navbar
        onOpenBuilder={openBuilder}
        onOpenHistory={openHistory}
      />


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main>

        <Hero
          onOpenBuilder={openBuilder}
        />


        <WorkflowBuilder
          onHistoryChange={handleHistoryChange}
          prefillRequirement={activeTemplate}
          onWorkflowChange={handleWorkflowChange}
        />


        {/* =================================================
            FEATURES
            ================================================= */}

        <section
          className="features"
          id="features"
        >

          <p className="tag">
            PLATFORM CAPABILITIES
          </p>


          <h2>
            Everything needed to build and
            manage workflows
          </h2>


          <div className="feature-grid">

            <FeatureCard
              icon="⌁"
              title="Requirement Detection"
              description="Convert natural-language business requirements into structured workflow definitions."
            />


            <FeatureCard
              icon="◈"
              title="Visual Workflow Editing"
              description="Inspect and modify workflow steps, actions, mappings, and execution paths."
            />


            <FeatureCard
              icon="✦"
              title="AI-Assisted Changes"
              description="Describe workflow changes in natural language and review the proposed updates."
            />

          </div>

        </section>

        <section className="dashboard-section">
          <div className="dashboard-header">
            <div>
              <p className="tag">LIVE DASHBOARD</p>
              <h2>Workflow health overview</h2>
            </div>
          </div>

          {!loadingDashboard ? (
            <>
              {dashboardMode === "demo" && (
                <div className="demo-banner">
                  Demo mode is active because the backend is not connected right now. The dashboard is showing sample workflow data.
                </div>
              )}

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Total workflows</span>
                  <strong>{dashboardStats.totalWorkflows}</strong>
                </div>
                <div className="stat-card">
                  <span>Active</span>
                  <strong>{dashboardStats.activeWorkflows}</strong>
                </div>
                <div className="stat-card">
                  <span>Drafts</span>
                  <strong>{dashboardStats.draftWorkflows}</strong>
                </div>
                <div className="stat-card">
                  <span>Avg. confidence</span>
                  <strong>{dashboardStats.averageConfidence.toFixed(2)}</strong>
                </div>
              </div>

              <div className="dashboard-panels">
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h3>Workflow templates</h3>
                  </div>

                  <div className="template-list">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className="template-card template-action"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div>
                          <span>{template.category}</span>
                          <h4>{template.name}</h4>
                        </div>
                        <p>{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h3>Recent workflows</h3>
                  </div>

                  <div className="recent-list">
                    {recentWorkflows.length > 0 ? recentWorkflows.map((workflow) => (
                      <div key={workflow.id} className="recent-item">
                        <div>
                          <strong>{workflow.name}</strong>
                          <small>{workflow.status}</small>
                        </div>
                        <span>{workflow.version || 1}</span>
                      </div>
                    )) : (
                      <p className="empty-state">No recent workflows available yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="loading-state">Loading dashboard data…</div>
          )}
        </section>

      </main>


      {/* =====================================================
          HISTORY PANEL
          ===================================================== */}

      {showHistory && (

        <div
          className="history-overlay"
          onClick={closeHistory}
        >

          <div
            className="history-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* -------------------------------------------------
                HISTORY HEADER
                ------------------------------------------------- */}

            <div className="history-panel-header">

              <div>

                <p className="tag">
                  EXECUTION HISTORY
                </p>

                <h2>
                  Workflow History
                </h2>

              </div>


              <button
                className="history-close"
                onClick={closeHistory}
                type="button"
                aria-label="Close history"
              >

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>

              </button>

            </div>


            {/* =================================================
                EMPTY HISTORY
                ================================================= */}

            {executionHistory.length === 0 && (

              <div className="history-empty">

                <div className="history-icon">

                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path
                      d="M3 12a9 9 0 1 0 3-6.7"
                    />

                    <path d="M3 4v5h5" />

                    <path d="M12 7v5l3 2" />

                  </svg>

                </div>


                <h3>
                  No workflow runs yet
                </h3>


                <p>
                  Run a workflow and its
                  execution history will
                  appear here.
                </p>

              </div>

            )}


            {/* =================================================
                HISTORY LIST
                ================================================= */}

            {executionHistory.length > 0 && (

              <div className="navbar-history-list">

                <div className="history-summary">

                  <span>
                    {executionHistory.length}{" "}
                    workflow run
                    {executionHistory.length !== 1
                      ? "s"
                      : ""}
                  </span>

                </div>


                {executionHistory.map(
                  (execution, index) => (

                    <div
                      className="navbar-history-card"
                      key={execution.id}
                    >

                      <div className="navbar-history-card-top">

                        <div>

                          <p className="history-run-number">
                            RUN #
                            {executionHistory.length -
                              index}
                          </p>


                          <h3>
                            {execution.workflowName}
                          </h3>

                        </div>


                        <span
                          className={`history-status history-${execution.status}`}
                        >
                          {execution.status}
                        </span>

                      </div>


                      <div className="navbar-history-time">

                        <span>
                          Started{" "}
                          {execution.startedAt}
                        </span>


                        {execution.completedAt && (

                          <span>
                            Completed{" "}
                            {execution.completedAt}
                          </span>

                        )}

                      </div>


                      <div className="navbar-history-steps">

                        {execution.steps.map(
                          (step) => (

                            <div
                              className="navbar-history-step"
                              key={step.stepId}
                            >

                              <span className="history-step-indicator">

                                {step.status ===
                                "success"
                                  ? "✓"
                                  : step.status ===
                                    "running"
                                  ? "●"
                                  : step.status ===
                                    "failed"
                                  ? "!"
                                  : "○"}

                              </span>


                              <span>
                                {step.stepName}
                              </span>


                              <small>
                                {step.status}
                              </small>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;