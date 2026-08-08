import { useState } from 'react';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

/** Profile picture with an initials fallback when the image is absent or fails. */
export default function Avatar({ src, name, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const className = `avatar ${size === 'lg' ? 'avatar--lg' : ''}`.trim();

  if (!src || failed) {
    return (
      <span className={className} aria-hidden="true">
        {initials(name)}
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
