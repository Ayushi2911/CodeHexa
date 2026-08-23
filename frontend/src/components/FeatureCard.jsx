function ArrowUpRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <div className="feature-card-glow" />

      <div className="feature-card-top">
        <div className="feature-icon">
          {icon}
        </div>

        <div className="feature-number">
          0
        </div>
      </div>

      <div className="feature-card-content">
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <button
        className="feature-arrow"
        type="button"
        aria-label={`Explore ${title}`}
      >
        <ArrowUpRightIcon />
      </button>
    </article>
  );
}

export default FeatureCard;