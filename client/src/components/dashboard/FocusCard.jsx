import { Link } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';
import { greeting } from '../../utils/date.js';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';

/**
 * "Today's mindful focus" — the AI coach's daily nudge, styled after the hero
 * block in the inspiration board.
 */
export default function FocusCard({ name, tip, loading, error, onRefresh }) {
  const firstName = name?.split(' ')[0] ?? 'there';

  return (
    <section className="focus-card">
      <div>
        <p className="eyebrow">Today</p>
        <h2 className="focus-card__heading">
          Today&rsquo;s
          <br />
          mindful
          <br />
          focus
        </h2>
        <p className="focus-card__greeting">
          {greeting()}, {firstName}. Here is your nudge for the day.
        </p>
      </div>

      <div className="focus-card__panel">
        {loading ? (
          <div className="row" style={{ color: 'var(--muted)' }}>
            <Spinner />
            <span>Your coach is thinking…</span>
          </div>
        ) : error ? (
          <p className="focus-card__tip focus-card__tip--placeholder">{error}</p>
        ) : (
          <p className="focus-card__tip">{tip}</p>
        )}

        <div className="focus-card__foot">
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={onRefresh} disabled={loading}>
            New nudge
          </Button>
          <Link to="/coach" className="chip chip--interactive">
            <Sparkles size={13} strokeWidth={2} />
            Talk to your coach
          </Link>
        </div>
      </div>
    </section>
  );
}
