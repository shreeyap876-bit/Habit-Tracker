import Spinner from './Spinner.jsx';

/**
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant]
 * @param {'sm'|'md'} [props.size]
 * @param {boolean} [props.loading]  Shows a spinner and blocks interaction.
 * @param {boolean} [props.block]    Stretches to the container width.
 */
export default function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  block = false,
  icon: Icon,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner /> : Icon ? <Icon size={16} strokeWidth={1.9} /> : null}
      {children}
    </button>
  );
}
