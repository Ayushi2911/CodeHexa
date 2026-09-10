import { useAuth } from "../context/AuthContext";

function Navbar({
  onOpenBuilder,
  onOpenHistory,
  activeSection = "home",
}) {
  const { user, isGuest, openLogin, openRegister, logout, openProfileModal, openSettings, activeStandalonePage, closeStandalonePage } = useAuth();

  const scrollTo = (e, targetId) => {
    e.preventDefault();
    if (activeStandalonePage) {
      closeStandalonePage();
    }
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        const navOffset = 62;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        window.history.pushState(null, "", `#${targetId}`);
      }
    }, activeStandalonePage ? 50 : 0);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const homeOrDashboardId = isGuest ? "home" : "dashboard";
  const homeOrDashboardLabel = isGuest ? "Home" : "Dashboard";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a
          className="logo"
          href={`#${homeOrDashboardId}`}
          onClick={(e) => scrollTo(e, homeOrDashboardId)}
        >
          <span className="logo-mark">✦</span>
          CodeHexa<span>Flow</span>
        </a>

        <div className="nav-links">
          {/* 1. Home (Guest) or Dashboard (Logged in) */}
          <a
            href={`#${homeOrDashboardId}`}
            onClick={(e) => scrollTo(e, homeOrDashboardId)}
            className={`nav-link ${
              activeSection === (isGuest ? "home" : "dashboard") ? "active" : ""
            }`}
          >
            {homeOrDashboardLabel}
          </a>

          {/* 2. Workflows (Workflow Studio) */}
          <a
            href="#builder"
            onClick={(e) => scrollTo(e, "builder")}
            className={`nav-link ${activeSection === "builder" ? "active" : ""}`}
          >
            Workflows
          </a>

          {/* 3. History (Opens History Drawer right after Workflows) */}
          <button
            className="nav-link nav-history-btn"
            onClick={onOpenHistory}
            type="button"
            title="View Workflow Execution History"
          >
            History
          </button>

          {/* 4. Templates */}
          <a
            href="#templates"
            onClick={(e) => scrollTo(e, "templates")}
            className={`nav-link ${activeSection === "templates" ? "active" : ""}`}
          >
            Templates
          </a>

          {/* 5. Features (Guest Only - Logged in users have focused workspace) */}
          {isGuest && (
            <a
              href="#features"
              onClick={(e) => scrollTo(e, "features")}
              className={`nav-link ${activeSection === "features" ? "active" : ""}`}
            >
              Features
            </a>
          )}

          {/* 5 (Logged in) or 6 (Guest). Demo */}
          <a
            href="#demo"
            onClick={(e) => scrollTo(e, "demo")}
            className={`nav-link ${activeSection === "demo" ? "active" : ""}`}
          >
            Demo
          </a>

          {/* Guest-only Informational Pages (Logged-in users access these via Settings) */}
          {isGuest && (
            <>
              {/* 7. About */}
              <a
                href="#about"
                onClick={(e) => scrollTo(e, "about")}
                className={`nav-link ${activeSection === "about" ? "active" : ""}`}
              >
                About
              </a>

              {/* 8. Contact */}
              <a
                href="#contact"
                onClick={(e) => scrollTo(e, "contact")}
                className={`nav-link ${activeSection === "contact" ? "active" : ""}`}
              >
                Contact
              </a>

              {/* 9. Help */}
              <a
                href="#help"
                onClick={(e) => scrollTo(e, "help")}
                className={`nav-link ${activeSection === "help" ? "active" : ""}`}
              >
                Help
              </a>
            </>
          )}
        </div>
      </div>

      <div className="navbar-actions">
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
            <button
              className="nav-settings-btn"
              onClick={() => openSettings("appearance")}
              type="button"
              title="Open Settings (Appearance, Account, Data & Storage, Notifications, Support)"
            >
              <span className="settings-btn-icon">⚙️</span>
              <span className="settings-btn-text">Settings</span>
            </button>

            <button
              className="nav-user-profile-chip"
              onClick={() => openSettings("account")}
              type="button"
              title={`Click to manage profile: ${user?.name || "User"} (${user?.email || ""})`}
            >
              <span className="user-avatar-circle">{getInitials(user?.name)}</span>
              <div className="user-name-col">
                <strong className="nav-user-name">{user?.name || "User"}</strong>
                <small className="nav-user-loc">
                  {user?.location ? `${user.location}, ` : ""}
                  {user?.country || "Global"}
                </small>
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
    </nav>
  );
}

export default Navbar;

