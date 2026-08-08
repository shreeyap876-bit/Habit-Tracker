import { useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabits } from '../context/HabitsContext.jsx';
import useApi from '../hooks/useApi.js';
import coachApi from '../api/coach.js';
import { statsApi } from '../api/habits.js';
import { toErrorMessage } from '../api/client.js';
import { todayKey } from '../utils/date.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ChatBubble from '../components/coach/ChatBubble.jsx';
import ChatComposer from '../components/coach/ChatComposer.jsx';

const SUGGESTIONS = [
  'How am I doing this week?',
  'I keep skipping my evening habit — help?',
  'Suggest one habit I could add',
  'I lost my streak and feel stuck',
];

const TONES = [
  { id: 'gentle', name: 'Gentle', desc: 'Warm, patient, never pushy' },
  { id: 'balanced', name: 'Balanced', desc: 'Encouraging with practical tips' },
  { id: 'direct', name: 'Direct', desc: 'Straight to the point' },
];

export default function Coach() {
  const { user, updateProfile } = useAuth();
  const { habits, revision } = useHabits();
  const today = todayKey();

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const { data: history, loading: historyLoading } = useApi(() => coachApi.history(), []);
  const { data: stats } = useApi(() => statsApi.overview(today), [today, revision]);

  const logRef = useRef(null);

  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    const element = logRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, sending]);

  const handleSend = async (text) => {
    const optimistic = {
      id: `pending-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimistic]);
    setSending(true);

    try {
      const saved = await coachApi.send(text, today);
      setMessages((current) => [...current.filter((m) => m.id !== optimistic.id), ...saved]);
    } catch (error) {
      setMessages((current) => current.filter((m) => m.id !== optimistic.id));
      toast.error(toErrorMessage(error, 'Your coach could not reply'));
    } finally {
      setSending(false);
    }
  };

  const handleToneChange = async (tone) => {
    try {
      await updateProfile({ coachTone: tone });
      toast.success('Coaching style updated');
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not update your coaching style'));
    }
  };

  const handleClear = async () => {
    await coachApi.clear();
    setMessages([]);
    toast.success('Conversation cleared');
  };

  return (
    <div className="stack">
      <header className="page__head">
        <div>
          <h1 className="page__title">AI Habit Coach</h1>
          <p className="page__subtitle">
            Your coach can see your habits, streaks and this week&rsquo;s progress.
          </p>
        </div>
        <div className="page__actions">
          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setClearOpen(true)} disabled={!messages.length}>
            Clear chat
          </Button>
        </div>
      </header>

      <div className="coach">
        <section className="chat">
          <header className="chat__header">
            <span className="chat__avatar">
              <Sparkles size={18} strokeWidth={1.9} />
            </span>
            <div>
              <p className="chat__title">Your habit coach</p>
              <p className="chat__status">Grounded in your live habit data</p>
            </div>
          </header>

          <div className="chat__log" ref={logRef}>
            {historyLoading ? (
              <p style={{ color: 'var(--muted)' }}>Loading your conversation…</p>
            ) : messages.length === 0 ? (
              <EmptyState
                icon={MessageSquarePlus}
                title="Say hello to your coach"
                message={
                  habits.length
                    ? 'Ask about a habit you are struggling with, or how your week is going.'
                    : 'Add a habit first, then your coach can give advice grounded in your own routine.'
                }
              />
            ) : (
              messages.map((message) => <ChatBubble key={message.id} message={message} />)
            )}

            {sending && (
              <div className="bubble bubble--coach">
                <span className="bubble__mark" aria-hidden="true">
                  <Sparkles size={15} strokeWidth={2} />
                </span>
                <div className="bubble__body">
                  <span className="typing" aria-label="Your coach is typing">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
          </div>

          {messages.length === 0 && !historyLoading && (
            <div className="chat__suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="chip chip--interactive"
                  onClick={() => handleSend(suggestion)}
                  disabled={sending}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <ChatComposer onSend={handleSend} disabled={sending} />
        </section>

        <aside className="coach__aside">
          <Card title="What your coach sees">
            <div className="coach__snapshot">
              <p className="coach__snapshot-row">
                <span>Active habits</span>
                <strong>{stats?.activeHabits ?? habits.length}</strong>
              </p>
              <p className="coach__snapshot-row">
                <span>Today</span>
                <strong>
                  {stats ? `${stats.today.completed}/${stats.today.scheduled}` : '—'}
                </strong>
              </p>
              <p className="coach__snapshot-row">
                <span>This week</span>
                <strong>{stats ? `${stats.week.rate}%` : '—'}</strong>
              </p>
              <p className="coach__snapshot-row">
                <span>Best streak</span>
                <strong>
                  {stats ? `${stats.bestStreak.current} ${stats.bestStreak.unit}s` : '—'}
                </strong>
              </p>
            </div>
          </Card>

          <Card title="Coaching style">
            <div className="tone-options">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  className={`tone-option ${
                    user?.coachTone === tone.id ? 'tone-option--active' : ''
                  }`.trim()}
                  aria-pressed={user?.coachTone === tone.id}
                  onClick={() => handleToneChange(tone.id)}
                >
                  <span className="tone-option__name">{tone.name}</span>
                  <span className="tone-option__desc" style={{ display: 'block' }}>
                    {tone.desc}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Clear this conversation?"
        message="Your habits and history stay untouched — only the chat is removed."
        confirmLabel="Clear chat"
        onClose={() => setClearOpen(false)}
        onConfirm={handleClear}
      />
    </div>
  );
}
