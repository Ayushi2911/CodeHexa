function ConfidenceBadge({ confidence = 0 }) {
  const numericConfidence =
    typeof confidence === "number"
      ? confidence
      : Number(confidence) || 0;

  const percentage =
    numericConfidence <= 1
      ? Math.round(numericConfidence * 100)
      : Math.round(numericConfidence);

  const level =
    percentage >= 80
      ? "High"
      : percentage >= 50
      ? "Medium"
      : "Low";

  return (
    <div
      className={`confidence-badge confidence-${level.toLowerCase()}`}
    >
      <span className="confidence-label">
        AI Confidence
      </span>

      <strong>{percentage}%</strong>

      <span className="confidence-level">
        {level}
      </span>
    </div>
  );
}

export default ConfidenceBadge;
