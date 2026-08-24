function Footer({ onOpenBuilder, onOpenHistory, theme, onToggleTheme }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a className="footer-logo" href="#home">
            <span className="logo-mark">✦</span>
            CodeHexa<span>Flow</span>
          </a>
          <p className="footer-tagline">
            Next-generation autonomous visual workflow automation. Design, validate, and execute complex business graphs with prompt-driven AI intelligence.
          </p>
          <div className="footer-status-pill">
            <span className="live-dot" />
            <span>Systems Normal (API v1.0.0 & Bedrock Online)</span>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#builder">Workflow Builder</a>
            <a href="#templates">Starter Templates</a>
            <a href="#features">Platform Features</a>
            <a href="#dashboard">Live Dashboard</a>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#help">Help & Documentation</a>
            <a href="#help">Quickstart Guide</a>
            <a href="#help">FAQs</a>
            <button
              type="button"
              className="footer-link-btn"
              onClick={onOpenHistory}
            >
              Execution History
            </button>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">About Us</a>
            <a href="#contact">Contact Us</a>
            <a href="#contact">Enterprise Solutions</a>
            <a href="#about">Our Mission</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} CodeHexa Flow. All rights reserved.</p>

        <div className="footer-actions">
          <button
            type="button"
            className="footer-theme-toggle"
            onClick={onToggleTheme}
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <a href="#home" className="back-to-top">
            Back to Top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
