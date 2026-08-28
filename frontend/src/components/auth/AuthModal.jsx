import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

const POPULAR_COUNTRIES = [
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

const PRESET_GOOGLE_ACCOUNTS = [
  {
    name: "Alex Rivera",
    email: "alex.rivera.dev@gmail.com",
    role: "Automation Engineer",
    country: "India",
    location: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face",
  },
  {
    name: "Sarah Connor",
    email: "sarah.connor.flow@gmail.com",
    role: "Workflow Architect",
    country: "United States",
    location: "San Francisco",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  },
  {
    name: "Nisha Patel",
    email: "nisha.patel.ai@gmail.com",
    role: "AI Operations Lead",
    country: "India",
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face",
  },
];

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

/**
 * Safely decodes base64url encoded JWT payload in browser
 */
function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function AuthModal() {
  const { showAuthModal, authMode, setAuthMode, authMessage, closeAuthModal, login, register, googleSignIn } = useAuth();

  // Clean empty state - No default values
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    location: "",
  });

  // Google account selector prompt state
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [useCustomGoogleForm, setUseCustomGoogleForm] = useState(false);
  const [googleData, setGoogleData] = useState({
    email: "",
    name: "",
    country: "India",
    location: "Mumbai",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gsiButtonRef = useRef(null);

  /**
   * Initialize Google Identity Services (GSI) if available and client ID is provided
   */
  useEffect(() => {
    if (!showAuthModal) return;

    const clientIdToUse = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && clientIdToUse) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientIdToUse,
          callback: async (response) => {
            if (response?.credential) {
              setIsSubmitting(true);
              setError("");
              const decoded = decodeJwtPayload(response.credential);
              const res = await googleSignIn({
                credential: response.credential,
                email: decoded?.email,
                name: decoded?.name,
                avatar: decoded?.picture,
                googleId: decoded?.sub,
                country: googleData.country || "United States",
                location: googleData.location || "Online",
              });
              setIsSubmitting(false);
              if (!res.success) {
                setError(res.error || "Google authentication failed.");
              }
            }
          },
        });

        if (gsiButtonRef.current) {
          window.google.accounts.id.renderButton(gsiButtonRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 320,
            text: "continue_with",
          });
        }
      } catch (err) {
        console.warn("GSI init warning:", err);
      }
    };
  }, [showAuthModal, showGooglePrompt]);

  if (!showAuthModal) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleGoogleChange = (e) => {
    const { name, value } = e.target;
    setGoogleData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleToggleMode = (mode) => {
    setAuthMode(mode);
    setShowGooglePrompt(false);
    setUseCustomGoogleForm(false);
    setError("");
  };

  const handleClose = () => {
    setShowGooglePrompt(false);
    setUseCustomGoogleForm(false);
    setError("");
    closeAuthModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid Gmail / Email address.");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    if (authMode === "register") {
      if (!formData.name.trim()) {
        setError("Please enter your Full Name / Username.");
        setIsSubmitting(false);
        return;
      }
      if (!formData.country.trim()) {
        setError("Please select your Country.");
        setIsSubmitting(false);
        return;
      }
      if (!formData.location.trim()) {
        setError("Please enter your City / Location.");
        setIsSubmitting(false);
        return;
      }

      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        country: formData.country.trim(),
        location: formData.location.trim(),
      });

      setIsSubmitting(false);
      if (!res.success) {
        setError(res.error || "Registration failed. Please try again.");
      }
    } else {
      const res = await login(formData.email.trim(), formData.password);
      setIsSubmitting(false);
      if (!res.success) {
        setError(res.error || "Invalid email or password.");
      }
    }
  };

  const handleGoogleClick = () => {
    setError("");
    setGoogleData({
      email: formData.email.trim() || "",
      name: formData.name.trim() || "",
      country: formData.country || "India",
      location: formData.location || "Mumbai",
    });
    setUseCustomGoogleForm(false);
    setShowGooglePrompt(true);
  };

  const handleSelectPresetAccount = async (account) => {
    setError("");
    setIsSubmitting(true);
    const res = await googleSignIn({
      email: account.email,
      name: account.name,
      country: account.country,
      location: account.location,
      avatar: account.avatar,
      googleId: `google_${account.email.replace(/[^a-zA-Z0-9]/g, "")}`,
    });
    setIsSubmitting(false);
    if (!res.success) setError(res.error || "Google sign-in failed. Please try again.");
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!googleData.email.trim() || !googleData.email.includes("@")) {
      setError("Please enter a valid Google / Gmail address.");
      return;
    }
    setIsSubmitting(true);
    const res = await googleSignIn({
      email: googleData.email.trim(),
      name: googleData.name.trim() || googleData.email.split("@")[0],
      country: googleData.country || "India",
      location: googleData.location || "Mumbai",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleData.name || googleData.email)}`,
      googleId: `google_custom_${Date.now()}`,
    });
    setIsSubmitting(false);
    if (!res.success) setError(res.error || "Google sign-in failed. Please try again.");
  };

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-brand-badge">
            <span className="logo-mark">✦</span>
            <span>CodeHexa Flow</span>
          </div>
          <button
            className="auth-close-btn"
            onClick={handleClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* -----------------------------------------------------------
            VIEW A: GOOGLE ACCOUNT CHOOSER & SIGN-IN
            ----------------------------------------------------------- */}
        {showGooglePrompt ? (
          <div className="google-prompt-view">
            <div className="google-prompt-header">
              <div className="google-prompt-logo">
                <GoogleIcon size={26} />
              </div>
              <h3>Sign in with Google</h3>
              <p>Choose an account to continue to <strong>CodeHexa Flow</strong></p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="auth-error-alert">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Official GSI Button (if client id is initialized) */}
            <div ref={gsiButtonRef} className="gsi-button-wrapper" />

            {!useCustomGoogleForm ? (
              <>
                <div className="google-accounts-list">
                  <div className="google-accounts-label">QUICK GOOGLE ACCOUNTS</div>
                  {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
                    <button key={acc.email} type="button" className="google-account-item" onClick={() => handleSelectPresetAccount(acc)} disabled={isSubmitting}>
                      <img src={acc.avatar} alt={acc.name} className="google-account-avatar" />
                      <div className="google-account-info">
                        <div className="google-account-name-row">
                          <span className="google-account-name">{acc.name}</span>
                          <span className="google-account-tag">Google Verified</span>
                        </div>
                        <span className="google-account-email">{acc.email}</span>
                        <span className="google-account-sub">{acc.role} • {acc.location}, {acc.country}</span>
                      </div>
                      <span className="google-account-arrow">➔</span>
                    </button>
                  ))}
                  <button type="button" className="google-add-account-btn" onClick={() => setUseCustomGoogleForm(true)}>
                    <span className="google-add-icon">＋</span>
                    <span>Use another Google account...</span>
                  </button>
                </div>
                <div className="google-prompt-actions">
                  <button type="button" className="template-modal-cancel-btn" onClick={() => setShowGooglePrompt(false)}>
                    ← Back to Email
                  </button>
                </div>
              </>
            ) : (
              <form className="auth-form" onSubmit={handleCustomGoogleSubmit}>
                <div className="auth-field-group">
                  <label htmlFor="google-email">GOOGLE / GMAIL ADDRESS *</label>
                  <input id="google-email" name="email" type="email" value={googleData.email} onChange={handleGoogleChange} placeholder="your.name@gmail.com" required autoFocus autoComplete="email" />
                </div>
                <div className="auth-field-group">
                  <label htmlFor="google-name">YOUR FULL NAME (OPTIONAL)</label>
                  <input id="google-name" name="name" type="text" value={googleData.name} onChange={handleGoogleChange} placeholder="e.g. Minal Maurya" autoComplete="name" />
                </div>
                <div className="auth-two-col-grid">
                  <div className="auth-field-group">
                    <label htmlFor="google-country">COUNTRY</label>
                    <select id="google-country" name="country" value={googleData.country} onChange={handleGoogleChange}>
                      {POPULAR_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                  </div>
                  <div className="auth-field-group">
                    <label htmlFor="google-location">CITY / LOCATION</label>
                    <input id="google-location" name="location" type="text" value={googleData.location} onChange={handleGoogleChange} placeholder="e.g. Mumbai" />
                  </div>
                </div>
                <div className="google-prompt-actions">
                  <button type="button" className="template-modal-cancel-btn" onClick={() => setUseCustomGoogleForm(false)}>← Back to Accounts</button>
                  <button type="submit" className="primary-btn google-confirm-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Continue with Google ➔"}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* -----------------------------------------------------------
              VIEW B: STANDARD EMAIL LOGIN & SIGNUP
              ----------------------------------------------------------- */
          <>
            {/* Title */}
            <div className="auth-title-block">
              <h2>{authMode === "login" ? "Welcome back" : "Create your account"}</h2>
              <p>
                {authMode === "login"
                  ? "Sign in to access your saved workflows, history, and live runs."
                  : "Sign up to generate intelligent workflows, inspect DAG graphs, and publish live automations."}
              </p>
            </div>

            {/* Guest Mode Reason Notification */}
            {authMessage && (
              <div className="auth-prompt-banner">
                <span className="auth-prompt-icon">🔒</span>
                <span>{authMessage}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="auth-tabs-row">
              <button
                className={authMode === "login" ? "auth-tab active" : "auth-tab"}
                onClick={() => handleToggleMode("login")}
                type="button"
              >
                Log In
              </button>
              <button
                className={authMode === "register" ? "auth-tab active" : "auth-tab"}
                onClick={() => handleToggleMode("register")}
                type="button"
              >
                Sign Up
              </button>
            </div>

            {/* Google Authentication Trigger */}
            <div className="google-auth-container">
              <button
                className="google-auth-btn"
                onClick={handleGoogleClick}
                disabled={isSubmitting}
                type="button"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>

            {/* Error alert with instant mode switch button */}
            {error && (
              <div className="auth-error-alert">
                <div className="error-alert-content">
                  <span>⚠️ {error}</span>
                  {error.includes("not registered") && authMode === "login" && (
                    <button
                      type="button"
                      className="error-action-link"
                      onClick={() => handleToggleMode("register")}
                    >
                      Sign Up Now ➔
                    </button>
                  )}
                  {error.includes("already registered") && authMode === "register" && (
                    <button
                      type="button"
                      className="error-action-link"
                      onClick={() => handleToggleMode("login")}
                    >
                      Log In Instead ➔
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {authMode === "register" && (
                <div className="auth-field-group">
                  <label htmlFor="auth-name">FULL NAME / USERNAME *</label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Minal Maurya"
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="auth-field-group">
                <label htmlFor="auth-email">GMAIL / EMAIL ADDRESS *</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@gmail.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field-group">
                <label htmlFor="auth-password">PASSWORD *</label>
                <div className="password-input-wrapper">
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    autoComplete={authMode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {authMode === "register" && (
                <div className="auth-two-col-grid">
                  <div className="auth-field-group">
                    <label htmlFor="auth-country">COUNTRY *</label>
                    <select
                      id="auth-country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select Country</option>
                      {POPULAR_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="auth-field-group">
                    <label htmlFor="auth-location">CITY / LOCATION *</label>
                    <input
                      id="auth-location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                className="primary-btn auth-submit-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : authMode === "login"
                  ? "Log In ➔"
                  : "✦ Create Account ➔"}
              </button>
            </form>

            {/* Footer switch link */}
            <div className="auth-modal-footer">
              {authMode === "login" ? (
                <p>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => handleToggleMode("register")}
                  >
                    Sign Up for free
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => handleToggleMode("login")}
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;

