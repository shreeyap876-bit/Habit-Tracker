import { useState } from 'react';
import { Archive, ArchiveRestore, Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside.js';
import { frequencyLabel, isScheduledOn } from '../../utils/habitTheme.js';
import { weekdayOf } from '../../utils/date.js';
import IconButton from '../ui/IconButton.jsx';
import DayCell from './DayCell.jsx';

/**
 * A habit and its seven check circles for the week on screen.
 *
 * @param {object} props
 * @param {object} props.habit
 * @param {string[]} props.days               Seven `YYYY-MM-DD` keys, Monday first.
 * @param {(date: string) => boolean} props.isCompleted
 * @param {{current:number, unit:string}} [props.streak]
 */
export default function HabitRow({
  habit,
  days,
  isCompleted,
  streak,
  onToggle,
  onEdit,
  onArchive,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false), menuOpen);

  const runMenuAction = (action) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <article
      className={`habit-row ${habit.archived ? 'habit-row--archived' : ''}`.trim()}
      data-color={habit.color}
    >
      <header className="habit-row__head">
        <div style={{ minWidth: 0 }}>
          <h3 className="habit-row__title">
            <span aria-hidden="true">{habit.emoji}</span>
            <span>{habit.name}</span>
          </h3>
          {habit.description && <p className="habit-row__description">{habit.description}</p>}
        </div>

        <div className="habit-row__meta">
          {streak?.current > 0 && (
            <span
              className="habit-row__streak"
              title={`${streak.current} ${streak.unit}${streak.current === 1 ? '' : 's'} in a row`}
            >
              <Flame size={13} strokeWidth={2} />
              {streak.current}
            </span>
          )}

          <span className="habit-row__frequency">{frequencyLabel(habit.frequency)}</span>

          <div className="habit-row__menu" ref={menuRef}>
            <IconButton
              icon={MoreVertical}
              label={`Options for ${habit.name}`}
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
            />

            {menuOpen && (
              <div className="menu" role="menu">
                <button type="button" role="menuitem" className="menu__item" onClick={runMenuAction(onEdit)}>
                  <Pencil size={16} strokeWidth={1.8} />
                  Edit habit
                </button>

                <button type="button" role="menuitem" className="menu__item" onClick={runMenuAction(onArchive)}>
                  {habit.archived ? (
                    <>
                      <ArchiveRestore size={16} strokeWidth={1.8} />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive size={16} strokeWidth={1.8} />
                      Archive
                    </>
                  )}
                </button>

                <div className="menu__divider" />

                <button
                  type="button"
                  role="menuitem"
                  className="menu__item menu__item--danger"
                  onClick={runMenuAction(onDelete)}
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="habit-row__days">
        {days.map((date) => (
          <DayCell
            key={date}
            date={date}
            habitName={habit.name}
            completed={isCompleted(date)}
            scheduled={isScheduledOn(habit, weekdayOf(date))}
            onToggle={onToggle}
          />
        ))}
      </div>
    </article>
  );
}
