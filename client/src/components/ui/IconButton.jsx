/** Square, borderless button for toolbar-style actions. `label` is required. */
export default function IconButton({ icon: Icon, label, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`btn btn--icon ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon size={18} strokeWidth={1.8} />
    </button>
  );
}
