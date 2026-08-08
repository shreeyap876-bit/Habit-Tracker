import { CheckCircle2, Flame, Sparkles } from 'lucide-react';
import WelcomeArt from '../ui/WelcomeArt.jsx';

/**
 * Shared frame for the sign-in and sign-up screens: the decorative background
 * and the welcome panel from the wireframe, with the form card passed in as
 * children.
 */
export default function AuthShell({ children }) {
  return (
    <div className="auth">
      <div className="auth__blob auth__blob--1" aria-hidden="true" />
      <div className="auth__blob auth__blob--2" aria-hidden="true" />
      <div className="auth__blob auth__blob--3" aria-hidden="true" />

      <div className="auth__grid">
        <section className="auth-card auth-card--welcome">
          <p className="eyebrow auth-card__eyebrow">Habit Tracker</p>
          <h1 className="auth-card__title">Welcome</h1>
          <p className="auth-card__subtitle">
            Build routines, track progress and stay motivated — with a coach that knows your habits.
          </p>

          <div className="auth-card__art">
            <WelcomeArt />
          </div>

          <ul className="auth-card__list">
            <li>
              <CheckCircle2 size={17} strokeWidth={1.9} />
              Tick off your week on a single, simple grid
            </li>
            <li>
              <Flame size={17} strokeWidth={1.9} />
              Watch streaks build day after day
            </li>
            <li>
              <Sparkles size={17} strokeWidth={1.9} />
              Get personalised coaching when motivation dips
            </li>
          </ul>
        </section>

        {children}
      </div>
    </div>
  );
}

/** Decorative branch echoing the botanical detail in the wireframe. */
export function LeafOrnament() {
  return (
    <svg className="auth-card__leaf" viewBox="0 0 200 120" fill="none" aria-hidden="true">
      <path
        d="M12 108C48 92 84 70 118 40c12-11 24-20 38-26"
        stroke="var(--habit-sage-deep)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {[
        [40, 92, -28],
        [62, 78, -24],
        [84, 62, -20],
        [104, 46, -14],
        [124, 32, -8],
      ].map(([x, y, rotate], index) => (
        <g key={x} transform={`rotate(${rotate} ${x} ${y})`}>
          <ellipse
            cx={x}
            cy={y}
            rx="17"
            ry="8"
            fill={index % 2 === 0 ? 'var(--habit-sage)' : 'var(--habit-sage-deep)'}
            opacity={index % 2 === 0 ? 0.85 : 0.6}
          />
          <ellipse cx={x} cy={y - 16} rx="15" ry="7" fill="var(--habit-sage-soft)" />
        </g>
      ))}
      <circle cx="24" cy="26" r="13" fill="var(--accent-soft)" />
      <circle cx="170" cy="76" r="18" fill="var(--habit-amber-soft)" opacity="0.9" />
    </svg>
  );
}
