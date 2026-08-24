import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar({
  onOpenBuilder,
  onOpenHistory,
  activeSection = "home",
  theme = "dark",
  onToggleTheme,
}) {
  const { user, isGuest, openLogin, openRegister, logout, openProfileModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollTo = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
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
      <div className="nav-container">
        <a className="logo" href="#home" onClick={(e) => scrollTo(e, "home")}>
          <span className="logo-mark">✦</span>
          CodeHexa<span>Flow</span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-nav-links">
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
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenHistory();
              }}
              type="button"
            >
              History
            </button>
          )}
        </div>

        {/* Navbar Actions & Auth */}
        <div className="navbar-actions desktop-actions">
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
                ● Guest
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
              <button
                className="nav-user-profile-chip"
                onClick={openProfileModal}
                type="button"
                title={`Click to manage profile: ${user.name} (${user.email})`}
              >
                <span className="user-avatar-circle">{getInitials(user.name)}</span>
                <div className="user-name-col">
                  <strong className="nav-user-name">{user.name}</strong>
                  <small className="nav-user-loc">{user.location ? `${user.location}, ` : ""}{user.country || "Global"}</small>
                </div>
                <span className="profile-chip-arrow">▾</span>
              </button>
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

        {/* Mobile Hamburger Button */}
        <div className="mobile-nav-toggle-wrap">
          <button
            className="theme-btn mobile-theme-btn"
            onClick={onToggleTheme}
            type="button"
            aria-label="Toggle Theme"
          >
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>
          
          <button
            className={`nav-mobile-toggle ${isMobileMenuOpen ? "open" : ""}`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            type="button"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-auth-header">
              {isGuest ? (
                <div className="mobile-guest-block">
                  <div className="mobile-guest-badge">● Guest Mode Active</div>
                  <div className="mobile-auth-actions">
                    <button
                      className="nav-login-btn full-width"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openLogin("Sign in to your CodeHexa Flow account");
                      }}
                      type="button"
                    >
                      Log In
                    </button>
                    <button
                      className="nav-signup-btn full-width"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openRegister("Create your free CodeHexa Flow account");
                      }}
                      type="button"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mobile-user-block">
                  <div
                    className="mobile-user-info-row"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openProfileModal();
                    }}
                  >
                    <span className="user-avatar-circle">{getInitials(user.name)}</span>
                    <div className="user-name-col">
                      <strong className="nav-user-name">{user.name}</strong>
                      <small className="nav-user-loc">{user.email}</small>
                    </div>
                    <span className="profile-chip-arrow">➔</span>
                  </div>
                  <button
                    className="nav-logout-btn mobile-logout-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    type="button"
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>

            <div className="mobile-nav-links-list">
              <a
                href="#home"
                onClick={(e) => scrollTo(e, "home")}
                className={`mobile-nav-item ${activeSection === "home" ? "active" : ""}`}
              >
                🏠 Home
              </a>
              <a
                href="#builder"
                onClick={(e) => scrollTo(e, "builder")}
                className={`mobile-nav-item ${activeSection === "builder" ? "active" : ""}`}
              >
                ⚡ Workflows Studio
              </a>
              <a
                href="#templates"
                onClick={(e) => scrollTo(e, "templates")}
                className={`mobile-nav-item ${activeSection === "templates" ? "active" : ""}`}
              >
                📦 Templates Library
              </a>
              <a
                href="#features"
                onClick={(e) => scrollTo(e, "features")}
                className={`mobile-nav-item ${activeSection === "features" ? "active" : ""}`}
              >
                ✨ Features
              </a>

              {!isGuest && (
                <a
                  href="#dashboard"
                  onClick={(e) => scrollTo(e, "dashboard")}
                  className={`mobile-nav-item ${activeSection === "dashboard" ? "active" : ""}`}
                >
                  📊 Analytics Dashboard
                </a>
              )}

              <a
                href="#about"
                onClick={(e) => scrollTo(e, "about")}
                className={`mobile-nav-item ${activeSection === "about" ? "active" : ""}`}
              >
                ℹ️ About Platform
              </a>
              <a
                href="#demo"
                onClick={(e) => scrollTo(e, "demo")}
                className={`mobile-nav-item ${activeSection === "demo" ? "active" : ""}`}
              >
                🎬 Interactive Demo
              </a>

              {!isGuest && (
                <a
                  href="#help"
                  onClick={(e) => scrollTo(e, "help")}
                  className={`mobile-nav-item ${activeSection === "help" ? "active" : ""}`}
                >
                  ❓ Help & FAQ
                </a>
              )}

              <a
                href="#contact"
                onClick={(e) => scrollTo(e, "contact")}
                className={`mobile-nav-item ${activeSection === "contact" ? "active" : ""}`}
              >
                ✉️ Contact Support
              </a>

              {!isGuest && (
                <button
                  className="mobile-nav-item mobile-history-item"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenHistory();
                  }}
                  type="button"
                >
                  📜 Workflow Run History
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

