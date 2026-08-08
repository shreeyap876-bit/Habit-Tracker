import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Password input with a show/hide toggle, styled as the underlined field from
 * the wireframe.
 */
export default function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete = 'current-password',
  placeholder = '••••••••',
}) {
  const [visible, setVisible] = useState(false);
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
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
        />

        <button
          type="button"
          className="auth-field__toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} strokeWidth={1.9} /> : <Eye size={16} strokeWidth={1.9} />}
        </button>
      </div>

      {error && <span className="auth-field__error">{error}</span>}
    </div>
  );
}
