import { useState } from "react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        message: "Thank you for reaching out! Our team will get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        category: "general",
        subject: "",
        message: "",
      });
    }, 800);
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
            <h3>Send a Message</h3>

            {status && (
              <div className={`contact-status-box status-${status.type}`}>
                {status.type === "success" ? "✓ " : "⚠️ "}
                {status.message}
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

            <div className="form-group">
              <label htmlFor="contact-message">Message *</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your workflow challenge, question, or integration request..."
                rows={5}
                required
              />
            </div>

            <button
              type="submit"
              className="primary-btn submit-contact-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" /> Sending Message...
                </>
              ) : (
                <>
                  Send Message <span className="btn-arrow">→</span>
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
