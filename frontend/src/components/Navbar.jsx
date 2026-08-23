function Navbar({ onOpenBuilder, onOpenHistory }) {
  return (
    <nav className="navbar">
      <a className="logo" href="#home">
        <span className="logo-mark">✦</span>
        CodeHexa<span>Flow</span>
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#builder">Workflows</a>
        <a href="#templates">Templates</a>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#docs">Docs</a>

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
          type="button"
          aria-label="Toggle theme"
        >
          ◐
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