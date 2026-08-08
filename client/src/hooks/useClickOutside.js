import { useEffect, useRef } from 'react';

/**
 * Calls `handler` when a pointer lands outside the returned ref, or when Escape
 * is pressed. Used by the dropdown menus and the emoji picker.
 */
export default function useClickOutside(handler, active = true) {
  const ref = useRef(null);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return undefined;

    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) handlerRef.current(event);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handlerRef.current(event);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  return ref;
}
