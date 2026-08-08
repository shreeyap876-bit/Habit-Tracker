/**
 * Panel used across the dashboard and insights pages.
 *
 * @param {object} props
 * @param {string} [props.title]   Heading shown in the card header.
 * @param {React.ElementType} [props.icon]  Lucide icon rendered before the title.
 * @param {React.ReactNode} [props.action]  Right-aligned header slot.
 * @param {boolean} [props.tint]   Uses the softer surface colour.
 * @param {boolean} [props.flush]  Removes body padding (for lists and charts).
 */
export default function Card({
  title,
  icon: Icon,
  action,
  tint = false,
  flush = false,
  className = '',
  bodyClassName = '',
  children,
  ...rest
}) {
  const classes = ['card', tint && 'card--tint', className].filter(Boolean).join(' ');

  return (
    <section className={classes} {...rest}>
      {(title || action) && (
        <header className="card__header">
          {title && (
            <h3 className="card__title">
              {Icon && <Icon size={16} strokeWidth={1.8} />}
              {title}
            </h3>
          )}
          {action && <div className="card__action">{action}</div>}
        </header>
      )}
      <div
        className={`card__body ${bodyClassName}`.trim()}
        style={flush ? { paddingTop: 0 } : undefined}
      >
        {children}
      </div>
    </section>
  );
}
