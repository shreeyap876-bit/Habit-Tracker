/**
 * Compact metric tile used along the top of the dashboard.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.value
 * @param {string} [props.suffix]  Muted text after the value, e.g. "/ 5".
 * @param {string} [props.meta]    Small caption underneath.
 * @param {string} [props.color]   Habit colour token for the icon.
 */
export default function StatTile({ label, value, suffix, meta, icon: Icon, color = 'sage' }) {
  return (
    <div className="stat" data-color={color}>
      <p className="stat__label">
        {Icon && <Icon size={14} strokeWidth={2} />}
        {label}
      </p>
      <p className="stat__value">
        {value}
        {suffix && <small> {suffix}</small>}
      </p>
      {meta && <p className="stat__meta">{meta}</p>}
    </div>
  );
}
