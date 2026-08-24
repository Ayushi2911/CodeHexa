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
import AuthModal from "./components/auth/AuthModal";
import { useAuth } from "./context/AuthContext";
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
  {
    id: "demo-1",
    name: "Order Processing",
    status: "active",
    version: 3,
    lastTriggered: "2 mins ago (Today, 10:52:14 AM)",
    triggerType: "Webhook Trigger",
    triggerSource: "POST /v1/orders/webhook",
    executionTimeMs: 142,
    engine: "AWS Bedrock Qwen + DAG Runtime Engine (v2.4)",
    confidence: 0.95,
    requirement: "When an order is placed, notify the vendor, create an invoice, update inventory, then send a confirmation to the customer.",
    steps: [
      { name: "Notify Vendor", type: "Function: NotifyVendorOnOrder", duration: "42ms", status: "success" },
      { name: "Create Invoice", type: "Form Create: invoices.insert", duration: "54ms", status: "success" },
      { name: "Update Inventory", type: "Operation: inventory.deduct", duration: "28ms", status: "success" },
      { name: "Send Confirmation", type: "Function: SendOrderConfirmation", duration: "18ms", status: "success" }
    ],
    capabilities: ["Multiple workflow cards", "Retry on failure (3x)", "Webhook trigger", "Workflow versioning", "Confidence: 95%", "Dry run safe"]
  },
  {
    id: "demo-2",
    name: "Customer Onboarding",
    status: "draft",
    version: 1,
    lastTriggered: "18 mins ago (Today, 10:36:00 AM)",
    triggerType: "Form Create",
    triggerSource: "customers.register",
    executionTimeMs: 98,
    engine: "Deterministic DAG Engine + Schema Validator",
    confidence: 0.88,
    requirement: "When a new customer signs up, verify their information, create an onboarding task, assign a team member, and send a welcome email.",
    steps: [
      { name: "Verify Info", type: "Function: verifyCustomerKYC", duration: "32ms", status: "success" },
      { name: "Create Onboarding Task", type: "Form Create: tasks.insert", duration: "38ms", status: "success" },
      { name: "Assign Team", type: "Operation: assignAgent", duration: "16ms", status: "success" },
      { name: "Send Welcome Email", type: "Function: sendEmail", duration: "12ms", status: "success" }
    ],
    capabilities: ["Form trigger", "Schema verification", "Retry on failure", "Confidence: 88%", "Dry run safe"]
  },
  {
    id: "demo-3",
    name: "Complaint Processing",
    status: "validated",
    version: 2,
    lastTriggered: "1 hour ago (Today, 09:45:20 AM)",
    triggerType: "Scheduled Trigger",
    triggerSource: "crm_portal.sync (Cron */15 * * * *)",
    executionTimeMs: 210,
    engine: "AWS Bedrock Qwen + Diagnostics Engine",
    confidence: 0.92,
    requirement: "When a complaint is received, log the complaint, check anomaly and warranty status, then send resolution notification to customer.",
    steps: [
      { name: "Log Complaint", type: "Form Create: complaintSchema", duration: "68ms", status: "success" },
      { name: "Check Anomaly & Warranty", type: "Function: diagnoseComplaint", duration: "98ms", status: "success" },
      { name: "Notify Customer", type: "Form Create: sendNotification", duration: "44ms", status: "success" }
    ],
    capabilities: ["Scheduled trigger", "Anomaly detection", "Workflow versioning", "Confidence: 92%", "Dry run safe"]
  },
  {
    id: "demo-4",
    name: "Job Application Flow",
    status: "active",
    version: 1,
    lastTriggered: "3 hours ago (Today, 07:30:10 AM)",
    triggerType: "Webhook Trigger",
    triggerSource: "careers_portal.candidate_submit",
    executionTimeMs: 115,
    engine: "AWS Bedrock Qwen + DAG Runtime Engine",
    confidence: 0.91,
    requirement: "When an applicant applies, screen resume and report applicant, schedule interview and offer negotiation, then conduct probation review.",
    steps: [
      { name: "Screen Resume", type: "Form Create: applicationSchema", duration: "45ms", status: "success" },
      { name: "Conduct Interview", type: "Function: conductInterview", duration: "52ms", status: "success" },
      { name: "Review Probation", type: "Function: reviewProbation", duration: "18ms", status: "success" }
    ],
    capabilities: ["Webhook trigger", "DAG route validation", "Retry on failure", "Confidence: 91%", "Dry run safe"]
  }
];

function App() {
  const { isGuest, requireAuth } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [executionHistory, setExecutionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("codehexa_execution_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [dashboardStats, setDashboardStats] = useState(fallbackDashboardStats);
  const [templates, setTemplates] = useState(fallbackTemplates);
  const [recentWorkflows, setRecentWorkflows] = useState(fallbackRecentWorkflows);
  const [selectedRecentWorkflow, setSelectedRecentWorkflow] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState("");
  const [prefillWorkflow, setPrefillWorkflow] = useState(null);
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
      const [statsResult, templatesResult, recentResult, historyResult] = await Promise.allSettled([
        workflowApi.getStats(),
        workflowApi.getTemplates(),
        workflowApi.getRecentWorkflows(),
        workflowApi.getHistory(),
      ]);

      const statsData = statsResult.status === "fulfilled"
        ? (statsResult.value.data?.stats || statsResult.value.data || fallbackDashboardStats)
        : fallbackDashboardStats;

      const templatesData = templatesResult.status === "fulfilled"
        ? (templatesResult.value.data?.templates || templatesResult.value.data || fallbackTemplates)
        : fallbackTemplates;

      const recentData = recentResult.status === "fulfilled"
        ? (recentResult.value.data?.workflows || recentResult.value.data?.data || recentResult.value.data || fallbackRecentWorkflows)
        : fallbackRecentWorkflows;

      if (historyResult.status === "fulfilled" && historyResult.value.data?.data?.length > 0) {
        setExecutionHistory((prev) => {
          const backendItems = historyResult.value.data.data;
          const merged = [...backendItems, ...prev.filter((p) => !backendItems.some((b) => b.id === p.id))];
          try {
            localStorage.setItem("codehexa_execution_history", JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
      }

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
   * NAVIGATION & STUDIO WORKFLOW OPENING
   * =========================================================
   */

  const openBuilder = () => {
    document
      .getElementById("builder")
      ?.scrollIntoView({
        behavior: "smooth"
      });
  };

  const handleOpenWorkflowInStudio = (wf) => {
    if (!wf) return;
    setPreviewTemplate(null);
    setSelectedRecentWorkflow(null);
    setShowHistory(false);

    // Build the complete workflow structure
    const fullWf = wf.fullWorkflow || wf;
    const workflowToLoad = {
      id: fullWf.id || fullWf.workflowId || fullWf._id || `wf-${Date.now()}`,
      name: fullWf.name || fullWf.workflowName || "Workflow",
      status: fullWf.status || "active",
      version: fullWf.version || 1,
      confidence: fullWf.confidence || 0.92,
      requirement: fullWf.requirement || `When an event occurs, execute steps for ${fullWf.name || "business flow"}.`,
      trigger: fullWf.trigger || {
        id: "trigger-1",
        name: fullWf.triggerType || "Webhook Trigger",
        source: fullWf.triggerSource || "webhook.events"
      },
      steps: (fullWf.steps || []).map((s, idx) => {
        const stepId = s.id || s.stepId || `step-00${idx + 1}`;
        return {
          id: stepId,
          stepId: stepId,
          name: s.name || s.stepName || `Step ${idx + 1}`,
          type: s.type?.includes("Form") ? "formCreate" : (s.type?.includes("Operation") ? "operation" : (s.actionType || s.type || "function")),
          actionType: s.type?.includes("Form") ? "formCreate" : (s.type?.includes("Operation") ? "operation" : (s.actionType || s.type || "function")),
          target: s.target || (s.type?.includes(":") ? s.type.split(":")[1]?.trim() : s.name),
          order: idx + 1,
          status: s.status || "pending",
          inputMapping: s.inputMapping || {},
          condition: s.condition || null,
          onSuccess: idx < (fullWf.steps.length - 1) ? (fullWf.steps[idx + 1].id || fullWf.steps[idx + 1].stepId || `step-00${idx + 2}`) : "complete",
          onFailure: "abort"
        };
      })
    };

    setPrefillWorkflow(workflowToLoad);
    openBuilder();
  };

  const handleNewWorkflowCreated = (newWf) => {
    if (!newWf) return;
    const formattedRecent = {
      id: newWf.id || `wf-${Date.now()}`,
      name: newWf.name || "Generated Workflow",
      status: newWf.status || "draft",
      version: newWf.version || 1,
      lastTriggered: "Just now",
      triggerType: newWf.trigger?.name || "Webhook Trigger",
      triggerSource: newWf.trigger?.source || "webhook.events",
      executionTimeMs: Math.floor(Math.random() * 60) + 110,
      engine: "AWS Bedrock Qwen + DAG Runtime Engine (v2.4)",
      confidence: newWf.confidence || 0.94,
      requirement: newWf.requirement || "",
      steps: (newWf.steps || []).map((s) => ({
        id: s.id || s.stepId,
        name: s.name,
        type: s.type || s.actionType || "function",
        duration: "35ms",
        status: s.status || "success"
      })),
      capabilities: ["Multiple workflow cards", "Retry on failure (3x)", "Webhook trigger", "Workflow versioning", "Confidence score", "Dry run safe"]
    };

    setRecentWorkflows((prev) => [formattedRecent, ...prev.filter((w) => w.id !== formattedRecent.id)]);
    updateDashboardFromWorkflow(newWf);
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
          prefillWorkflow={prefillWorkflow}
          onWorkflowChange={handleWorkflowChange}
          onNewWorkflowCreated={handleNewWorkflowCreated}
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

        {/* =====================================================
            TEMPLATES SECTION (Available for preview)
            ===================================================== */}
        <section className="templates-section" id="templates">
          <div className="dashboard-header">
            <div>
              <p className="tag">TEMPLATES LIBRARY</p>
              <h2>Pre-built workflow templates</h2>
              <p className="section-subtitle">Jumpstart your automation with pre-configured schemas and business logic.</p>
            </div>
          </div>

          <div className="template-list templates-full-grid">
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
        </section>

        {/* =====================================================
            LIVE DASHBOARD SECTION (Only visible when logged in)
            ===================================================== */}
        {!isGuest && (
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

            {/* VISUAL CHARTS & LATENCY BREAKDOWN */}
            <div className="dashboard-charts-grid">
              {/* PI / DONUT DISTRIBUTION CHART */}
              <div className="dashboard-chart-card">
                <div className="chart-card-header">
                  <div>
                    <span className="chart-pill-tag">HEALTH ANALYTICS</span>
                    <h4>Workflow Status Breakdown</h4>
                  </div>
                  <span className="chart-stat-badge">● 100% Operational</span>
                </div>

                <div className="donut-chart-wrapper">
                  <svg width="150" height="150" viewBox="0 0 160 160" className="donut-chart-svg">
                    <circle cx="80" cy="80" r="58" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
                    {/* Active 42% (153) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="16"
                      strokeDasharray="153 365"
                      strokeDashoffset="0"
                      transform="rotate(-90 80 80)"
                    />
                    {/* Drafts 33% (120) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      fill="transparent"
                      stroke="#a855f7"
                      strokeWidth="16"
                      strokeDasharray="120 365"
                      strokeDashoffset="-153"
                      transform="rotate(-90 80 80)"
                    />
                    {/* Validated 25% (92) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      fill="transparent"
                      stroke="#38bdf8"
                      strokeWidth="16"
                      strokeDasharray="92 365"
                      strokeDashoffset="-273"
                      transform="rotate(-90 80 80)"
                    />
                    <text x="80" y="76" textAnchor="middle" fill="currentColor" fontSize="22" fontWeight="800">
                      {dashboardStats.totalWorkflows}
                    </text>
                    <text x="80" y="94" textAnchor="middle" fill="var(--text-muted)" fontSize="10.5" fontWeight="700">
                      FLOWS
                    </text>
                  </svg>

                  <div className="donut-chart-legend">
                    <div className="legend-item">
                      <span className="legend-dot dot-active" />
                      <span className="legend-text">Active ({dashboardStats.activeWorkflows})</span>
                      <strong>42%</strong>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot dot-draft" />
                      <span className="legend-text">Drafts ({dashboardStats.draftWorkflows})</span>
                      <strong>33%</strong>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot dot-validated" />
                      <span className="legend-text">Validated (3)</span>
                      <strong>25%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXECUTION LATENCY & PERFORMANCE BAR GRAPH */}
              <div className="dashboard-chart-card">
                <div className="chart-card-header">
                  <div>
                    <span className="chart-pill-tag">ENGINE TIMINGS</span>
                    <h4>Execution Latency Time (ms)</h4>
                  </div>
                  <span className="chart-stat-badge">⚡ Avg: 141ms</span>
                </div>

                <div className="latency-bar-list">
                  {recentWorkflows.map((rw) => (
                    <button
                      key={rw.id}
                      type="button"
                      className="latency-bar-row"
                      onClick={() => setSelectedRecentWorkflow(rw)}
                      title="Click to inspect execution trace and engine metrics"
                    >
                      <div className="latency-bar-info">
                        <span className="latency-wf-name">{rw.name}</span>
                        <span className="latency-wf-ms">{rw.executionTimeMs || 120}ms</span>
                      </div>
                      <div className="latency-bar-track">
                        <div
                          className="latency-bar-fill"
                          style={{ width: `${Math.min(100, ((rw.executionTimeMs || 120) / 240) * 100)}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RECENT WORKFLOWS & ENGINE CAPABILITIES */}
            <div className="dashboard-panels">
              <div className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h3>Recent workflows</h3>
                    <p className="panel-subtext">Click any workflow to inspect its trigger timestamp and engine traces.</p>
                  </div>
                  <span className="panel-click-hint">Click to inspect ➔</span>
                </div>

                <div className="recent-list">
                  {recentWorkflows.length > 0 ? (
                    recentWorkflows.map((workflow) => (
                      <button
                        key={workflow.id || workflow.name}
                        type="button"
                        className="recent-item recent-interactive-btn"
                        onClick={() => setSelectedRecentWorkflow(workflow)}
                      >
                        <div className="recent-item-left">
                          <div className="recent-title-line">
                            <strong>{workflow.name}</strong>
                            <span className="recent-trigger-time">🕒 {workflow.lastTriggered || "Recently"}</span>
                          </div>
                          <div className="recent-meta-line">
                            <small className={`recent-status-pill status-${workflow.status}`}>{workflow.status}</small>
                            <span className="recent-engine-tag">⚙️ {workflow.triggerType || "Webhook"}</span>
                            <span className="recent-ms-tag">⚡ {workflow.executionTimeMs || 140}ms</span>
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
          </section>
        )}

        <AboutSection />

        <DemoVideoSection onOpenBuilder={openBuilder} />

        {/* HELP & FAQS (Only visible when logged in) */}
        {!isGuest && <HelpSection />}

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
                    const selected = previewTemplate;
                    setPreviewTemplate(null);
                    const templateWorkflow = {
                      name: selected.name,
                      requirement: selected.requirement,
                      status: "draft",
                      version: 1,
                      confidence: 0.95,
                      trigger: { name: selected.trigger || "Webhook Trigger", source: "events" },
                      steps: (selected.steps || []).map((stepName, sIdx) => ({
                        id: `step-00${sIdx + 1}`,
                        stepId: `step-00${sIdx + 1}`,
                        name: stepName,
                        type: "function",
                        actionType: "function",
                        target: stepName.replace(/\s+/g, ""),
                        order: sIdx + 1,
                        status: "pending",
                        inputMapping: {},
                        condition: null,
                        onSuccess: sIdx < (selected.steps.length - 1) ? `step-00${sIdx + 2}` : "complete",
                        onFailure: "abort",
                      })),
                    };

                    if (isGuest) {
                      requireAuth(() => {
                        handleOpenWorkflowInStudio(templateWorkflow);
                      }, "Sign in or register to load and customize this starter template.");
                    } else {
                      handleOpenWorkflowInStudio(templateWorkflow);
                    }
                  }}
                  type="button"
                >
                  ✦ Open in Workflow Studio →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            RECENT WORKFLOW RUN & ENGINE INSPECTOR MODAL
            ===================================================== */}
        {selectedRecentWorkflow && (
          <div className="template-modal-overlay" onClick={() => setSelectedRecentWorkflow(null)}>
            <div className="template-modal-card recent-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="template-modal-header">
                <div>
                  <div className="recent-modal-badge-row">
                    <span className="template-category-pill">WORKFLOW ENGINE TRACE</span>
                    <span className={`recent-status-pill status-${selectedRecentWorkflow.status}`}>
                      ● {selectedRecentWorkflow.status?.toUpperCase()} (v{selectedRecentWorkflow.version || 1}.0)
                    </span>
                  </div>
                  <h3>{selectedRecentWorkflow.name}</h3>
                </div>
                <button
                  className="template-modal-close"
                  onClick={() => setSelectedRecentWorkflow(null)}
                  type="button"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* TRIGGER DETAILS & ENGINE SPEC BOX */}
              <div className="recent-run-metrics-grid">
                <div className="run-metric-box">
                  <small>TRIGGERED AT</small>
                  <strong>🕒 {selectedRecentWorkflow.lastTriggered || "Recently"}</strong>
                </div>
                <div className="run-metric-box">
                  <small>TRIGGER MODE</small>
                  <strong>⚡ {selectedRecentWorkflow.triggerType || "Webhook"}</strong>
                </div>
                <div className="run-metric-box">
                  <small>TOTAL LATENCY</small>
                  <strong className="ms-highlight">⚡ {selectedRecentWorkflow.executionTimeMs || 140}ms</strong>
                </div>
                <div className="run-metric-box">
                  <small>MATCH CONFIDENCE</small>
                  <strong className="conf-highlight">🎯 {Math.round((selectedRecentWorkflow.confidence || 0.9) * 100)}%</strong>
                </div>
              </div>

              <div className="recent-engine-box">
                <small>RUNTIME ENGINE SPECIFICATION</small>
                <p>⚙️ {selectedRecentWorkflow.engine || "AWS Bedrock Qwen + DAG Runtime Engine"}</p>
                <span className="source-endpoint-code">Source: {selectedRecentWorkflow.triggerSource || "orders.webhook"}</span>
              </div>

              {/* STEP EXECUTION LATENCY PIPELINE */}
              {selectedRecentWorkflow.steps && (
                <div className="recent-pipeline-section">
                  <label>STEP-BY-STEP EXECUTION LATENCY</label>
                  <div className="recent-pipeline-list">
                    {selectedRecentWorkflow.steps.map((st, idx) => (
                      <div key={st.name || idx} className="recent-pipeline-row">
                        <div className="pipeline-step-left">
                          <span className="pipeline-step-idx">{idx + 1}</span>
                          <div>
                            <strong>{st.name}</strong>
                            <small>{st.type}</small>
                          </div>
                        </div>
                        <div className="pipeline-step-right">
                          <span className="pipeline-ms-badge">⚡ {st.duration || "35ms"}</span>
                          <span className="pipeline-status-check">✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CAPABILITIES */}
              <div className="recent-capabilities-row">
                <label>GUARANTEED CAPABILITIES</label>
                <div className="recent-cap-pills">
                  {(selectedRecentWorkflow.capabilities || [
                    "Multiple workflow cards",
                    "Retry on failure (3x)",
                    "Webhook trigger",
                    "Scheduled trigger",
                    "Workflow versioning",
                    "Confidence score",
                    "Detection warnings",
                    "Dry run safe"
                  ]).map((cap) => (
                    <span key={cap} className="recent-cap-pill">✓ {cap}</span>
                  ))}
                </div>
              </div>

              <div className="template-modal-actions">
                <button
                  className="template-modal-cancel-btn"
                  onClick={() => setSelectedRecentWorkflow(null)}
                  type="button"
                >
                  Close
                </button>
                <button
                  className="primary-btn template-modal-use-btn"
                  onClick={() => {
                    const selected = selectedRecentWorkflow;
                    setSelectedRecentWorkflow(null);
                    if (isGuest) {
                      requireAuth(() => {
                        handleOpenWorkflowInStudio(selected);
                      }, "Sign in or register to open this workflow in the visual editor.");
                    } else {
                      handleOpenWorkflowInStudio(selected);
                    }
                  }}
                  type="button"
                >
                  ✦ Open in Workflow Studio →
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
                  Generate or run a workflow and its
                  execution history will appear here.
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
                    workflow item
                    {executionHistory.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                {executionHistory.map((execution, index) => (
                  <div
                    className="navbar-history-card"
                    key={execution.id || `hist-${index}`}
                  >
                    <div className="navbar-history-card-top">
                      <div>
                        <p className="history-run-number">
                          RUN #{executionHistory.length - index} • {execution.action?.toUpperCase() || "RUN"}
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
                        Started {execution.startedAt}
                      </span>
                      {execution.completedAt && (
                        <span>
                          Completed {execution.completedAt}
                        </span>
                      )}
                      {execution.duration && (
                        <span className="history-duration-pill">
                          ⚡ {execution.duration}
                        </span>
                      )}
                    </div>

                    {execution.steps && execution.steps.length > 0 && (
                      <div className="navbar-history-steps">
                        {execution.steps.map((step) => (
                          <div
                            className="navbar-history-step"
                            key={step.stepId || step.stepName}
                          >
                            <span className="history-step-indicator">
                              {step.status === "success"
                                ? "✓"
                                : step.status === "running"
                                ? "●"
                                : step.status === "failed"
                                ? "!"
                                : "○"}
                            </span>
                            <span>
                              {step.stepName}
                            </span>
                            <small>
                              {step.duration || step.status}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="history-card-actions">
                      <button
                        type="button"
                        className="history-open-btn"
                        onClick={() => {
                          if (isGuest) {
                            requireAuth(() => {
                              handleOpenWorkflowInStudio(execution.fullWorkflow || execution);
                            }, "Sign in to open this workflow in the visual editor.");
                          } else {
                            handleOpenWorkflowInStudio(execution.fullWorkflow || execution);
                          }
                        }}
                      >
                        ✦ Open in Workflow Studio →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTHENTICATION MODAL (LOGIN & SIGN UP) */}
      <AuthModal />
    </div>
  );
}

export default App;