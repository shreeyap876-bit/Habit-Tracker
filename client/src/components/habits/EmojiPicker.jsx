import { useState } from 'react';
import useClickOutside from '../../hooks/useClickOutside.js';
import { HABIT_EMOJIS } from '../../utils/habitTheme.js';

/** Small fixed palette of emoji, enough to give each habit a face. */
export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false), open);

  return (
    <div className="emoji-picker" ref={ref}>
      <button
        type="button"
        className="emoji-picker__trigger"
        onClick={() => setOpen((current) => !current)}
        aria-label="Choose an icon"
        aria-expanded={open}
      >
        {value}
      </button>

      {open && (
        <div className="emoji-picker__panel" role="listbox" aria-label="Habit icons">
          {HABIT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="option"
              aria-selected={emoji === value}
              className="emoji-picker__option"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
