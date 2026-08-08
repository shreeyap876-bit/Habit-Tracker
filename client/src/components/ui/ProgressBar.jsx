/**
 * Thin progress track. `color` maps to a habit colour token; leaving it unset
 * falls back to the brand accent.
 */
export default function ProgressBar({ value = 0, max = 100, color, label }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div
      className="progress"
      data-color={color}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress'}
    >
      <div className="progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
