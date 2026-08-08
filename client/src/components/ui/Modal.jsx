import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import IconButton from './IconButton.jsx';

/**
 * Accessible dialog rendered into a portal. Closes on Escape and on a click
 * outside the panel, and locks background scrolling while open.
 */
export default function Modal({ open, onClose, title, subtitle, footer, children }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="modal__panel" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__header">
          <div>
            <h2 className="modal__title">{title}</h2>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <div className="spacer" />
          <IconButton icon={X} label="Close" onClick={onClose} />
        </header>

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
