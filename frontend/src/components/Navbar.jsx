function Navbar({ onOpenBuilder }) {
  return (
    <nav className="navbar">
      <div className="logo">
        Workflow<span>AI</span>
      </div>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#builder">Workflow Builder</a>
        <a href="#features">Features</a>
      </div>

      <button className="login-btn" onClick={onOpenBuilder}>
        Open Studio
      </button>
    </nav>
  );
}

export default Navbar;