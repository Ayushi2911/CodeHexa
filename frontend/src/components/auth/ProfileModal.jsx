import { useState, useEffect } from "react";
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

function ProfileModal() {
  const { user, showProfileModal, closeProfileModal, updateUserProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    country: "",
    location: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        country: user.country || "",
        location: user.location || "",
      });
      setError("");
      setSuccessMessage("");
    }
  }, [user, showProfileModal]);

  if (!showProfileModal || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setError("Full Name / Username is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("A valid Email address is required.");
      return;
    }

    setIsSubmitting(true);
    const res = await updateUserProfile({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
      country: formData.country.trim(),
      location: formData.location.trim(),
      lastConnectedArea: `${formData.location || "Global"}, ${formData.country || "Online"} (Active Profile Update)`,
    });

    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(res.message || "Profile successfully updated!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } else {
      setError(res.error || "Failed to update profile.");
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

  const lastArea = user.lastConnectedArea || `${user.location || "Local"}, ${user.country || "India"} (Active Session)`;

  return (
    <div className="auth-modal-overlay" onClick={closeProfileModal}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="profile-modal-header">
          <div className="profile-brand-badge">
            <span className="logo-mark">👤</span>
            <span>User Profile & Account</span>
          </div>
          <button
            className="auth-close-btn"
            onClick={closeProfileModal}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* User Summary Banner */}
        <div className="profile-hero-banner">
          <div className="profile-avatar-large">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar-img" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div className="profile-hero-info">
            <h3>{user.name}</h3>
            <p className="profile-email-tag">{user.email}</p>
            <div className="profile-badges-row">
              <span className="profile-badge-pill provider">
                {user.authProvider === "google" ? "✦ Google Verified" : "● Local Account"}
              </span>
              <span className="profile-badge-pill status">
                ● Active Session
              </span>
              {user.gender && (
                <span className="profile-badge-pill gender">
                  {user.gender}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="profile-success-alert">
            <span>✓ {successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            {/* Full Name */}
            <div className="auth-field-group">
              <label htmlFor="profile-name">FULL NAME / USERNAME *</label>
              <input
                id="profile-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email Address */}
            <div className="auth-field-group">
              <label htmlFor="profile-email">EMAIL ADDRESS *</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@gmail.com"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="auth-field-group">
              <label htmlFor="profile-phone">PHONE NUMBER</label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210 (Optional)"
              />
            </div>

            {/* Gender Selection */}
            <div className="auth-field-group">
              <label htmlFor="profile-gender">GENDER (OPTIONAL)</label>
              <select
                id="profile-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Prefer not to specify</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Country */}
            <div className="auth-field-group">
              <label htmlFor="profile-country">COUNTRY</label>
              <select
                id="profile-country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="" disabled>Select Country</option>
                {POPULAR_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* City / Location */}
            <div className="auth-field-group">
              <label htmlFor="profile-location">CITY / LOCATION</label>
              <input
                id="profile-location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
              />
            </div>
          </div>

          {/* Connected Session & Platform Details */}
          <div className="profile-telemetry-box">
            <div className="telemetry-item">
              <span className="telemetry-label">LAST CONNECTED AREA</span>
              <span className="telemetry-val">📍 {lastArea}</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">PLATFORM & ENGINE</span>
              <span className="telemetry-val">⚡ CodeHexa Flow v2.4 (Enterprise Engine)</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="profile-actions-bar">
            <button
              type="button"
              className="profile-logout-btn"
              onClick={logout}
              title="Log out and return to guest mode"
            >
              🚪 Log Out
            </button>

            <div className="profile-right-actions">
              <button
                type="button"
                className="template-modal-cancel-btn"
                onClick={closeProfileModal}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className={`profile-live-save-btn ${isSubmitting ? "is-saving" : ""} ${successMessage ? "is-success" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="live-btn-spinner" />
                    <span>Saving Profile...</span>
                  </>
                ) : successMessage ? (
                  <>
                    <span className="live-btn-check">✓</span>
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <span className="live-btn-sparkle">✦</span>
                    <span>Save Changes</span>
                    <span className="live-btn-arrow">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
