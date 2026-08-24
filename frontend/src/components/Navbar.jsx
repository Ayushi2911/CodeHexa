import { useAuth } from "../context/AuthContext";

function Navbar({
  onOpenBuilder,
  onOpenHistory,
  activeSection = "home",
  theme = "dark",
  onToggleTheme,
}) {
  const { user, isGuest, openLogin, openRegister, logout } = useAuth();

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

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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

        {!isGuest && (
          <a
            href="#dashboard"
            onClick={(e) => scrollTo(e, "dashboard")}
            className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
          >
            Dashboard
          </a>
        )}

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

        {!isGuest && (
          <a
            href="#help"
            onClick={(e) => scrollTo(e, "help")}
            className={`nav-link ${activeSection === "help" ? "active" : ""}`}
          >
            Help
          </a>
        )}

        <a
          href="#contact"
          onClick={(e) => scrollTo(e, "contact")}
          className={`nav-link ${activeSection === "contact" ? "active" : ""}`}
        >
          Contact
        </a>

        {!isGuest && (
          <button
            className="history-btn"
            onClick={onOpenHistory}
            type="button"
          >
            History
          </button>
        )}
      </div>

      <div className="navbar-actions">
        {/* Theme Toggle */}
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
        </button>

        {/* Guest Mode vs Logged In Actions */}
        {isGuest ? (
          <div className="nav-auth-group">
            <span className="nav-guest-pill" title="You are currently browsing as a guest">
              ● Guest Mode
            </span>
            <button
              className="nav-login-btn"
              onClick={() => openLogin("Sign in to your CodeHexa Flow account")}
              type="button"
            >
              Log In
            </button>
            <button
              className="nav-signup-btn"
              onClick={() => openRegister("Create your free CodeHexa Flow account")}
              type="button"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="nav-user-group">
            <div className="nav-user-profile-chip" title={`${user.name} (${user.email}) - ${user.country || "Global"}`}>
              <span className="user-avatar-circle">{getInitials(user.name)}</span>
              <div className="user-name-col">
                <strong className="nav-user-name">{user.name}</strong>
                <small className="nav-user-loc">{user.location ? `${user.location}, ` : ""}{user.country || "Global"}</small>
              </div>
            </div>
            <button
              className="nav-logout-btn"
              onClick={logout}
              type="button"
              title="Sign out to Guest Mode"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

