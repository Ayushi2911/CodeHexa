function SparkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
      <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </svg>
  );
}

function WorkflowIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <path d="M10 6.5h3a3 3 0 0 1 3 3v4.5" />
      <path d="M16 14h-3a3 3 0 0 0-3 3v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 12h8" />
      <path d="M10 8V5" />
      <path d="M14 8V5" />
      <path d="M8 12a4 4 0 0 0 8 0" />
      <path d="M12 16v3" />
    </svg>
  );
}

function Hero({ onOpenBuilder }) {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          AI-POWERED WORKFLOW AUTOMATION
        </div>

        <h1>
          Build smarter workflows.
          <span> Automate everything.</span>
        </h1>

        <p className="hero-description">
          Transform business requirements into intelligent, structured
          workflows. Design, validate, visualize, and prepare every flow
          for execution from one powerful workspace.
        </p>

        <div className="hero-buttons">
          <button
            className="primary-btn hero-primary-btn"
            onClick={onOpenBuilder}
          >
            Start Building
            <span>→</span>
          </button>

          <a
            href="#features"
            className="secondary-btn hero-secondary-btn"
          >
            Explore Templates
          </a>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>10K+</strong>
            <span>Workflows</span>
          </div>

          <div className="hero-stat-divider" />

          <div className="hero-stat">
            <strong>99.9%</strong>
            <span>Validation</span>
          </div>

          <div className="hero-stat-divider" />

          <div className="hero-stat">
            <strong>24/7</strong>
            <span>Automation</span>
          </div>

          <div className="hero-stat-divider" />

          <div className="hero-stat">
            <strong>50+</strong>
            <span>Integrations</span>
          </div>
        </div>
      </div>

      {/* Futuristic workflow visual */}
      <div className="hero-visual">
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />

        <div className="hero-glow" />

        <div className="hero-workflow-stage">
          {/* Floating card: AI ENGINE (Top-Left corner overlap) */}
          <div className="hero-floating-card floating-ai">
            <div className="floating-icon">
              <SparkIcon />
            </div>

            <div>
              <span>AI ENGINE</span>
              <strong>Active</strong>
            </div>

            <div className="live-dot" />
          </div>

          {/* Floating card: REAL-TIME VALIDATION (Right edge overlap) */}
          <div className="hero-floating-card floating-validation">
            <div className="floating-icon blue-icon">
              <CheckIcon />
            </div>

            <div>
              <span>REAL-TIME</span>
              <strong>Validation</strong>
            </div>
          </div>

          {/* Floating card: SEAMLESS INTEGRATIONS (Left edge overlap) */}
          <div className="hero-floating-card floating-integrations">
            <div className="floating-icon">
              <PlugIcon />
            </div>

            <div>
              <span>SEAMLESS</span>
              <strong>Integrations</strong>
            </div>
          </div>

          {/* Main glass workflow shell */}
          <div className="hero-workflow-shell">
            <div className="hero-workflow-top">
              <div className="workflow-window-dots">
                <span />
                <span />
                <span />
              </div>

              <div className="workflow-window-title">
                <WorkflowIcon />
                <span>Workflow Engine</span>
              </div>

              <div className="workflow-status">
                <span />
                LIVE
              </div>
            </div>

            <div className="hero-workflow-content">
              <div className="workflow-mini-card step-card-1 trigger-mini">
                <div className="mini-number">01</div>

                <div className="mini-icon">
                  <SparkIcon />
                </div>

                <div>
                  <span className="card-tag">TRIGGER</span>
                  <strong className="card-title">Order Placed</strong>
                </div>
              </div>

              <div className="workflow-connector flow-connector-1">
                <svg
                  width="14"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="arrow-svg"
                >
                  <line x1="12" y1="2" x2="12" y2="18" />
                  <polyline points="7 13 12 18 17 13" />
                </svg>
              </div>

              <div className="workflow-mini-card step-card-2 active-mini">
                <div className="mini-number">02</div>

                <div className="mini-icon purple-mini">
                  <WorkflowIcon />
                </div>

                <div>
                  <span className="card-tag">ACTION</span>
                  <strong className="card-title">Create Invoice</strong>
                </div>
              </div>

              <div className="workflow-connector flow-connector-2">
                <svg
                  width="14"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="arrow-svg"
                >
                  <line x1="12" y1="2" x2="12" y2="18" />
                  <polyline points="7 13 12 18 17 13" />
                </svg>
              </div>

              <div className="workflow-mini-card step-card-3 function-mini">
                <div className="mini-number">03</div>

                <div className="mini-icon blue-mini">
                  <CheckIcon />
                </div>

                <div>
                  <span className="card-tag">FUNCTION</span>
                  <strong className="card-title">Send Confirmation</strong>
                </div>
              </div>
            </div>

            <div className="hero-workflow-footer">
              <span>
                <i />
                Workflow validated
              </span>

              <span>3 STEPS</span>
            </div>
          </div>

          {/* Floating card: VISUAL WORKFLOW BUILDER (Bottom-Right corner overlap) */}
          <div className="hero-floating-card floating-builder hero-builder-label">
            <span className="floating-icon purple-icon">
              <WorkflowIcon />
            </span>

            <div>
              <span>VISUAL WORKFLOW BUILDER</span>
              <strong>Design. Validate. Automate.</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
