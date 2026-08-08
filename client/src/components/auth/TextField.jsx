import { useId } from 'react';

/** Underlined text input matching the sign-up card in the wireframe. */
export default function TextField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  autoFocus = false,
}) {
  const id = useId();

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>

      <div className="auth-field__control">
        <input
          id={id}
          className={`auth-field__input ${error ? 'auth-field__input--error' : ''}`.trim()}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- first field of a dedicated auth form
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
        />
      </div>

      {error && <span className="auth-field__error">{error}</span>}
    </div>
  );
}
