import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { toErrorMessage } from '../../api/client.js';
import {
  HABIT_COLORS,
  WEEKDAY_ORDER,
  defaultFrequency,
  weekdayName,
} from '../../utils/habitTheme.js';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Modal from '../ui/Modal.jsx';
import EmojiPicker from './EmojiPicker.jsx';

const emptyHabit = () => ({
  name: '',
  description: '',
  emoji: '🌱',
  color: 'sage',
  frequency: defaultFrequency(),
});

/** Maps a habit document onto the form's own state shape. */
const toFormState = (habit) =>
  habit
    ? {
        name: habit.name,
        description: habit.description ?? '',
        emoji: habit.emoji,
        color: habit.color,
        frequency: {
          type: habit.frequency?.type ?? 'daily',
          days: habit.frequency?.days ?? [0, 1, 2, 3, 4, 5, 6],
          timesPerWeek: habit.frequency?.timesPerWeek ?? 3,
        },
      }
    : emptyHabit();

/**
 * Create/edit dialog for a habit. `habit` being present switches it to edit
 * mode; otherwise it creates.
 */
export default function HabitFormModal({ open, habit, onClose, onSubmit }) {
  const [form, setForm] = useState(toFormState(habit));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Reset whenever the dialog is opened for a different habit.
  useEffect(() => {
    if (open) {
      setForm(toFormState(habit));
      setErrors({});
    }
  }, [open, habit]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const setFrequency = (patch) =>
    setForm((current) => ({ ...current, frequency: { ...current.frequency, ...patch } }));

  const toggleDay = (weekday) =>
    setForm((current) => {
      const days = current.frequency.days.includes(weekday)
        ? current.frequency.days.filter((day) => day !== weekday)
        : [...current.frequency.days, weekday];
      return { ...current, frequency: { ...current.frequency, days } };
    });

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Give your habit a name';
    if (form.name.trim().length > 60) next.name = 'Keep the name under 60 characters';
    if (form.frequency.type === 'specific' && form.frequency.days.length === 0) {
      next.frequency = 'Pick at least one day';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        emoji: form.emoji,
        color: form.color,
        frequency: form.frequency,
      });
      onClose();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not save this habit'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={habit ? 'Edit habit' : 'New habit'}
      subtitle={habit ? 'Update how you track this one.' : 'Start small — one clear, doable thing.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            {habit ? 'Save changes' : 'Create habit'}
          </Button>
        </>
      }
    >
      <form className="habit-form" onSubmit={handleSubmit}>
        <div className="habit-form__row">
          <Field label="Icon">
            <EmojiPicker value={form.emoji} onChange={(emoji) => setField('emoji', emoji)} />
          </Field>

          <Field label="Habit name" error={errors.name}>
            {(id) => (
              <input
                id={id}
                className="input"
                value={form.name}
                maxLength={60}
                placeholder="Read 15 pages"
                autoFocus
                onChange={(event) => setField('name', event.target.value)}
              />
            )}
          </Field>
        </div>

        <Field label="Note" hint="Optional — a reminder of why this one matters.">
          {(id) => (
            <input
              id={id}
              className="input"
              value={form.description}
              maxLength={200}
              placeholder="Right after the morning coffee"
              onChange={(event) => setField('description', event.target.value)}
            />
          )}
        </Field>

        <Field label="Colour">
          <div className="color-swatches">
            {HABIT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                data-color={color}
                className={`color-swatch ${form.color === color ? 'color-swatch--selected' : ''}`.trim()}
                aria-label={color}
                aria-pressed={form.color === color}
                onClick={() => setField('color', color)}
              />
            ))}
          </div>
        </Field>

        <Field label="How often?" error={errors.frequency}>
          {(id) => (
            <select
              id={id}
              className="select"
              value={form.frequency.type}
              onChange={(event) => setFrequency({ type: event.target.value })}
            >
              <option value="daily">Every day</option>
              <option value="specific">On certain days</option>
              <option value="weekly">A number of times a week</option>
            </select>
          )}
        </Field>

        {form.frequency.type === 'specific' && (
          <Field label="Which days?">
            <div className="day-toggles">
              {WEEKDAY_ORDER.map((weekday) => (
                <button
                  key={weekday}
                  type="button"
                  className={`day-toggle ${
                    form.frequency.days.includes(weekday) ? 'day-toggle--on' : ''
                  }`.trim()}
                  aria-pressed={form.frequency.days.includes(weekday)}
                  onClick={() => toggleDay(weekday)}
                >
                  {weekdayName(weekday)}
                </button>
              ))}
            </div>
          </Field>
        )}

        {form.frequency.type === 'weekly' && (
          <Field label="Times per week">
            {(id) => (
              <select
                id={id}
                className="select"
                value={form.frequency.timesPerWeek}
                onChange={(event) => setFrequency({ timesPerWeek: Number(event.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((times) => (
                  <option key={times} value={times}>
                    {times} {times === 1 ? 'time' : 'times'} a week
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}

        {/* Lets Enter submit the form without a visible duplicate button. */}
        <button type="submit" className="visually-hidden" tabIndex={-1} aria-hidden="true">
          Save
        </button>
      </form>
    </Modal>
  );
}
