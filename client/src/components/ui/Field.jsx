import { useId } from 'react';

/** Labelled form control wrapper shared by the habit form. */
export default function Field({ label, hint, error, htmlFor, children }) {
  const generatedId = useId();
  const id = htmlFor || generatedId;

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      {typeof children === 'function' ? children(id) : children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
