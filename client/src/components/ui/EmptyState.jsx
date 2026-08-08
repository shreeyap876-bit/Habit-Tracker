/** Friendly placeholder for lists and panels with nothing in them yet. */
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty">
      {Icon && (
        <div className="empty__icon">
          <Icon size={24} strokeWidth={1.6} />
        </div>
      )}
      {title && <p className="empty__title">{title}</p>}
      {message && <p className="empty__text">{message}</p>}
      {action}
    </div>
  );
}
