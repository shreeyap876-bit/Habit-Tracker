import { Sparkles } from 'lucide-react';
import { timeLabel } from '../../utils/date.js';

/**
 * Renders the light markdown the coach tends to use — `**bold**` and `- ` list
 * items — without pulling in a full markdown parser for two cases.
 */
function renderContent(text) {
  return text.split('\n').map((line, lineIndex) => {
    const isBullet = /^\s*[-*]\s+/.test(line);
    const content = isBullet ? line.replace(/^\s*[-*]\s+/, '') : line;

    const parts = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    const rendered = parts.map((part, partIndex) =>
      part.startsWith('**') && part.endsWith('**') ? (
        // eslint-disable-next-line react/no-array-index-key -- static split, stable order
        <strong key={partIndex}>{part.slice(2, -2)}</strong>
      ) : (
        // eslint-disable-next-line react/no-array-index-key -- static split, stable order
        <span key={partIndex}>{part}</span>
      )
    );

    return (
      // eslint-disable-next-line react/no-array-index-key -- lines are positional
      <div key={lineIndex} style={isBullet ? { paddingLeft: '1em', textIndent: '-1em' } : undefined}>
        {isBullet ? '• ' : null}
        {rendered}
      </div>
    );
  });
}

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--coach'}`}>
      {!isUser && (
        <span className="bubble__mark" aria-hidden="true">
          <Sparkles size={15} strokeWidth={2} />
        </span>
      )}

      <div>
        <div className="bubble__body">{renderContent(message.content)}</div>
        {message.createdAt && <p className="bubble__time">{timeLabel(message.createdAt)}</p>}
      </div>
    </div>
  );
}
