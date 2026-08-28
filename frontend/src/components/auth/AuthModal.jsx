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
  "Other",
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    location: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gsiButtonRef = useRef(null);
  const tokenClientRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  /**
   * Initialize Official Google Identity Services & OAuth 2.0 Token Client
   */
  useEffect(() => {
    if (!showAuthModal) return;

    if (window.google && googleClientId) {
      try {
        // 1. Official Google OAuth 2.0 Token Client
        // prompt: 'select_account' forces Google to show the native "Choose an account" screen with signed-in browser accounts
        if (window.google.accounts?.oauth2) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: "openid email profile",
            prompt: "select_account",
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                setError(tokenResponse.error_description || "Google authentication was cancelled or closed.");
                setIsSubmitting(false);
                return;
              }
              if (tokenResponse.access_token) {
                setIsSubmitting(true);
                setError("");
                const res = await googleSignIn({
                  accessToken: tokenResponse.access_token,
                });
                setIsSubmitting(false);
                if (!res.success) {
                  setError(res.error || "Google authentication failed.");
                }
              }
            },
          });
        }

        // 2. Official Google Identity Services Button / One Tap
        if (window.google.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
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
              shape: "rectangular",
              width: 380,
              text: "continue_with",
              logo_alignment: "left",
            });
          }
        }
      } catch (err) {
        console.warn("Google SDK initialization warning:", err);
      }
    }
  }, [showAuthModal, googleClientId]);

  if (!showAuthModal) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleToggleMode = (mode) => {
    setAuthMode(mode);
    setError("");
  };

  const handleClose = () => {
    setError("");
    closeAuthModal();
  };

  /**
   * Handle Click on "Sign in with Google" / "Continue with Google"
   * Triggers Google's official OAuth Account Chooser popup
   */
  const handleGoogleClick = () => {
    setError("");

    if (!googleClientId) {
      setError(
        "Google Client ID is missing. Please configure VITE_GOOGLE_CLIENT_ID in your frontend/.env file with your OAuth 2.0 Web Client ID from Google Cloud Console."
      );
      return;
    }

    if (tokenClientRef.current) {
      try {
        setIsSubmitting(true);
        // Request access token with select_account prompt to guarantee the official "Choose an account" screen opens
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      } catch (err) {
        setIsSubmitting(false);
        setError(err.message || "Failed to trigger Google Account Chooser.");
      }
    } else if (window.google?.accounts?.oauth2) {
      try {
        setIsSubmitting(true);
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          prompt: "select_account",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setError(tokenResponse.error_description || "Google authentication was cancelled.");
              setIsSubmitting(false);
              return;
            }
            if (tokenResponse.access_token) {
              const res = await googleSignIn({
                accessToken: tokenResponse.access_token,
              });
              setIsSubmitting(false);
              if (!res.success) {
                setError(res.error || "Google authentication failed.");
              }
            }
          },
        });
        tokenClientRef.current = client;
        client.requestAccessToken({ prompt: "select_account" });
      } catch (err) {
        setIsSubmitting(false);
        setError(err.message || "Failed to initialize Google OAuth.");
      }
    } else {
      setError(
        "Google Identity Services SDK is still loading or blocked. Please check your internet connection or browser extensions."
      );
    }
  };

  /**
   * Standard Email/Password Form Submit
   */
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

        {/* Google Authentication Trigger - Official Google Flow */}
        <div className="google-auth-container">
          <button
            className="google-auth-btn"
            onClick={handleGoogleClick}
            disabled={isSubmitting}
            type="button"
          >
            <GoogleIcon />
            <span>{isSubmitting ? "Connecting to Google..." : "Sign in with Google"}</span>
          </button>

          {/* Optional Official GSI rendered button slot */}
          <div ref={gsiButtonRef} className="gsi-button-wrapper" style={{ display: "none" }} />
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
                placeholder="e.g. Jinal Rathod"
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
                  placeholder="e.g. Surat"
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
      </div>
    </div>
  );
}

export default AuthModal;
