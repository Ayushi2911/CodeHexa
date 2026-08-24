import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkflowBuilder from "./components/WorkflowBuilder";
import FeatureCard from "./components/FeatureCard";
import AboutSection from "./components/AboutSection";
import DemoVideoSection from "./components/DemoVideoSection";
import HelpSection from "./components/HelpSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import { workflowApi } from "./services/api";

import "./App.css";

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
    description: "Handle order validation, vendor notification, invoice creation, physical stock update, and customer confirmation.",
    category: "COMMERCE",
    trigger: "Order Placed",
    steps: ["Notify Vendor", "Create Invoice", "Update Inventory", "Send Confirmation"],
    requirement: "When an order is placed, notify the vendor, create an invoice, update inventory, then send a confirmation to the customer.",
  },
  {
    id: "customer-onboarding",
    name: "Customer Onboarding",
    description: "Collect user data, verify KYC eligibility, create onboarding tasks, assign team members, and send welcome emails.",
    category: "OPERATIONS",
    trigger: "Customer Signed Up",
    steps: ["Verify Info", "Create Onboarding Task", "Assign Team", "Send Welcome Email"],
    requirement: "When a new customer signs up, verify their information, create an onboarding task, assign a team member, and send a welcome email.",
  },
  {
    id: "complaint-processing",
    name: "Complaint Processing",
    description: "Log customer complaints, diagnose warranty & anomaly, and notify customer with resolution.",
    category: "SUPPORT (PS11)",
    trigger: "Complaint Received",
    steps: ["Log Complaint", "Check Anomaly & Warranty", "Notify Customer"],
    requirement: "When a complaint is received, log the complaint, check anomaly and warranty status, then send resolution notification to customer.",
  },
  {
    id: "job-application",
    name: "Job Application Flow",
    description: "Screen candidate resume, schedule technical interview, and conduct probation review.",
    category: "HR & TALENT",
    trigger: "Application Submitted",
    steps: ["Screen Resume", "Conduct Interview", "Review Probation"],
    requirement: "When an applicant applies, screen resume and report applicant, schedule interview and offer negotiation, then conduct probation review.",
  },
];

const fallbackRecentWorkflows = [
  { id: "demo-1", name: "Order Processing", status: "active", version: 3 },
  { id: "demo-2", name: "Customer Onboarding", status: "draft", version: 1 },
  { id: "demo-3", name: "Complaint Processing", status: "validated", version: 2 },
  { id: "demo-4", name: "Job Application Flow", status: "active", version: 1 },
];

function App() {
  const [showHistory, setShowHistory] = useState(false);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(fallbackDashboardStats);
  const [templates, setTemplates] = useState(fallbackTemplates);
  const [recentWorkflows, setRecentWorkflows] = useState(fallbackRecentWorkflows);
  const [activeTemplate, setActiveTemplate] = useState("");
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("codehexa_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("codehexa_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "home",
        "builder",
        "features",
        "dashboard",
        "templates",
        "about",
        "demo",
        "help",
        "contact",
      ];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /*
   * =========================================================
   * SCROLL REVEAL (SUBTLE COMING UP ANIMATION)
   * =========================================================
   */
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-revealed");
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.08,
    });

    const selector = [
      ".feature-card",
      ".stat-card",
      ".dashboard-panel",
      ".about-story-card",
      ".about-pillar-card",
      ".quickstart-card",
      ".faq-item",
      ".channel-card",
      ".contact-form-container",
      ".requirement-box",
      ".about-header",
      ".help-header",
      ".contact-header",
      ".features-eyebrow",
    ].join(", ");

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.classList.add("scroll-hidden");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loadingDashboard]);

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
        activeSection={activeSection}
        onOpenBuilder={openBuilder}
        onOpenHistory={openHistory}
        theme={theme}
        onToggleTheme={toggleTheme}
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
          <div className="features-eyebrow">
            <span className="features-eyebrow-dot" />
            PLATFORM CAPABILITIES
          </div>

          <h2>
            Everything needed to build and manage workflows
          </h2>

          <div className="feature-grid">
            <FeatureCard
              icon="✦"
              title="AI Workflow Builder"
              description="Turn natural-language requirements into structured, intelligent workflows."
              number="0"
            />

            <FeatureCard
              icon="◈"
              title="Visual Workflow Editor"
              description="Design and refine every workflow step through a clear visual interface."
              number="0"
            />

            <FeatureCard
              icon="✓"
              title="Smart Validation"
              description="Catch workflow issues early with intelligent validation before execution."
              number="0"
            />

            <FeatureCard
              icon="⌘"
              title="Easy Integrations"
              description="Connect your workflows to services, systems, and business tools with ease."
              number="0"
            />

            <FeatureCard
              icon="🛡"
              title="Secure & Reliable"
              description="Build dependable automation with controlled execution and predictable flows."
              number="0"
            />

            <FeatureCard
              icon="↗"
              title="Analytics & Insights"
              description="Understand workflow activity and execution outcomes through useful insights."
              number="0"
            />
          </div>
        </section>

        <section className="dashboard-section" id="dashboard">
          <div className="dashboard-header">
            <div>
              <div className="dashboard-title-row">
                <p className="tag">LIVE DASHBOARD</p>
                <span className="status-pill status-online">
                  <span className="status-dot"></span>
                  Connected (MongoDB & Bedrock AI)
                </span>
              </div>
              <h2>Workflow health overview</h2>
            </div>
          </div>

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

          <div className="dashboard-panels" id="templates">
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3>Workflow templates</h3>
              </div>

              <div className="template-list">
                {templates.map((template, index) => (
                  <button
                    key={template.id || template.name || `template-${index}`}
                    type="button"
                    style={{ "--card-index": index }}
                    className="template-card template-action"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <div className="template-card-header">
                      <span className="template-category-pill">{template.category}</span>
                      <span className="template-preview-badge">Preview ➔</span>
                    </div>
                    <h4>{template.name}</h4>
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
                {recentWorkflows.length > 0 ? (
                  recentWorkflows.map((workflow) => (
                    <div key={workflow.id || workflow.name} className="recent-item">
                      <div>
                        <strong>{workflow.name}</strong>
                        <small>{workflow.status}</small>
                      </div>
                      <span>v{workflow.version || 1}</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No recent workflows available yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <AboutSection />

        <DemoVideoSection onOpenBuilder={openBuilder} />

        <HelpSection />

        <ContactSection />

        {/* TEMPLATE PREVIEW MODAL */}
        {previewTemplate && (
          <div className="template-modal-overlay" onClick={() => setPreviewTemplate(null)}>
            <div className="template-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="template-modal-header">
                <div>
                  <span className="template-category-pill">{previewTemplate.category}</span>
                  <h3>{previewTemplate.name}</h3>
                </div>
                <button
                  className="template-modal-close"
                  onClick={() => setPreviewTemplate(null)}
                  type="button"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <p className="template-modal-description">{previewTemplate.description}</p>

              {previewTemplate.steps && (
                <div className="template-modal-steps-flow">
                  <label>WORKFLOW EXECUTION STEPS</label>
                  <div className="template-steps-pills-row">
                    <span className="template-trigger-pill">⚡ {previewTemplate.trigger || "Trigger"}</span>
                    {previewTemplate.steps.map((st, sIdx) => (
                      <span key={st} className="template-step-pill">
                        ➔ {st}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="template-modal-req-box">
                <label>BUSINESS REQUIREMENT INTENT</label>
                <p>&quot;{previewTemplate.requirement}&quot;</p>
              </div>

              <div className="template-modal-actions">
                <button
                  className="template-modal-cancel-btn"
                  onClick={() => setPreviewTemplate(null)}
                  type="button"
                >
                  Close
                </button>
                <button
                  className="primary-btn template-modal-use-btn"
                  onClick={() => {
                    setActiveTemplate(previewTemplate.requirement);
                    setPreviewTemplate(null);
                    openBuilder();
                  }}
                  type="button"
                >
                  ✦ Use This Template →
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer
        onOpenBuilder={openBuilder}
        onOpenHistory={openHistory}
        theme={theme}
        onToggleTheme={toggleTheme}
      />


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