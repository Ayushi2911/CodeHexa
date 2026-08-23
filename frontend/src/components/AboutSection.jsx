function AboutSection() {
  const pillars = [
    {
      icon: "✦",
      title: "Prompt-to-Workflow AI",
      description:
        "CodeHexa Flow interprets complex natural-language business logic and converts it into structured, production-ready execution graphs in seconds.",
    },
    {
      icon: "🛡️",
      title: "Zero-Shot Graph Validation",
      description:
        "Built-in static analysis catches circular dependencies, missing required input mappings, and unreachable paths before code ever runs.",
    },
    {
      icon: "⚡",
      title: "Hybrid Inference Engine",
      description:
        "Seamlessly pairs deterministic rule-based parsing with AWS Bedrock Qwen LLMs for enterprise accuracy, speed, and offline resilience.",
    },
    {
      icon: "🔌",
      title: "Universal Integrations",
      description:
        "Plug-and-play connectors for REST APIs, databases, webhooks, notification services, and cloud functions without writing boilerplate code.",
    },
  ];

  return (
    <section className="about-section" id="about">
      <div className="about-header">
        <div className="features-eyebrow">
          <span className="features-eyebrow-dot" />
          ABOUT CODEHEXA FLOW
        </div>

        <h2>Building the future of intelligent workflow automation</h2>

        <p className="about-subtitle">
          CodeHexa Flow is an enterprise-grade visual workflow platform designed
          to bridge the gap between human intent and automated software execution.
        </p>
      </div>

      <div className="about-story-grid">
        <div className="about-story-card">
          <div className="story-badge">WHAT IT IS</div>
          <h3>An Autonomous Workflow Engine</h3>
          <p>
            CodeHexa Flow transforms raw business requirements—like <em>"When an order is placed, generate an invoice and notify shipping"</em>—into executable, modular directed graphs with automated trigger, action, and validation steps.
          </p>
          <div className="story-metrics">
            <div className="story-metric-item">
              <strong>10x</strong>
              <span>Faster Workflow Design</span>
            </div>
            <div className="story-metric-item">
              <strong>99.9%</strong>
              <span>Graph Reliability</span>
            </div>
            <div className="story-metric-item">
              <strong>0</strong>
              <span>Boilerplate Setup</span>
            </div>
          </div>
        </div>

        <div className="about-story-card">
          <div className="story-badge purple-badge">WHAT IT DOES</div>
          <h3>Design. Validate. Automate.</h3>
          <ul className="about-features-list">
            <li>
              <span className="check-icon">✓</span>
              <span><strong>Natural Language Ingestion:</strong> Speak or type business requirements naturally.</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span><strong>Visual Interactive Graph:</strong> Inspect and drag nodes with live status indicators.</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span><strong>AI Modification Copilot:</strong> Request step changes, approvals, or filters on the fly.</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span><strong>One-Click JSON Export & Execution:</strong> Deploy to production or run in sandbox.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="about-pillars-grid">
        {pillars.map((pillar, idx) => (
          <div className="about-pillar-card" key={idx}>
            <div className="pillar-icon">{pillar.icon}</div>
            <h4>{pillar.title}</h4>
            <p>{pillar.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AboutSection;
