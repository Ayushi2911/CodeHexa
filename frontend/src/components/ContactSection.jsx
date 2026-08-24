import { useState } from "react";

const QUICK_TOPICS = [
  { label: "⚡ Bedrock LLM Setup", subject: "Inquiry about AWS Bedrock LLM configuration", category: "support" },
  { label: "🔄 Webhook Triggers", subject: "Custom Webhook integration question", category: "integrations" },
  { label: "📊 Enterprise SLA", subject: "Enterprise dedicated orchestration quote", category: "enterprise" },
  { label: "💡 Feature Request", subject: "Feature suggestion for Workflow Studio", category: "feedback" },
];

function SendPlaneIcon() {
  return (
    <svg className="contact-plane-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status) setStatus(null);
  };

  const handleQuickTopic = (topic) => {
    setFormData((prev) => ({
      ...prev,
      subject: topic.subject,
      category: topic.category,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: "error", message: "Please fill out all required fields." });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus({
        type: "success",
        message: "Thank you for reaching out! Your message was delivered to our engineering team. We will get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        category: "general",
        subject: "",
        message: "",
      });
    }, 1000);
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-header">
        <div className="features-eyebrow">
          <span className="features-eyebrow-dot" />
          GET IN TOUCH
        </div>

        <h2>We are here to help you scale your automation</h2>

        <p className="contact-subtitle">
          Have questions about CodeHexa Flow, enterprise orchestration, or custom integrations? Drop us a message below.
        </p>
      </div>

      <div className="contact-layout">
        <div className="contact-channels">
          <div className="channel-card">
            <div className="channel-icon">✉️</div>
            <div>
              <strong>Email Support</strong>
              <p>contact@codehexa.com</p>
              <small>Response within 24 business hours</small>
            </div>
          </div>

          <div className="channel-card">
            <div className="channel-icon">⚡</div>
            <div>
              <strong>Enterprise Solutions</strong>
              <p>enterprise@codehexa.com</p>
              <small>Dedicated SLA & Custom AI Pipeline Architecture</small>
            </div>
          </div>

          <div className="channel-card">
            <div className="channel-icon">💬</div>
            <div>
              <strong>Community Discord</strong>
              <p>discord.gg/codehexa</p>
              <small>Live dev chats & workflow templates</small>
            </div>
          </div>

          <div className="channel-card">
            <div className="channel-icon">🌐</div>
            <div>
              <strong>API & Documentation</strong>
              <p>docs.codehexa.com</p>
              <small>REST API & WebSocket reference</small>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-header">
              <div className="contact-form-title-wrap">
                <span className="contact-sparkle-dot">✦</span>
                <h3>Send a Message</h3>
              </div>
              <span className="contact-form-hint">Fast Response Guaranteed</span>
            </div>

            {/* Quick Topic Chips */}
            <div className="contact-quick-chips">
              <span className="quick-chips-label">Quick topics:</span>
              <div className="quick-chips-list">
                {QUICK_TOPICS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    className={`quick-chip-btn ${formData.subject === t.subject ? "active" : ""}`}
                    onClick={() => handleQuickTopic(t)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {status && (
              <div className={`contact-status-box status-${status.type}`}>
                <span className="status-icon-anim">
                  {status.type === "success" ? "🎉" : "⚠️"}
                </span>
                <span>{status.message}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">Your Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address *</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@company.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-category">Inquiry Topic</label>
                <select
                  id="contact-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support & Help</option>
                  <option value="enterprise">Enterprise Orchestration</option>
                  <option value="integrations">Custom API Integrations</option>
                  <option value="feedback">Product Feedback & Feature Request</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. AWS Bedrock setup assistance"
                />
              </div>
            </div>

            {/* Animated Message Textarea Box */}
            <div className={`form-group animated-message-group ${isMessageFocused ? "is-focused" : ""} ${formData.message.length > 0 ? "has-content" : ""}`}>
              <div className="message-label-row">
                <label htmlFor="contact-message">Message *</label>
                <span className="message-char-count">
                  {formData.message.length} / 1000 characters
                </span>
              </div>
              <div className="message-input-shell">
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setIsMessageFocused(true)}
                  onBlur={() => setIsMessageFocused(false)}
                  placeholder="Describe your workflow challenge, custom requirements, or inquiry..."
                  rows={5}
                  maxLength={1000}
                  required
                />
                <div className="message-glow-bar" />
              </div>
            </div>

            {/* Animated Send Message Button */}
            <button
              type="submit"
              className={`primary-btn submit-contact-btn animated-send-btn ${isSubmitting ? "is-sending" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="contact-beacon-spinner" />
                  <span>Delivering Message...</span>
                </>
              ) : (
                <>
                  <span className="send-btn-content">
                    <span>Send Message</span>
                    <SendPlaneIcon />
                  </span>
                  <span className="send-btn-shine" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
