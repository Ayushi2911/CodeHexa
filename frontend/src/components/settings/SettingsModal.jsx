import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { workflowApi } from "../../services/api";

const COUNTRIES_LIST = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "United Arab Emirates",
  "Singapore",
  "Netherlands",
  "Brazil",
  "Other"
];

function SettingsModal({
  theme,
  currentTheme,
  onThemeChange,
  onWorkflowRestored,
  onRefreshWorkflows,
}) {
  const activeTheme = currentTheme || theme || "dark";
  const handleNotifyRefresh = () => {
    if (onWorkflowRestored) onWorkflowRestored();
    if (onRefreshWorkflows) onRefreshWorkflows();
  };
  const {
    user,
    showSettingsModal,
    settingsActiveTab,
    closeSettings,
    setSettingsActiveTab,
    updateUserProfile,
    changePassword,
    deleteAccount,
    logout,
    openStandalonePage,
  } = useAuth();

  const [activeTab, setActiveTab] = useState(settingsActiveTab || "appearance");

  // Synchronize incoming tab prop
  useEffect(() => {
    if (settingsActiveTab) {
      setActiveTab(settingsActiveTab);
    }
  }, [settingsActiveTab]);

  /* =========================================================================
     1. ACCOUNT & PROFILE STATE
     ========================================================================= */
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    country: "",
    location: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        country: user.country || "",
        location: user.location || "",
      });
      setProfileError("");
      setProfileSuccess("");
      setPasswordError("");
      setPasswordSuccess("");
    }
  }, [user, showSettingsModal]);

  /* =========================================================================
     2. DATA & TRASH STATE
     ========================================================================= */
  const [trashList, setTrashList] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashMessage, setTrashMessage] = useState("");
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [accountDeleteLoading, setAccountDeleteLoading] = useState(false);

  const fetchTrashWorkflows = async () => {
    setTrashLoading(true);
    try {
      const res = await workflowApi.getTrash();
      if (res.data?.ok && res.data?.data?.workflows) {
        setTrashList(res.data.data.workflows);
      } else {
        // Fallback demo items if any
        setTrashList([]);
      }
    } catch (err) {
      console.warn("Could not fetch trash:", err);
      setTrashList([]);
    } finally {
      setTrashLoading(false);
    }
  };

  useEffect(() => {
    if (showSettingsModal && activeTab === "data") {
      fetchTrashWorkflows();
    }
  }, [showSettingsModal, activeTab]);

  const handleRestoreWorkflow = async (workflowId) => {
    try {
      const res = await workflowApi.restoreWorkflow(workflowId);
      if (res.data?.ok) {
        setTrashMessage("✓ Workflow restored to active workflows!");
        setTrashList((prev) => prev.filter((w) => (w.id || w._id) !== workflowId));
        handleNotifyRefresh();
        setTimeout(() => setTrashMessage(""), 3500);
      }
    } catch (err) {
      console.error("Failed to restore workflow:", err);
      setTrashMessage("Failed to restore workflow.");
    }
  };

  const handlePermanentDelete = async (workflowId) => {
    if (!window.confirm("Are you sure you want to delete this workflow permanently? This cannot be undone.")) {
      return;
    }

    try {
      const res = await workflowApi.permanentDelete(workflowId);
      if (res.data?.ok) {
        setTrashMessage("Workflow permanently deleted.");
        setTrashList((prev) => prev.filter((w) => (w.id || w._id) !== workflowId));
        handleNotifyRefresh();
        setTimeout(() => setTrashMessage(""), 3500);
      }
    } catch (err) {
      console.error("Failed to permanently delete workflow:", err);
      setTrashMessage("Failed to delete workflow permanently.");
    }
  };

  const handleExportAllData = async () => {
    setIsExportingAll(true);
    try {
      const res = await workflowApi.exportAll();
      const exportData = res.data || {};
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `codehexa_all_data_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setTrashMessage("✓ All workflow data successfully exported.");
      setTimeout(() => setTrashMessage(""), 3500);
    } catch (err) {
      console.error("Export all failed:", err);
      setTrashMessage("Export failed. Please try again.");
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleDeleteUserAccount = async () => {
    setAccountDeleteLoading(true);
    const res = await deleteAccount();
    setAccountDeleteLoading(false);
    if (res.success) {
      closeSettings();
    } else {
      alert(res.error || "Failed to delete account.");
    }
  };

  /* =========================================================================
     3. NOTIFICATIONS STATE
     ========================================================================= */
  const [notificationsPrefs, setNotificationsPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("codehexa_notif_prefs");
      return saved
        ? JSON.parse(saved)
        : {
            workflowGen: true,
            executionRuns: true,
            systemAlerts: true,
            retryAlerts: true,
          };
    } catch {
      return {
        workflowGen: true,
        executionRuns: true,
        systemAlerts: true,
        retryAlerts: true,
      };
    }
  });

  const handleToggleNotif = (key) => {
    setNotificationsPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("codehexa_notif_prefs", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };



  if (!showSettingsModal) return null;

  /* =========================================================================
     SUBMIT HANDLERS
     ========================================================================= */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.name.trim()) {
      setProfileError("Name cannot be empty.");
      return;
    }
    if (!profileForm.email.trim() || !profileForm.email.includes("@")) {
      setProfileError("A valid email is required.");
      return;
    }

    setProfileSaving(true);
    const res = await updateUserProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
      gender: profileForm.gender,
      country: profileForm.country.trim(),
      location: profileForm.location.trim(),
    });
    setProfileSaving(false);

    if (res.success) {
      setProfileSuccess(res.message || "Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } else {
      setProfileError(res.error || "Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    const res = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setPasswordSaving(false);

    if (res.success) {
      setPasswordSuccess(res.message || "Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(""), 4000);
    } else {
      setPasswordError(res.error || "Failed to update password.");
    }
  };

  return (
    <div className="auth-modal-overlay settings-modal-overlay" onClick={closeSettings}>
      <div
        className="settings-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        {/* =========================================================
            LEFT COLUMN: MODERN SAAS SETTINGS SIDEBAR NAVIGATION
            ========================================================= */}
        <aside className="settings-sidebar">
          <div className="settings-sidebar-header">
            <div className="settings-brand-badge">
              <span className="settings-brand-icon">⚙️</span>
              <div className="settings-brand-info">
                <span className="settings-brand-label">WORKSPACE</span>
                <h3 id="settings-dialog-title">Settings</h3>
              </div>
            </div>
          </div>

          <nav className="settings-nav-tabs" aria-label="Settings Categories">
            {/* 1. Appearance */}
            <button
              type="button"
              className={`settings-nav-item ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("appearance");
                setSettingsActiveTab("appearance");
              }}
            >
              <span className="nav-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              </span>
              <span className="nav-item-label">Appearance</span>
            </button>

            {/* 2. Account */}
            <button
              type="button"
              className={`settings-nav-item ${activeTab === "account" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("account");
                setSettingsActiveTab("account");
              }}
            >
              <span className="nav-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="nav-item-label">Account &amp; Security</span>
            </button>

            {/* 3. Data & Storage */}
            <button
              type="button"
              className={`settings-nav-item ${activeTab === "data" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("data");
                setSettingsActiveTab("data");
              }}
            >
              <span className="nav-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </span>
              <span className="nav-item-label">Data &amp; Storage</span>
              {trashList.length > 0 && (
                <span className="nav-item-badge" title={`${trashList.length} workflows in trash`}>
                  {trashList.length}
                </span>
              )}
            </button>

            {/* 4. Notifications */}
            <button
              type="button"
              className={`settings-nav-item ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("notifications");
                setSettingsActiveTab("notifications");
              }}
            >
              <span className="nav-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </span>
              <span className="nav-item-label">Notifications</span>
            </button>

            {/* 5. Help & Support */}
            <button
              type="button"
              className={`settings-nav-item ${activeTab === "support" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("support");
                setSettingsActiveTab("support");
              }}
            >
              <span className="nav-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <span className="nav-item-label">Help &amp; Support</span>
            </button>

            {/* 6. About */}
            <button
              type="button"
              className={`settings-nav-item ${activeTab === "about" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("about");
                setSettingsActiveTab("about");
              }}
            >
              <span className="nav-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </span>
              <span className="nav-item-label">About CodeHexa</span>
            </button>
          </nav>

          {/* Sidebar Footer with Log Out */}
          <div className="settings-sidebar-footer">
            <div className="settings-user-mini-card">
              <div className="user-mini-avatar">
                {(user?.name || "User").charAt(0).toUpperCase()}
              </div>
              <div className="user-mini-info">
                <strong>{user?.name || "Connected User"}</strong>
                <small>{user?.email || "Pro Developer"}</small>
              </div>
            </div>

            <button
              type="button"
              className="settings-sidebar-logout-btn"
              onClick={logout}
              title="Sign out of CodeHexa Flow"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* =========================================================
            RIGHT COLUMN: SELECTED SETTINGS SECTION CONTENT CARD
            ========================================================= */}
        <main className="settings-content-pane">
          {/* Content Pane Top Header */}
          <div className="settings-content-header">
            <div className="header-titles">
              <span className="header-eyebrow">
                {activeTab === "appearance" && "WORKSPACE / APPEARANCE"}
                {activeTab === "account" && "USER PROFILE / SECURITY"}
                {activeTab === "data" && "WORKSPACE / DATA & RETENTION"}
                {activeTab === "notifications" && "PREFERENCES / ALERTS"}
                {activeTab === "support" && "ASSISTANCE / HELP CENTER"}
                {activeTab === "about" && "SYSTEM / ARCHITECTURE"}
              </span>
              <h2>
                {activeTab === "appearance" && "Appearance & Theme"}
                {activeTab === "account" && "Account & Security"}
                {activeTab === "data" && "Data & Storage"}
                {activeTab === "notifications" && "Notification Preferences"}
                {activeTab === "support" && "Help & Support"}
                {activeTab === "about" && "About CodeHexa Flow"}
              </h2>
            </div>

            <button
              className="settings-modal-close-btn"
              onClick={closeSettings}
              type="button"
              aria-label="Close Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content Scrollable Body */}
          <div className="settings-tab-body">
            {/* =========================================================
                TAB 1: APPEARANCE
                ========================================================= */}
            {activeTab === "appearance" && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-card">
                  <div className="settings-card-header">
                    <h4>Theme Mode</h4>
                    <p>Select your interface style. Changes take effect immediately across all workflow tools and editors.</p>
                  </div>

                  <div className="theme-selection-grid">
                    {/* Dark Mode */}
                    <div
                      className={`theme-card ${activeTheme === "dark" ? "selected" : ""}`}
                      onClick={() => onThemeChange && onThemeChange("dark")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onThemeChange && onThemeChange("dark")}
                    >
                      <div className="theme-preview-box preview-dark">
                        <div className="preview-top-bar" />
                        <div className="preview-content-lines">
                          <span />
                          <span />
                        </div>
                      </div>
                      <div className="theme-card-footer">
                        <div className="theme-title-group">
                          <strong>Dark Mode</strong>
                          <small>Deep violet &amp; obsidian canvas</small>
                        </div>
                        {activeTheme === "dark" ? (
                          <span className="theme-active-pill">✓ Active</span>
                        ) : (
                          <span className="theme-select-radio" />
                        )}
                      </div>
                    </div>

                    {/* Light Mode */}
                    <div
                      className={`theme-card ${activeTheme === "light" ? "selected" : ""}`}
                      onClick={() => onThemeChange && onThemeChange("light")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onThemeChange && onThemeChange("light")}
                    >
                      <div className="theme-preview-box preview-light">
                        <div className="preview-top-bar" />
                        <div className="preview-content-lines">
                          <span />
                          <span />
                        </div>
                      </div>
                      <div className="theme-card-footer">
                        <div className="theme-title-group">
                          <strong>Light Mode</strong>
                          <small>Clean high-contrast light layout</small>
                        </div>
                        {activeTheme === "light" ? (
                          <span className="theme-active-pill">✓ Active</span>
                        ) : (
                          <span className="theme-select-radio" />
                        )}
                      </div>
                    </div>

                    {/* System Default */}
                    <div
                      className={`theme-card ${activeTheme === "system" ? "selected" : ""}`}
                      onClick={() => onThemeChange && onThemeChange("system")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onThemeChange && onThemeChange("system")}
                    >
                      <div className="theme-preview-box preview-system">
                        <div className="preview-half-dark" />
                        <div className="preview-half-light" />
                      </div>
                      <div className="theme-card-footer">
                        <div className="theme-title-group">
                          <strong>System Default</strong>
                          <small>Matches your OS display settings</small>
                        </div>
                        {activeTheme === "system" ? (
                          <span className="theme-active-pill">✓ Active</span>
                        ) : (
                          <span className="theme-select-radio" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 2: ACCOUNT & SECURITY
                ========================================================= */}
            {activeTab === "account" && (
              <div className="settings-pane-section animate-fade-in">
                {profileSuccess && (
                  <div className="settings-banner banner-success">
                    <span className="banner-icon">✓</span>
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="settings-banner banner-danger">
                    <span className="banner-icon">⚠️</span>
                    <span>{profileError}</span>
                  </div>
                )}

                {/* Card 1: Profile Information */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <h4>Profile Information</h4>
                    <p>Manage your account identity, personal details, and regional preferences.</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="settings-form">
                    <div className="form-grid-2col">
                      <div className="settings-form-group">
                        <label htmlFor="input-profile-name">Full Name / Username <span className="req-star">*</span></label>
                        <input
                          id="input-profile-name"
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="e.g. Alex Morgan"
                          required
                        />
                      </div>

                      <div className="settings-form-group">
                        <label htmlFor="input-profile-email">Email Address <span className="req-star">*</span></label>
                        <input
                          id="input-profile-email"
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          placeholder="alex@company.com"
                          required
                        />
                      </div>

                      <div className="settings-form-group">
                        <label htmlFor="input-profile-phone">Phone Number <small>(Optional)</small></label>
                        <input
                          id="input-profile-phone"
                          type="tel"
                          name="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+1 (555) 019-2834"
                        />
                      </div>

                      <div className="settings-form-group">
                        <label htmlFor="select-profile-gender">Gender <small>(Optional)</small></label>
                        <select
                          id="select-profile-gender"
                          name="gender"
                          value={profileForm.gender}
                          onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        >
                          <option value="">Prefer not to say</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                        </select>
                      </div>

                      <div className="settings-form-group">
                        <label htmlFor="select-profile-country">Country / Region</label>
                        <select
                          id="select-profile-country"
                          name="country"
                          value={profileForm.country}
                          onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        >
                          {COUNTRIES_LIST.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="settings-form-group">
                        <label htmlFor="input-profile-location">City / Location Area</label>
                        <input
                          id="input-profile-location"
                          type="text"
                          name="location"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          placeholder="e.g. San Francisco, California"
                        />
                      </div>
                    </div>

                    <div className="form-card-footer">
                      <button
                        type="submit"
                        className="settings-submit-btn btn-primary"
                        disabled={profileSaving}
                      >
                        {profileSaving ? "Saving Changes..." : "Save Profile Changes"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Card 2: Change Password */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <h4>Change Password</h4>
                    <p>Ensure your account is protected by updating your credentials periodically.</p>
                  </div>

                  {passwordSuccess && (
                    <div className="settings-banner banner-success">
                      <span className="banner-icon">✓</span>
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="settings-banner banner-danger">
                      <span className="banner-icon">⚠️</span>
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="settings-form">
                    <div className="form-grid-3col">
                      <div className="settings-form-group">
                        <label htmlFor="input-current-pass">Current Password</label>
                        <input
                          id="input-current-pass"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="settings-form-group">
                        <label htmlFor="input-new-pass">New Password</label>
                        <input
                          id="input-new-pass"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Min 6 characters"
                        />
                      </div>

                      <div className="settings-form-group">
                        <label htmlFor="input-confirm-pass">Confirm New Password</label>
                        <input
                          id="input-confirm-pass"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Repeat new password"
                        />
                      </div>
                    </div>

                    <div className="form-card-footer">
                      <button
                        type="submit"
                        className="settings-submit-btn btn-secondary"
                        disabled={passwordSaving}
                      >
                        {passwordSaving ? "Updating Password..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 3: DATA & STORAGE
                ========================================================= */}
            {activeTab === "data" && (
              <div className="settings-pane-section animate-fade-in">
                {trashMessage && (
                  <div className="settings-banner banner-success">
                    <span className="banner-icon">✓</span>
                    <span>{trashMessage}</span>
                  </div>
                )}

                {/* Card 1: Export All Workflows */}
                <div className="settings-card">
                  <div className="card-action-split">
                    <div className="card-action-text">
                      <div className="card-badge-row">
                        <span className="action-tag tag-export">BACKUP &amp; PORTABILITY</span>
                      </div>
                      <h4>Export All Workflow Data</h4>
                      <p>
                        Download a complete JSON export of all your workflows, step configurations, trigger definitions, and execution run history for backup and external portability.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="settings-action-btn btn-export"
                      onClick={handleExportAllData}
                      disabled={isExportingAll}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>{isExportingAll ? "Exporting Data..." : "Export All Data (JSON)"}</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Deleted Workflows / Trash */}
                <div className="settings-card">
                  <div className="card-header-with-actions">
                    <div>
                      <div className="card-badge-row">
                        <span className="action-tag tag-retention">7-DAY RETENTION POLICY</span>
                      </div>
                      <h4>Deleted Workflows / Trash</h4>
                      <p>
                        Workflows deleted within the last 7 days are kept here safely. You can restore them to your active workspace or delete them permanently.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="settings-refresh-btn"
                      onClick={fetchTrashWorkflows}
                      disabled={trashLoading}
                      title="Refresh Trash List"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                      <span>Refresh</span>
                    </button>
                  </div>

                  {trashLoading ? (
                    <div className="trash-state-container">
                      <div className="loading-spinner" />
                      <span>Loading trash items...</span>
                    </div>
                  ) : trashList.length === 0 ? (
                    <div className="trash-empty-container">
                      <div className="trash-empty-icon">🗑️</div>
                      <h5>Trash is empty</h5>
                      <p>No deleted workflows found. Any workflows moved to trash will remain recoverable here for 7 days.</p>
                    </div>
                  ) : (
                    <div className="trash-items-list">
                      {trashList.map((item) => (
                        <div key={item.id || item._id} className="trash-item-card">
                          <div className="trash-item-info">
                            <strong>{item.name || item.workflowName || "Workflow"}</strong>
                            <div className="trash-pills-row">
                              <span className="trash-pill pill-ver">v{item.version || 1}.0</span>
                              <span className="trash-pill pill-steps">{item.steps?.length || 0} Steps</span>
                              <span className="trash-pill pill-date">
                                Deleted {new Date(item.deletedAt || Date.now()).toLocaleDateString()}
                              </span>
                              <span className="trash-pill pill-countdown">
                                ⏳ {item.daysRemaining || 7} day{(item.daysRemaining || 7) !== 1 ? "s" : ""} left
                              </span>
                            </div>
                          </div>

                          <div className="trash-item-actions">
                            <button
                              type="button"
                              className="trash-btn btn-restore"
                              onClick={() => handleRestoreWorkflow(item.id || item._id)}
                              title="Restore workflow back to active workspaces"
                            >
                              ↺ Restore
                            </button>
                            <button
                              type="button"
                              className="trash-btn btn-delete-perm"
                              onClick={() => handlePermanentDelete(item.id || item._id)}
                              title="Permanently remove workflow immediately"
                            >
                              ✕ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Danger Zone */}
                <div className="settings-card danger-zone-card">
                  <div className="danger-zone-header">
                    <span className="danger-icon">⚠️</span>
                    <div>
                      <h4 className="danger-title">Danger Zone: Delete Account</h4>
                      <p>
                        Permanently delete your profile, configurations, and all associated active workflows. This action is irreversible.
                      </p>
                    </div>
                  </div>

                  {!confirmDeleteAccount ? (
                    <div className="danger-zone-action">
                      <button
                        type="button"
                        className="settings-danger-btn"
                        onClick={() => setConfirmDeleteAccount(true)}
                      >
                        Delete Account...
                      </button>
                    </div>
                  ) : (
                    <div className="danger-confirm-box">
                      <p className="danger-warning-note">
                        ⚠️ <strong>Warning:</strong> All your workflows, credentials, and execution history will be purged permanently from our servers.
                      </p>
                      <div className="danger-confirm-actions">
                        <button
                          type="button"
                          className="settings-cancel-btn"
                          onClick={() => setConfirmDeleteAccount(false)}
                          disabled={accountDeleteLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="settings-confirm-delete-btn"
                          onClick={handleDeleteUserAccount}
                          disabled={accountDeleteLoading}
                        >
                          {accountDeleteLoading ? "Deleting Account..." : "Yes, Delete My Account"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 4: NOTIFICATIONS
                ========================================================= */}
            {activeTab === "notifications" && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-card">
                  <div className="settings-card-header">
                    <h4>Alert Channels &amp; Execution Events</h4>
                    <p>Customize which workflow events, AI compilations, and system announcements trigger workspace notifications.</p>
                  </div>

                  <div className="notifications-list">
                    {/* Toggle 1 */}
                    <div className="notif-row">
                      <div className="notif-details">
                        <strong>Workflow Generation &amp; AI Suggestions</strong>
                        <p>Receive notifications when the AI compiles new DAG steps or suggests performance optimizations.</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationsPrefs.workflowGen}
                          onChange={() => handleToggleNotif("workflowGen")}
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>

                    {/* Toggle 2 */}
                    <div className="notif-row">
                      <div className="notif-details">
                        <strong>Execution Runs &amp; Step Completions</strong>
                        <p>Get notified whenever live workflows execute successfully and update external systems.</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationsPrefs.executionRuns}
                          onChange={() => handleToggleNotif("executionRuns")}
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>

                    {/* Toggle 3 */}
                    <div className="notif-row">
                      <div className="notif-details">
                        <strong>Failure &amp; Resilient Retry Alerts</strong>
                        <p>Get instant priority alerts if a workflow node fails validation or triggers an automated 3x retry cycle.</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationsPrefs.retryAlerts}
                          onChange={() => handleToggleNotif("retryAlerts")}
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>

                    {/* Toggle 4 */}
                    <div className="notif-row">
                      <div className="notif-details">
                        <strong>Platform &amp; Engine Updates</strong>
                        <p>Receive announcements regarding Bedrock LLM model upgrades, new node capabilities, and scheduled maintenance.</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={notificationsPrefs.systemAlerts}
                          onChange={() => handleToggleNotif("systemAlerts")}
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 5: HELP & SUPPORT (Navigates to separate Help, FAQ, Contact, and Support pages)
                ========================================================= */}
            {activeTab === "support" && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-card">
                  <div className="settings-card-header">
                    <h4>Help Center &amp; Support Hub</h4>
                    <p>Access our comprehensive guides, interactive FAQs, official contact channels, and dedicated support reporting.</p>
                  </div>

                  <div className="settings-nav-hub-grid">
                    {/* 1. Help Center */}
                    <div className="settings-hub-card">
                      <div className="hub-card-header">
                        <span className="hub-card-icon">📖</span>
                        <span className="hub-card-tag">QUICKSTART &amp; GUIDES</span>
                      </div>
                      <div className="hub-card-body">
                        <h5>Help Center &amp; Documentation</h5>
                        <p>Explore the 4-step quickstart walkthrough, core platform concepts, and workflow authoring tutorials.</p>
                      </div>
                      <button
                        type="button"
                        className="settings-hub-action-btn"
                        onClick={() => openStandalonePage("help")}
                      >
                        <span>Open Help Center</span>
                        <span className="btn-arrow">→</span>
                      </button>
                    </div>

                    {/* 2. FAQ */}
                    <div className="settings-hub-card">
                      <div className="hub-card-header">
                        <span className="hub-card-icon">❓</span>
                        <span className="hub-card-tag">KNOWLEDGE BASE</span>
                      </div>
                      <div className="hub-card-body">
                        <h5>Frequently Asked Questions</h5>
                        <p>Detailed answers explaining prompt AI generation, zero-shot validation rules, offline resilience, and retention.</p>
                      </div>
                      <button
                        type="button"
                        className="settings-hub-action-btn"
                        onClick={() => openStandalonePage("faq")}
                      >
                        <span>View FAQs</span>
                        <span className="btn-arrow">→</span>
                      </button>
                    </div>

                    {/* 3. Contact Us */}
                    <div className="settings-hub-card">
                      <div className="hub-card-header">
                        <span className="hub-card-icon">✉️</span>
                        <span className="hub-card-tag">CHANNELS &amp; COMMUNITY</span>
                      </div>
                      <div className="hub-card-body">
                        <h5>Contact Us &amp; Official Channels</h5>
                        <p>Connect with our team via Email support, Enterprise architecture solutions, Discord community, and API docs.</p>
                      </div>
                      <button
                        type="button"
                        className="settings-hub-action-btn"
                        onClick={() => openStandalonePage("contact")}
                      >
                        <span>Open Contact Page</span>
                        <span className="btn-arrow">→</span>
                      </button>
                    </div>

                    {/* 4. Contact Support / Report a Problem */}
                    <div className="settings-hub-card">
                      <div className="hub-card-header">
                        <span className="hub-card-icon">🛠️</span>
                        <span className="hub-card-tag">DIRECT SUPPORT</span>
                      </div>
                      <div className="hub-card-body">
                        <h5>Contact Support / Report a Problem</h5>
                        <p>Send an inquiry, report a bug, or request integrations directly through the official support messaging form.</p>
                      </div>
                      <button
                        type="button"
                        className="settings-hub-action-btn btn-highlight"
                        onClick={() => openStandalonePage("support")}
                      >
                        <span>Open Support Form</span>
                        <span className="btn-arrow">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 6: ABOUT CODEHEXA FLOW (Navigates to separate About page)
                ========================================================= */}
            {activeTab === "about" && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-card">
                  <div className="settings-card-header">
                    <h4>About CodeHexa Flow</h4>
                    <p>Next-Generation Autonomous Workflow Orchestration &amp; Deterministic DAG Execution Engine.</p>
                  </div>

                  <div className="settings-about-hub-card">
                    <div className="about-hub-main">
                      <span className="about-hub-icon">✦</span>
                      <div className="about-hub-text">
                        <span className="hub-card-tag">PLATFORM &amp; ARCHITECTURE</span>
                        <h5>CodeHexa Flow Platform &amp; Core Vision</h5>
                        <p>
                          Explore our full story, 4 architectural pillars (Prompt-to-Workflow AI, Zero-Shot Graph Validation, Hybrid Inference Engine, Universal Integrations), speedup benchmarks, and enterprise data privacy commitments.
                        </p>
                      </div>
                    </div>

                    <div className="about-hub-footer">
                      <div className="about-hub-badges">
                        <span className="hub-stat-pill">⚡ 10x Faster Design</span>
                        <span className="hub-stat-pill">🛡️ 99.9% Graph Reliability</span>
                        <span className="hub-stat-pill">🔒 0-Lockin Security</span>
                      </div>
                      <button
                        type="button"
                        className="settings-hub-action-btn btn-highlight"
                        onClick={() => openStandalonePage("about")}
                      >
                        <span>Open About Page</span>
                        <span className="btn-arrow">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SettingsModal;
