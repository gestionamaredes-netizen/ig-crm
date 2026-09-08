import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS } from '../styles/tokens';
import { ScreenText } from './index';

interface ChatWindowProps {
  messages: string[];
  typingSpeed?: number;
  fontSize?: number;
}

/**
 * ChatWindow - Componente MSN/Fotolog interactivo
 * Simula escritura gradual de mensajes con cursor parpadeante
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  typingSpeed = 2,
  fontSize = 12,
}) => {
  const frame = useCurrentFrame();

  // Calcula cuántos caracteres mostrar basado en frame actual
  const totalChars = messages.join('\n').length;
  const charsToShow = Math.floor((frame / typingSpeed) % (totalChars + 1));

  // Cursor parpadeante
  const showCursor = Math.floor((frame / 10) % 2) === 0;

  let charCount = 0;
  const displayedMessages = messages
    .map(msg => {
      const msgChars = msg.length;
      if (charCount >= charsToShow) {
        return '';
      }
      if (charCount + msgChars <= charsToShow) {
        charCount += msgChars;
        return msg;
      }
      const partial = msg.substring(0, charsToShow - charCount);
      charCount = charsToShow;
      return partial;
    })
    .filter(msg => msg.length > 0);

  return (
    <div
      style={{
        fontFamily: 'MS Sans Serif, Arial, sans-serif',
        fontSize,
        color: COLORS.black,
        lineHeight: 1.4,
        minHeight: '60px',
      }}
    >
      {displayedMessages.map((msg, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          {msg}
        </div>
      ))}
      {showCursor && <span style={{ color: COLORS.red }}>|</span>}
    </div>
  );
};
