function Navbar({
  onOpenBuilder,
  onOpenHistory,
  activeSection = "home",
  theme = "dark",
  onToggleTheme,
}) {
  const scrollTo = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      const navOffset = 75;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  return (
    <nav className="navbar">
      <a className="logo" href="#home" onClick={(e) => scrollTo(e, "home")}>
        <span className="logo-mark">✦</span>
        CodeHexa<span>Flow</span>
      </a>

      <div className="nav-links">
        <a
          href="#home"
          onClick={(e) => scrollTo(e, "home")}
          className={`nav-link ${activeSection === "home" ? "active" : ""}`}
        >
          Home
        </a>
        <a
          href="#builder"
          onClick={(e) => scrollTo(e, "builder")}
          className={`nav-link ${activeSection === "builder" ? "active" : ""}`}
        >
          Workflows
        </a>
        <a
          href="#templates"
          onClick={(e) => scrollTo(e, "templates")}
          className={`nav-link ${activeSection === "templates" ? "active" : ""}`}
        >
          Templates
        </a>
        <a
          href="#features"
          onClick={(e) => scrollTo(e, "features")}
          className={`nav-link ${activeSection === "features" ? "active" : ""}`}
        >
          Features
        </a>
        <a
          href="#dashboard"
          onClick={(e) => scrollTo(e, "dashboard")}
          className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
        >
          Dashboard
        </a>
        <a
          href="#about"
          onClick={(e) => scrollTo(e, "about")}
          className={`nav-link ${activeSection === "about" ? "active" : ""}`}
        >
          About
        </a>
        <a
          href="#demo"
          onClick={(e) => scrollTo(e, "demo")}
          className={`nav-link ${activeSection === "demo" ? "active" : ""}`}
        >
          Demo
        </a>
        <a
          href="#help"
          onClick={(e) => scrollTo(e, "help")}
          className={`nav-link ${activeSection === "help" ? "active" : ""}`}
        >
          Help
        </a>
        <a
          href="#contact"
          onClick={(e) => scrollTo(e, "contact")}
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
