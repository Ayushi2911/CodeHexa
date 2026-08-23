function Navbar({
  onOpenBuilder,
  onOpenHistory,
  activeSection = "home",
  theme = "dark",
  onToggleTheme,
}) {
  return (
    <nav className="navbar">
      <a className="logo" href="#home">
        <span className="logo-mark">✦</span>
        CodeHexa<span>Flow</span>
      </a>

      <div className="nav-links">
        <a
          href="#home"
          className={`nav-link ${activeSection === "home" ? "active" : ""}`}
        >
          Home
        </a>
        <a
          href="#builder"
          className={`nav-link ${activeSection === "builder" ? "active" : ""}`}
        >
          Workflows
        </a>
        <a
          href="#templates"
          className={`nav-link ${activeSection === "templates" ? "active" : ""}`}
        >
          Templates
        </a>
        <a
          href="#features"
          className={`nav-link ${activeSection === "features" ? "active" : ""}`}
        >
          Features
        </a>
        <a
          href="#dashboard"
          className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
        >
          Dashboard
        </a>
        <a
          href="#about"
          className={`nav-link ${activeSection === "about" ? "active" : ""}`}
        >
          About
        </a>
        <a
          href="#demo"
          className={`nav-link ${activeSection === "demo" ? "active" : ""}`}
        >
          Demo
        </a>
        <a
          href="#help"
          className={`nav-link ${activeSection === "help" ? "active" : ""}`}
        >
          Help
        </a>
        <a
          href="#contact"
          className={`nav-link ${activeSection === "contact" ? "active" : ""}`}
        >
          Contact
        </a>

        <button
          className="history-btn"
          onClick={onOpenHistory}
          type="button"
        >
          History
        </button>
      </div>

      <div className="navbar-actions">
        <button
          className="theme-btn"
          onClick={onToggleTheme}
          type="button"
          aria-label="Toggle Theme"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          <span className="theme-icon">
            {theme === "dark" ? "☀️" : "🌙"}
          </span>
          <span className="theme-text">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </button>

        <button
          className="login-btn"
          onClick={onOpenBuilder}
          type="button"
        >
          Open Studio
          <span className="nav-arrow">→</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
