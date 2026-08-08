export default function Spinner({ size = 'sm', label }) {
  return (
    <span
      className={`spinner ${size === 'lg' ? 'spinner--lg' : ''}`.trim()}
      role="status"
      aria-label={label || 'Loading'}
    />
  );
}

/** Full-height loading state for pages and large panels. */
export function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="loading-screen">
      <Spinner size="lg" />
      <p>{message}</p>
    </div>
  );
}
