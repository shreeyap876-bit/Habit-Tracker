/**
 * Illustration for the sign-in welcome panel: a habit sheet being filled in,
 * with a plant beside it. Drawn inline so it inherits the palette tokens and
 * ships without an image request.
 */
export default function WelcomeArt() {
  return (
    <svg viewBox="0 0 320 200" fill="none" role="img" aria-label="A weekly habit sheet with a plant">
      {/* Backdrop */}
      <ellipse cx="168" cy="176" rx="130" ry="16" fill="var(--surface-3)" />
      <circle cx="52" cy="44" r="26" fill="var(--habit-amber-soft)" />
      <circle cx="288" cy="34" r="12" fill="var(--accent-soft)" />

      {/* Habit sheet */}
      <rect x="66" y="26" width="176" height="136" rx="14" fill="var(--surface)" stroke="var(--border-strong)" />
      <rect x="82" y="42" width="62" height="8" rx="4" fill="var(--ink)" opacity="0.75" />
      <rect x="82" y="56" width="38" height="6" rx="3" fill="var(--muted-soft)" />

      {[0, 1, 2].map((row) => {
        const y = 78 + row * 28;
        const colors = ['var(--habit-sage)', 'var(--habit-clay)', 'var(--habit-sky)'];
        const softs = ['var(--habit-sage-soft)', 'var(--habit-clay-soft)', 'var(--habit-sky-soft)'];
        const filled = [4, 3, 2][row];

        return (
          <g key={row}>
            <rect x="82" y={y - 8} width="144" height="22" rx="8" fill={softs[row]} />
            <rect x="90" y={y - 1} width="34" height="7" rx="3.5" fill={colors[row]} opacity="0.55" />
            {[0, 1, 2, 3, 4].map((day) => (
              <g key={day}>
                <circle
                  cx={140 + day * 18}
                  cy={y + 3}
                  r="7"
                  fill={day < filled ? colors[row] : 'transparent'}
                  stroke={day < filled ? colors[row] : 'var(--surface)'}
                  strokeWidth="2"
                />
                {day < filled && (
                  <path
                    d={`M${136.5 + day * 18} ${y + 3}l2.5 2.5 4.5-4.8`}
                    stroke="var(--surface)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            ))}
          </g>
        );
      })}

      {/* Plant */}
      <path d="M40 168V126" stroke="var(--habit-sage-deep)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M40 138c-14-2-21-11-20-24 13-1 21 8 20 24Z"
        fill="var(--habit-sage)"
        opacity="0.9"
      />
      <path d="M40 130c12-4 17-13 15-25-12 2-18 11-15 25Z" fill="var(--habit-sage-deep)" opacity="0.75" />
      <path
        d="M26 166h28l-3 20a4 4 0 0 1-4 3.4H33a4 4 0 0 1-4-3.4l-3-20Z"
        fill="var(--habit-clay)"
      />

      {/* Floating tick */}
      <circle cx="252" cy="122" r="20" fill="var(--habit-sage-soft)" />
      <path
        d="M244 122.5l5.5 5.5 11-12"
        stroke="var(--habit-sage-deep)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
