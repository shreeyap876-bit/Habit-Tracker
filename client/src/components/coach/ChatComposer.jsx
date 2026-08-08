import { useLayoutEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

const MAX_LENGTH = 1000;
/** Keep in step with `.composer__input` max-height in pages.css. */
const MAX_HEIGHT = 132;

/** Auto-growing message box. Enter sends, Shift+Enter adds a newline. */
export default function ChatComposer({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Grow with the content. Measuring in a layout effect (before paint) and
  // clamping the result keeps the box from flashing full height on mount.
  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    const message = value.trim();
    if (!message || disabled) return;
    setValue('');
    onSend(message);
  };

  return (
    <div className="composer">
      <textarea
        ref={textareaRef}
        className="composer__input"
        rows={1}
        value={value}
        maxLength={MAX_LENGTH}
        placeholder="Ask your coach anything about your habits…"
        aria-label="Message your habit coach"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />

      <button
        type="button"
        className="composer__send"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <Send size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
