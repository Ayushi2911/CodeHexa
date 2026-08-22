function Hero({ onOpenBuilder }) {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="tag">AI-POWERED WORKFLOW AUTOMATION</p>

        <h1>
          Build smarter workflows.
          <span> Automate everything.</span>
        </h1>

        <p className="hero-description">
          Transform business requirements into structured workflows.
          Visualize every step, edit the flow, validate it, and prepare it
          for execution from one platform.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn" onClick={onOpenBuilder}>
            Build Workflow
          </button>

          <a href="#features" className="secondary-btn">
            Explore Features
          </a>
        </div>
      </div>

      <div className="hero-visual">
        <div className="workflow-card card-1">
          <span>TRIGGER</span>
          <p>Order Placed</p>
        </div>

        <div className="arrow">↓</div>

        <div className="workflow-card card-2">
          <span>ACTION</span>
          <p>Create Invoice</p>
        </div>

        <div className="arrow">↓</div>

        <div className="workflow-card card-3">
          <span>FUNCTION</span>
          <p>Send Confirmation</p>
        </div>
      </div>
    </section>
  );
}

export default Hero;