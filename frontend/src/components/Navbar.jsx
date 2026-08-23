function Navbar({ onOpenBuilder, onOpenHistory }) {
  return (
    <nav className="navbar">
      <div className="logo">
        CodeHexa<span>Flow</span>
      </div>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#builder">Workflow Builder</a>
        <a href="#features">Features</a>

        <button
          className="history-btn"
          onClick={onOpenHistory}
          type="button"
        >
          History
        </button>
      </div>

      <button
        className="login-btn"
        onClick={onOpenBuilder}
        type="button"
      >
        Open Studio
      </button>
    </nav>
  );
}

export default Navbar;